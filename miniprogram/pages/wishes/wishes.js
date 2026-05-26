const api = require('../../utils/api');
const fmt = require('../../utils/format');

function badgeClass(category) {
  if (category === 'food') return 'badge-yellow';
  if (category === 'travel') return 'badge-green';
  if (category === 'movie') return 'badge-purple';
  return '';
}

function decorate(wish) {
  return Object.assign({}, wish, {
    categoryText: fmt.categoryLabel(wish.category || 'buy'),
    priorityText: fmt.priorityLabel(wish.priority),
    progress: wish.progress || 0,
    badgeClass: badgeClass(wish.category)
  });
}

Page({
  data: {
    loading: true,
    saving: false,
    activeTab: 'wanting',
    wishes: [],
    wantingWishes: [],
    completedWishes: [],
    showModal: false,
    form: {
      title: '',
      description: '',
      category: 'buy',
      priority: 'medium'
    },
    categoryOptions: [
      { value: 'buy', label: '想买' },
      { value: 'food', label: '想吃' },
      { value: 'travel', label: '想去' },
      { value: 'movie', label: '想看' }
    ],
    priorityOptions: [
      { value: 'low', label: '低' },
      { value: 'medium', label: '中' },
      { value: 'high', label: '高' }
    ]
  },

  onShow() {
    if (!api.ensureLogin()) return;
    this.load();
  },

  splitWishes(wishes) {
    const decorated = (wishes || []).map(decorate);
    this.setData({
      wishes: decorated,
      wantingWishes: decorated.filter((wish) => ['wanting', 'claimed', 'preparing'].includes(wish.status)),
      completedWishes: decorated.filter((wish) => wish.status === 'completed')
    });
  },

  load() {
    this.setData({ loading: true });
    api.request({ url: '/api/wishes' })
      .then((res) => {
        this.splitWishes(res.data.wishes || []);
      })
      .catch((error) => {
        wx.showToast({ title: error.error || '加载失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  chooseTab(event) {
    this.setData({ activeTab: event.currentTarget.dataset.tab });
  },

  openModal() {
    this.setData({ showModal: true });
  },

  closeModal() {
    this.setData({ showModal: false });
  },

  noop() {},

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: event.detail.value });
  },

  chooseForm(event) {
    const { field, value } = event.currentTarget.dataset;
    this.setData({ [`form.${field}`]: value });
  },

  submit() {
    const { form, saving } = this.data;
    if (saving) return;
    if (!form.title.trim()) {
      wx.showToast({ title: '请填写心愿标题', icon: 'none' });
      return;
    }

    this.setData({ saving: true });
    api.request({
      url: '/api/wishes',
      method: 'POST',
      data: {
        title: form.title.trim(),
        description: form.description || null,
        category: form.category,
        priority: form.priority
      }
    }).then(() => {
      wx.showToast({ title: '已添加', icon: 'success' });
      this.setData({
        showModal: false,
        form: {
          title: '',
          description: '',
          category: 'buy',
          priority: 'medium'
        }
      });
      this.load();
    }).catch((error) => {
      wx.showToast({ title: error.error || '添加失败', icon: 'none' });
    }).finally(() => {
      this.setData({ saving: false });
    });
  },

  completeWish(event) {
    const id = event.currentTarget.dataset.id;
    if (!id) return;
    api.request({
      url: `/api/wishes/${id}`,
      method: 'PUT',
      data: { status: 'completed', progress: 100 }
    }).then(() => {
      wx.showToast({ title: '心愿完成', icon: 'success' });
      this.load();
    }).catch((error) => {
      wx.showToast({ title: error.error || '更新失败', icon: 'none' });
    });
  }
});
