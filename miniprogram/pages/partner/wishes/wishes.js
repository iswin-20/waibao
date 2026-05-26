const api = require('../../../utils/api');
const fmt = require('../../../utils/format');

function decorateWish(item) {
  return Object.assign({}, item, {
    categoryText: fmt.categoryLabel(item.category),
    progress: item.progress || 0
  });
}

Page({
  data: {
    loading: true,
    wishes: [],
    claimingId: ''
  },

  onShow() {
    if (!api.ensureLogin()) return;
    this.load();
  },

  load() {
    this.setData({ loading: true });
    api.request({ url: '/api/partner/status' })
      .then((res) => {
        this.setData({ wishes: (res.data.recentWishes || []).map(decorateWish) });
      })
      .catch((error) => {
        wx.showToast({ title: error.error || '加载失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  claimWish(event) {
    const wishId = event.currentTarget.dataset.id;
    if (!wishId) return;
    this.setData({ claimingId: wishId });
    api.request({
      url: '/api/partner/claim-wish',
      method: 'POST',
      data: { wishId }
    }).then(() => {
      wx.showToast({ title: '已认领', icon: 'success' });
      this.load();
    }).catch((error) => {
      wx.showToast({ title: error.error || '认领失败', icon: 'none' });
    }).finally(() => {
      this.setData({ claimingId: '' });
    });
  }
});
