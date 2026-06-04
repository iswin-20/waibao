const api = require('../../utils/api');
const fmt = require('../../utils/format');

const typeLabelMap = {
  top: '上衣',
  jacket: '外套',
  pants: '裤装',
  skirt: '裙装',
  shoes: '鞋子',
  bag: '包包',
  accessory: '配饰',
};

function decorateItem(item) {
  const typeText = typeLabelMap[item.type] || '单品';
  const previewUrl = item.whiteImageUrl || item.imageUrl || '';
  return Object.assign({}, item, {
    typeText,
    previewUrl,
    displayName: item.name || typeText,
    metaText: `${typeText} · ${item.color || '未填色'}`,
    selected: false,
  });
}

function wornFromItems(items) {
  return (items || []).reduce((worn, item) => {
    if (['top', 'jacket', 'pants', 'skirt', 'shoes'].includes(item.type)) {
      worn[item.type] = decorateItem(item);
    }
    return worn;
  }, {});
}

function imageOf(item) {
  return item ? (item.whiteImageUrl || item.imageUrl || '') : '';
}

function getSelectedIds(worn) {
  return Object.keys(worn || {}).map((key) => worn[key].id);
}

function decorateSelection(items, selectedIds) {
  const selectedMap = selectedIds.reduce((map, id) => {
    map[id] = true;
    return map;
  }, {});

  return (items || []).map((item) => Object.assign({}, item, {
    selected: !!selectedMap[item.id],
  }));
}

function buildWornData(worn, items) {
  const selectedIds = getSelectedIds(worn);
  const bottom = worn.pants || worn.skirt;

  return {
    worn,
    selectedIds,
    wornTopSrc: imageOf(worn.top),
    wornJacketSrc: imageOf(worn.jacket),
    wornBottomSrc: imageOf(bottom),
    wornShoesSrc: imageOf(worn.shoes),
    items: decorateSelection(items, selectedIds),
  };
}

function weatherView(weather) {
  const current = weather || {};
  return {
    weatherTitle: current.city || '今日天气',
    weatherDesc: `${current.weather || '点击刷新天气'} · ${current.tempMin || '-'}°/${current.tempMax || '-'}°`,
  };
}

function getModelInfo() {
  const user = wx.getStorageSync('user') || {};
  const isPartner = user.role === 'partner';
  return {
    modelGender: isPartner ? 'male' : 'female',
    modelClass: isPartner ? 'model-male' : 'model-female',
    modelLabel: isPartner ? '男模特' : '女模特',
  };
}

