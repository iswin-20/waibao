const env = require('../env');

const API_BASE_URLS = (env.API_BASE_URLS && env.API_BASE_URLS.length
  ? env.API_BASE_URLS
  : [env.API_BASE_URL]
).filter(Boolean);

let activeBaseUrl = wx.getStorageSync('apiBaseUrl') || env.API_BASE_URL || API_BASE_URLS[0] || '';

function getAppSafe() {
  try {
    return getApp();
  } catch (error) {
    return null;
  }
}

function normalizeUrl(url, baseUrl) {
  if (/^https?:\/\//.test(url)) return url;
  const base = (baseUrl || activeBaseUrl).replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

function getBaseUrlCandidates(url) {
  if (/^https?:\/\//.test(url)) return [''];
  const list = [activeBaseUrl].concat(API_BASE_URLS);
  return list.filter((item, index) => item && list.indexOf(item) === index);
}

function rememberBaseUrl(baseUrl) {
  if (!baseUrl) return;
  activeBaseUrl = baseUrl;
  wx.setStorageSync('apiBaseUrl', baseUrl);
}

function getActiveBaseUrl() {
  return activeBaseUrl;
}

function redirectToLogin() {
  const pages = getCurrentPages();
  const current = pages.length ? pages[pages.length - 1].route : '';
  if (current !== 'pages/auth/login/login') {
    wx.redirectTo({ url: '/pages/auth/login/login' });
  }
}

function saveSession(data) {
  const app = getAppSafe();
  const payload = data || {};
  if (payload.token) wx.setStorageSync('token', payload.token);
  if (payload.user) wx.setStorageSync('user', payload.user);
  if (app && app.setSession) app.setSession(payload);
}

function clearSession() {
  const app = getAppSafe();
  wx.removeStorageSync('token');
  wx.removeStorageSync('user');
  if (app && app.clearSession) app.clearSession();
}

function request(options) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    loadingText = '',
    skipUnauthorizedRedirect = false
  } = options;

  const token = wx.getStorageSync('token');
  const headers = Object.assign({ 'Content-Type': 'application/json' }, header);
  if (token) headers.Authorization = `Bearer ${token}`;

  if (loadingText) wx.showLoading({ title: loadingText, mask: true });

  const candidates = getBaseUrlCandidates(url);

  return new Promise((resolve, reject) => {
    const tryRequest = (index) => {
      const baseUrl = candidates[index] || activeBaseUrl;
      const requestUrl = normalizeUrl(url, baseUrl);

      wx.request({
        url: requestUrl,
        method,
        data,
        header: headers,
        success(res) {
          const body = res.data || {};
          const ok = res.statusCode >= 200 && res.statusCode < 300 && body.success !== false;

          if (res.statusCode === 401) {
            clearSession();
            if (!skipUnauthorizedRedirect) redirectToLogin();
            reject(body);
            return;
          }

          if (ok) {
            rememberBaseUrl(baseUrl);
            resolve(body);
            return;
          }

          reject(Object.assign({ statusCode: res.statusCode, url: requestUrl }, body));
        },
        fail(error) {
          if (index < candidates.length - 1) {
            tryRequest(index + 1);
            return;
          }

          reject({
            error: error.errMsg || '网络请求失败',
            url: requestUrl,
          });
        },
        complete() {
          if (loadingText) wx.hideLoading();
        }
      });
    };

    tryRequest(0);
  });
}

function upload(options) {
  const {
    url,
    filePath,
    name = 'file',
    formData = {},
    loadingText = '',
  } = options;

  const token = wx.getStorageSync('token');
  const header = {};
  if (token) header.Authorization = `Bearer ${token}`;
  if (loadingText) wx.showLoading({ title: loadingText, mask: true });

  const candidates = getBaseUrlCandidates(url);

  return new Promise((resolve, reject) => {
    const tryUpload = (index) => {
      const baseUrl = candidates[index] || activeBaseUrl;
      const requestUrl = normalizeUrl(url, baseUrl);

      wx.uploadFile({
        url: requestUrl,
        filePath,
        name,
        formData,
        header,
        success(res) {
          let body = {};
          try {
            body = JSON.parse(res.data || '{}');
          } catch (error) {
            body = { error: res.data || '上传响应解析失败' };
          }

          const ok = res.statusCode >= 200 && res.statusCode < 300 && body.success !== false;
          if (res.statusCode === 401) {
            clearSession();
            redirectToLogin();
            reject(body);
            return;
          }
          if (ok) {
            rememberBaseUrl(baseUrl);
            resolve(body);
            return;
          }
          reject(Object.assign({ statusCode: res.statusCode, url: requestUrl }, body));
        },
        fail(error) {
          if (index < candidates.length - 1) {
            tryUpload(index + 1);
            return;
          }
          reject({
            error: error.errMsg || '上传失败',
            url: requestUrl,
          });
        },
        complete() {
          if (loadingText) wx.hideLoading();
        }
      });
    };

    tryUpload(0);
  });
}

function login(email, password) {
  return request({
    url: '/api/auth/login',
    method: 'POST',
    data: { email, password },
    loadingText: '登录中',
    skipUnauthorizedRedirect: true
  }).then((res) => {
    saveSession(res.data);
    return res.data;
  });
}

function register(payload) {
  return request({
    url: '/api/auth/register',
    method: 'POST',
    data: payload,
    loadingText: '注册中',
    skipUnauthorizedRedirect: true
  }).then((res) => {
    saveSession(res.data);
    return res.data;
  });
}

function logout() {
  return request({ url: '/api/auth/logout', method: 'POST' })
    .catch(() => null)
    .then(() => {
      clearSession();
    });
}

function getMe() {
  return request({ url: '/api/auth/me' }).then((res) => {
    if (res.data) saveSession({ user: res.data });
    return res.data;
  });
}

function ping() {
  return request({
    url: '/api/health',
    skipUnauthorizedRedirect: true,
  });
}

function ensureLogin() {
  if (wx.getStorageSync('token')) return true;
  redirectToLogin();
  return false;
}

module.exports = {
  request,
  upload,
  login,
  register,
  logout,
  getMe,
  ping,
  ensureLogin,
  saveSession,
  clearSession,
  getActiveBaseUrl
};
