Component({
  properties: {
    active: {
      type: String,
      value: 'today'
    }
  },

  data: {
    items: []
  },

  lifetimes: {
    attached() {
      this.refreshItems();
    }
  },

  pageLifetimes: {
    show() {
      this.refreshItems();
    }
  },

  methods: {
    refreshItems() {
      const user = wx.getStorageSync('user') || {};
      const isPartner = user.role === 'partner';
      const items = isPartner
        ? [
            { key: 'partner-home', text: '今日', icon: '今', page: '/pages/partner/home/home' },
            { key: 'partner-wishes', text: '心愿', icon: '愿', page: '/pages/partner/wishes/wishes' },
            { key: 'partner-comfort', text: '哄哄', icon: '哄', page: '/pages/partner/comfort/comfort' },
            { key: 'ootd', text: '穿搭', icon: '搭', page: '/pages/ootd/ootd' },
            { key: 'profile', text: '我的', icon: '我', page: '/pages/profile/profile' }
          ]
        : [
            { key: 'today', text: '今日', icon: '今', page: '/pages/today/today' },
            { key: 'weather', text: '天气', icon: '天', page: '/pages/weather/weather' },
            { key: 'ootd', text: '穿搭', icon: '搭', page: '/pages/ootd/ootd' },
            { key: 'period', text: '例假', icon: '期', page: '/pages/period/period' },
            { key: 'profile', text: '我的', icon: '我', page: '/pages/profile/profile' }
          ];
      this.setData({ items });
    },

    go(event) {
      const page = event.currentTarget.dataset.page;
      if (!page) return;
      const pages = getCurrentPages();
      const current = pages.length ? `/${pages[pages.length - 1].route}` : '';
      if (current === page) return;
      wx.redirectTo({ url: page });
    }
  }
});
