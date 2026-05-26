const api = require('../../utils/api');
const fmt = require('../../utils/format');

function decorateDate(item) {
  return Object.assign({}, item, {
    dateText: fmt.formatDate(item.date),
    categoryText: fmt.categoryLabel(item.category)
  });
}

Page({
  data: {
    user: {},
    avatarText: '歪',
    couple: null,
    coupleText: '尚未绑定',
    importantDates: [],
    activeModal: '',
    saving: false,
    bindCode: '',
    profileForm: {},
    dateForm: {
      title: '',
      date: '',
      category: 'anniversary'
    },
    genderOptions: [
      { value: '', label: '不显示' },
      { value: 'female', label: '女生' },
      { value: 'male', label: '男生' },
      { value: 'other', label: '其他' }
    ],
    dateCategories: [
      { value: 'anniversary', label: '纪念日' },
      { value: 'birthday', label: '生日' },
      { value: 'holiday', label: '节日' },
      { value: 'custom', label: '其他' }
    ]
  },

  onShow() {
    if (!api.ensureLogin()) return;
    this.load();
  },

  load() {
    Promise.allSettled([
      api.getMe(),
      api.request({ url: '/api/couples/status' }),
      api.request({ url: '/api/important-dates' })
    ]).then((results) => {
      const user = results[0].status === 'fulfilled' ? results[0].value : wx.getStorageSync('user') || {};
      const couple = results[1].status === 'fulfilled' ? results[1].value.data : null;
      const dates = results[2].status === 'fulfilled' ? (results[2].value.data.dates || []).map(decorateDate) : [];
      const avatarText = (user.nickname || '歪').slice(0, 1);
      let coupleText = '尚未绑定';
      if (couple && couple.status === 'pending') coupleText = `邀请码 ${couple.bindCode}`;
      if (couple && couple.status === 'active') coupleText = `已绑定 ${couple.partner && couple.partner.nickname ? couple.partner.nickname : '另一半'}`;
      if (couple && couple.loveStartDate) couple.loveStartText = fmt.formatDate(couple.loveStartDate);

      this.setData({
        user,
        avatarText,
        couple,
        coupleText,
        importantDates: dates
      });
    });
  },

  openProfile() {
    const user = this.data.user || {};
    this.setData({
      activeModal: 'profile',
      profileForm: {
        nickname: user.nickname || '',
        birthday: user.birthday ? String(user.birthday).split('T')[0] : '',
        gender: user.gender || '',
        loveNickname: user.loveNickname || '',
        comfortStyle: user.comfortStyle || '',
        dislikeStyle: user.dislikeStyle || '',
        mbti: user.mbti || ''
      }
    });
  },

  openDates() {
    this.setData({ activeModal: 'dates' });
  },

  openCouple() {
    this.setData({ activeModal: 'couple' });
  },

  closeModal() {
    this.setData({ activeModal: '' });
  },

  noop() {},

  onProfileInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`profileForm.${field}`]: event.detail.value });
  },

  onBirthdayChange(event) {
    this.setData({ 'profileForm.birthday': event.detail.value });
  },

  chooseProfile(event) {
    const { field, value } = event.currentTarget.dataset;
    this.setData({ [`profileForm.${field}`]: value });
  },

  saveProfile() {
    const form = this.data.profileForm;
    this.setData({ saving: true });
    api.request({
      url: '/api/users/profile',
      method: 'PUT',
      data: {
        nickname: form.nickname || null,
        birthday: form.birthday || null,
        gender: form.gender || null,
        loveNickname: form.loveNickname || null,
        comfortStyle: form.comfortStyle || null,
        dislikeStyle: form.dislikeStyle || null,
        mbti: form.mbti || null
      }
    }).then(() => {
      wx.showToast({ title: '已保存', icon: 'success' });
      this.setData({ activeModal: '' });
      this.load();
    }).catch((error) => {
      wx.showToast({ title: error.error || '保存失败', icon: 'none' });
    }).finally(() => {
      this.setData({ saving: false });
    });
  },

  onDateInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`dateForm.${field}`]: event.detail.value });
  },

  onDateChange(event) {
    this.setData({ 'dateForm.date': event.detail.value });
  },

  chooseDateCategory(event) {
    this.setData({ 'dateForm.category': event.currentTarget.dataset.value });
  },

  addDate() {
    const form = this.data.dateForm;
    if (!form.title.trim() || !form.date) {
      wx.showToast({ title: '请填写标题和日期', icon: 'none' });
      return;
    }
    this.setData({ saving: true });
    api.request({
      url: '/api/important-dates',
      method: 'POST',
      data: {
        title: form.title.trim(),
        date: form.date,
        category: form.category,
        repeatType: form.category === 'birthday' || form.category === 'anniversary' ? 'yearly' : 'none'
      }
    }).then(() => {
      wx.showToast({ title: '已添加', icon: 'success' });
      this.setData({
        dateForm: { title: '', date: '', category: 'anniversary' }
      });
      this.load();
    }).catch((error) => {
      wx.showToast({ title: error.error || '添加失败', icon: 'none' });
    }).finally(() => {
      this.setData({ saving: false });
    });
  },

  createBindCode() {
    this.setData({ saving: true });
    api.request({ url: '/api/couples/create', method: 'POST', data: {} })
      .then(() => {
        wx.showToast({ title: '已生成', icon: 'success' });
        this.load();
      })
      .catch((error) => {
        wx.showToast({ title: error.error || '生成失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ saving: false });
      });
  },

  copyBindCode() {
    const code = this.data.couple && this.data.couple.bindCode;
    if (code) wx.setClipboardData({ data: code });
  },

  onBindCodeInput(event) {
    this.setData({ bindCode: event.detail.value });
  },

  bindCouple() {
    const bindCode = this.data.bindCode.trim().toUpperCase();
    if (!bindCode) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' });
      return;
    }
    this.setData({ saving: true });
    api.request({
      url: '/api/couples/bind',
      method: 'POST',
      data: { bindCode }
    }).then(() => {
      wx.showToast({ title: '绑定成功', icon: 'success' });
      this.setData({ bindCode: '' });
      this.load();
    }).catch((error) => {
      wx.showToast({ title: error.error || '绑定失败', icon: 'none' });
    }).finally(() => {
      this.setData({ saving: false });
    });
  },

  unbindCouple() {
    wx.showModal({
      title: '确认解除绑定？',
      content: '解除后，双方将不再共享情侣状态。',
      success: (res) => {
        if (!res.confirm) return;
        this.setData({ saving: true });
        api.request({ url: '/api/couples/unbind', method: 'POST', data: {} })
          .then(() => {
            wx.showToast({ title: '已解除', icon: 'success' });
            this.load();
          })
          .catch((error) => {
            wx.showToast({ title: error.error || '解除失败', icon: 'none' });
          })
          .finally(() => {
            this.setData({ saving: false });
          });
      }
    });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (!res.confirm) return;
        api.logout().then(() => {
          wx.redirectTo({ url: '/pages/auth/login/login' });
        });
      }
    });
  }
});
