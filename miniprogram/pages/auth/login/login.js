const api = require('../../../utils/api');

Page({
  data: {
    email: '',
    password: '',
    loading: false,
    apiOk: false,
    apiStatus: '正在检测后端连接...',
    apiBaseUrl: ''
  },

  onLoad() {
    this.checkApi();
    const token = wx.getStorageSync('token');
    const app = getApp();
    if (token) {
      wx.redirectTo({ url: app.getHomePage() });
    }
  },

  onShow() {
    this.setData({ apiBaseUrl: api.getActiveBaseUrl() });
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [field]: event.detail.value });
  },

  submit() {
    const { email, password, loading } = this.data;
    if (loading) return;
    if (!email.trim() || !password) {
      wx.showToast({ title: '请填写邮箱和密码', icon: 'none' });
      return;
    }

    this.setData({ loading: true });
    api.login(email.trim(), password)
      .then((data) => {
        const app = getApp();
        wx.redirectTo({ url: app.getHomePage(data.user) });
      })
      .catch((error) => {
        wx.showToast({ title: error.error || '登录失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  demoLogin(event) {
    const role = event.currentTarget.dataset.role;
    const email = role === 'partner' ? 'partner@test.com' : 'waibao@test.com';
    this.setData({ email, password: '123456' }, () => this.submit());
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

  goRegister() {
    wx.navigateTo({ url: '/pages/auth/register/register' });
  }
});
