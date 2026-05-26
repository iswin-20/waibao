const { API_BASE_URL } = require('./env');

App({
  globalData: {
    apiBaseUrl: API_BASE_URL,
    token: '',
    user: null
  },

  onLaunch() {
    this.globalData.token = wx.getStorageSync('token') || '';
    this.globalData.user = wx.getStorageSync('user') || null;
  },

  setSession({ token, user }) {
    if (token) {
      this.globalData.token = token;
      wx.setStorageSync('token', token);
    }
    if (user) {
      this.globalData.user = user;
      wx.setStorageSync('user', user);
    }
  },

  clearSession() {
    this.globalData.token = '';
    this.globalData.user = null;
    wx.removeStorageSync('token');
    wx.removeStorageSync('user');
  },

  getHomePage(user) {
    const currentUser = user || this.globalData.user || wx.getStorageSync('user');
    return currentUser && currentUser.role === 'partner'
      ? '/pages/partner/home/home'
      : '/pages/today/today';
  }
});
