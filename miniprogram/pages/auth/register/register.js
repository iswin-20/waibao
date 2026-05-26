const api = require('../../../utils/api');

Page({
  data: {
    nickname: '',
    email: '',
    password: '',
    role: 'waibao',
    bindCode: '',
    loading: false,
    apiOk: false,
    apiStatus: '正在检测后端连接...',
    apiBaseUrl: ''
  },

  onLoad() {
    this.checkApi();
  },

  onShow() {
    this.setData({ apiBaseUrl: api.getActiveBaseUrl() });
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [field]: event.detail.value });
  },

  chooseRole(event) {
    this.setData({ role: event.currentTarget.dataset.role });
  },

  checkApi() {
    this.setData({
      apiStatus: '正在检测后端连接...',
      apiBaseUrl: api.getActiveBaseUrl(),
    });

    api.ping()
      .then(() => {
        this.setData({
          apiOk: true,
          apiStatus: '后端已连接',
          apiBaseUrl: api.getActiveBaseUrl(),
        });
      })
      .catch((error) => {
        this.setData({
          apiOk: false,
          apiStatus: error.error || '后端连接失败',
          apiBaseUrl: error.url || api.getActiveBaseUrl(),
        });
      });
  },

  submit() {
    const { nickname, email, password, role, bindCode, loading } = this.data;
    if (loading) return;
    if (!nickname.trim() || !email.trim() || !password) {
      wx.showToast({ title: '请填写昵称、邮箱和密码', icon: 'none' });
      return;
    }
    if (password.length < 6) {
      wx.showToast({ title: '密码至少 6 位', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    api.register({
      nickname: nickname.trim(),
      email: email.trim(),
      password,
      role
    })
      .then((data) => {
        if (bindCode.trim()) {
          return api.request({
            url: '/api/couples/bind',
            method: 'POST',
            data: { bindCode: bindCode.trim().toUpperCase() }
          }).catch((error) => {
            wx.showToast({ title: error.error || '邀请码绑定失败，可稍后在我的页面绑定', icon: 'none' });
          }).then(() => data);
        }
        return data;
      })
      .then((data) => {
        const app = getApp();
        wx.redirectTo({ url: app.getHomePage(data.user) });
      })
      .catch((error) => {
        wx.showToast({ title: error.error || '注册失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  goLogin() {
    wx.navigateBack({
      fail() {
        wx.redirectTo({ url: '/pages/auth/login/login' });
      }
    });
  }
});
