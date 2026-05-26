const api = require('../../../utils/api');
const fmt = require('../../../utils/format');

const tips = [
  '发一条简单真诚的消息，问问今天累不累。',
  '如果她今天不太开心，先听她说完，再给拥抱和支持。',
  '可以准备一点她喜欢吃的东西，小事也很有力量。',
  '提醒她好好吃饭、喝水、早点休息，但语气要轻一点。'
];

function decorateDate(item) {
  const days = fmt.getDaysUntil(item.date);
  return Object.assign({}, item, {
    dateText: fmt.formatDate(item.date),
    daysText: days <= 0 ? '今天' : `${days}天后`
  });
}

function decorateWish(item) {
  return Object.assign({}, item, {
    categoryText: fmt.categoryLabel(item.category),
    progress: item.progress || 0
  });
}

Page({
  data: {
    loading: true,
    status: null,
    partnerInitial: '宝',
    moodText: '平稳',
    dailyTip: tips[0],
    wishes: [],
    dates: []
  },

  onShow() {
    if (!api.ensureLogin()) return;
    this.load();
  },

  load() {
    this.setData({
      loading: true,
      dailyTip: tips[Math.floor(Math.random() * tips.length)]
    });
    api.request({ url: '/api/partner/status' })
      .then((res) => {
        const status = res.data;
        const moodText = status.todayMood
          ? fmt.emotionLabel(status.todayMood.emotionLevel)
          : '平稳';
        this.setData({
          status,
          partnerInitial: (status.user.nickname || '宝').slice(0, 1),
          moodText,
          wishes: (status.recentWishes || []).map(decorateWish),
          dates: (status.upcomingDates || []).map(decorateDate)
        });
      })
      .catch(() => {
        this.setData({ status: null });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  goProfile() {
    wx.redirectTo({ url: '/pages/profile/profile' });
  },

  goWishes() {
    wx.redirectTo({ url: '/pages/partner/wishes/wishes' });
  }
});
