const api = require('../../../utils/api');

const allMessages = [
  { id: 'daily-1', category: '日常', text: '今天过得怎么样？我一直都在想你。' },
  { id: 'daily-2', category: '日常', text: '记得按时吃饭，别把自己忙得太累。' },
  { id: 'sweet-1', category: '甜话', text: '你是我今天最想见到的人，也是最想好好照顾的人。' },
  { id: 'sweet-2', category: '甜话', text: '想到你，很多普通的小事都会变得很亮。' },
  { id: 'comfort-1', category: '安慰', text: '如果今天很累，就先慢慢休息，我会一直在。' },
  { id: 'comfort-2', category: '安慰', text: '不开心可以慢慢说，我会认真听，不急着下结论。' },
  { id: 'care-1', category: '贴心', text: '多喝点水，早点睡，身体舒服一点最重要。' },
  { id: 'care-2', category: '贴心', text: '需要我帮忙的时候直接说，我很愿意。' }
];

Page({
  data: {
    categories: ['全部', '日常', '甜话', '安慰', '贴心'],
    activeCategory: '全部',
    messages: allMessages,
    sendingId: ''
  },

  onShow() {
    api.ensureLogin();
  },

  chooseCategory(event) {
    const category = event.currentTarget.dataset.category;
    this.setData({
      activeCategory: category,
      messages: category === '全部'
        ? allMessages
        : allMessages.filter((item) => item.category === category)
    });
  },

  sendAiComfort() {
    this.setData({ sendingId: 'ai' });
    api.request({
      url: '/api/partner/comfort',
      method: 'POST',
      data: {}
    }).then((res) => {
      const text = res.data && res.data.comfortText ? `：${res.data.comfortText}` : '';
      wx.showToast({ title: `已发送${text}`, icon: 'none', duration: 2600 });
    }).catch((error) => {
      wx.showToast({ title: error.error || '发送失败', icon: 'none' });
    }).finally(() => {
      this.setData({ sendingId: '' });
    });
  },

  sendComfort(event) {
    const id = event.currentTarget.dataset.id;
    const message = allMessages.find((item) => item.id === id);
    if (!message) return;
    this.setData({ sendingId: id });
    api.request({
      url: '/api/partner/comfort',
      method: 'POST',
      data: { comfortText: message.text }
    }).then(() => {
      wx.showToast({ title: '已发送', icon: 'success' });
    }).catch((error) => {
      wx.showToast({ title: error.error || '发送失败', icon: 'none' });
    }).finally(() => {
      this.setData({ sendingId: '' });
    });
  }
});