Page({
  data: {
    loading: false,
    uploading: false,
    recommending: false,
    showUpload: false,
    items: [],
    worn: {},
    wornTopSrc: '',
    wornJacketSrc: '',
    wornBottomSrc: '',
    wornShoesSrc: '',
    selectedIds: [],
    recommendation: {},
    weather: {},
    weatherTitle: '今日天气',
    weatherDesc: '点击刷新天气 · -°/-°',
    modelGender: 'female',
    modelClass: 'model-female',
    modelLabel: '女模特',
    uploadForm: {
      filePath: '',
      name: '',
      type: 'top',
      color: '',
      style: 'casual',
      season: 'all'
    },
    typeOptions: [
      { value: 'top', label: '上衣' },
      { value: 'jacket', label: '外套' },
      { value: 'pants', label: '裤装' },
      { value: 'skirt', label: '裙装' },
      { value: 'shoes', label: '鞋子' },
      { value: 'bag', label: '包包' },
      { value: 'accessory', label: '配饰' }
    ],
    styleOptions: [
      { value: 'casual', label: '日常' },
      { value: 'cute', label: '甜美' },
      { value: 'sporty', label: '运动' },
      { value: 'elegant', label: '优雅' },
      { value: 'formal', label: '通勤' }
    ],
    seasonOptions: [
      { value: 'all', label: '四季' },
      { value: 'spring', label: '春' },
      { value: 'summer', label: '夏' },
      { value: 'autumn', label: '秋' },
      { value: 'winter', label: '冬' }
    ]
  },

  onShow() {
    if (!api.ensureLogin()) return;
    this.setData(getModelInfo());
    this.loadWardrobe();
    if (!this.data.weather.weather) this.loadWeather();
  },

  loadWardrobe() {
    this.setData({ loading: true });
    api.request({ url: '/api/wardrobe' })
      .then((res) => {
        const items = (res.data.items || []).map(decorateItem);
        const selectedIds = this.data.selectedIds || [];
        this.setData({ items: decorateSelection(items, selectedIds) });
      })
      .catch((error) => wx.showToast({ title: error.error || '衣橱加载失败', icon: 'none' }))
      .finally(() => this.setData({ loading: false }));
  },

  loadWeather() {
    return api.request({ url: '/api/weather?city=上海' })
      .then((res) => {
        const weather = res.data.today || fmt.generateMockWeather();
        this.setData(Object.assign({ weather }, weatherView(weather)));
      })
      .catch(() => {
        const weather = fmt.generateMockWeather();
        this.setData(Object.assign({ weather }, weatherView(weather)));
      });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const filePath = res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath;
        if (!filePath) return;
        this.setData({
          showUpload: true,
          uploadForm: Object.assign({}, this.data.uploadForm, { filePath })
        });
      }
    });
  },

  closeUpload() {
    this.setData({ showUpload: false });
  },

  noop() {},

  onFormInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [`uploadForm.${field}`]: event.detail.value });
  },

  chooseForm(event) {
    const { field, value } = event.currentTarget.dataset;
    this.setData({ [`uploadForm.${field}`]: value });
  },

  submitUpload() {
    const form = this.data.uploadForm;
    if (!form.filePath) {
      wx.showToast({ title: '请先选择图片', icon: 'none' });
      return;
    }

    this.setData({ uploading: true });
    api.upload({
      url: '/api/wardrobe',
      filePath: form.filePath,
      formData: {
        name: form.name,
        type: form.type,
        color: form.color,
        style: form.style,
        season: form.season
      },
      loadingText: '生成白底图'
    }).then(() => {
      wx.showToast({ title: '已保存', icon: 'success' });
      this.setData({
        showUpload: false,
        uploadForm: {
          filePath: '',
          name: '',
          type: 'top',
          color: '',
          style: 'casual',
          season: 'all'
        }
      });
      this.loadWardrobe();
    }).catch((error) => {
      wx.showToast({ title: error.error || '上传失败', icon: 'none' });
    }).finally(() => {
      this.setData({ uploading: false });
    });
  },

  wearItem(event) {
    const id = event.currentTarget.dataset.id;
    const item = this.data.items.find((entry) => entry.id === id);
    if (!item) return;

    const worn = Object.assign({}, this.data.worn);
    if (['top', 'jacket', 'pants', 'skirt', 'shoes'].includes(item.type)) {
      if (item.type === 'pants') delete worn.skirt;
      if (item.type === 'skirt') delete worn.pants;
      worn[item.type] = item;
    }

    this.setData(buildWornData(worn, this.data.items));
  },

  recommend() {
    if (this.data.recommending) return;
    this.setData({ recommending: true });

    api.request({
      url: '/api/ootd/recommend',
      method: 'POST',
      data: { weather: this.data.weather }
    }).then((res) => {
      const items = (res.data.items || []).map(decorateItem);
      const worn = wornFromItems(items);
      this.setData({
        recommendation: res.data.recommendation || {},
        items: decorateSelection(this.data.items, items.map((item) => item.id)),
        worn: worn,
        selectedIds: getSelectedIds(worn),
        wornTopSrc: imageOf(worn.top),
        wornJacketSrc: imageOf(worn.jacket),
        wornBottomSrc: imageOf(worn.pants || worn.skirt),
        wornShoesSrc: imageOf(worn.shoes),
      });
      if (items.length === 0) {
        wx.showToast({ title: '先上传几件衣服吧', icon: 'none' });
      }
    }).catch((error) => {
      wx.showToast({ title: error.error || '推荐失败', icon: 'none' });
    }).finally(() => {
      this.setData({ recommending: false });
    });
  }
});
