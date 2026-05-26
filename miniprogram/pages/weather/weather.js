const api = require('../../utils/api');
const fmt = require('../../utils/format');

function symbolFor(weather) {
  if (!weather) return '天';
  if (weather.includes('晴')) return '晴';
  if (weather.includes('雨')) return '雨';
  if (weather.includes('云')) return '云';
  return '天';
}

function buildWeatherView(today, city) {
  const current = today || {};
  const source = current.source || '';
  return {
    displayCity: current.city || city || '上海',
    heroCaption: `${current.district || '今天'} ${current.reportTime || ''}`.trim(),
    rainText: `${current.rainProbability || 0}%`,
    windText: current.windLevel || '-',
    humidityText: `${current.humidity || '-'}%`,
    weatherNote: source === 'mock'
      ? '当前高德天气不可用，已使用开发模拟数据。请检查高德 Key 的 IP 白名单。'
      : '天气数据来自高德地图；定位仅用于查询当前位置天气。',
  };
}

Page({
  data: {
    city: '上海',
    loading: false,
    locating: false,
    today: null,
    forecast: [],
    advice: {},
    weatherSymbol: '天',
    displayCity: '上海',
    heroCaption: '今天',
    rainText: '0%',
    windText: '-',
    humidityText: '-%',
    weatherNote: '天气数据来自高德地图；定位仅用于查询当前位置天气。',
    fallbackClothing: '温度适中，穿得舒服就好。',
    fallbackSkincare: '记得做好基础护肤，出门按需防晒。'
  },

  onShow() {
    if (!api.ensureLogin()) return;
    if (!this.data.today) this.load();
  },

  onPullDownRefresh() {
    this.load().finally(() => wx.stopPullDownRefresh());
  },

  onCityInput(event) {
    this.setData({ city: event.detail.value });
  },

  load() {
    if (!api.ensureLogin()) return Promise.resolve();
    const city = (this.data.city || '上海').trim();
    this.setData({ loading: true, city });

    return api.request({
      url: `/api/weather?city=${encodeURIComponent(city)}`
    }).then((res) => {
      const today = res.data.today || fmt.generateMockWeather();
      this.setData(Object.assign({
        today,
        forecast: res.data.forecast || [],
        advice: res.data.advice || {},
        weatherSymbol: symbolFor(today.weather)
      }, buildWeatherView(today, city)));
    }).catch((error) => {
      const today = fmt.generateMockWeather();
      this.setData(Object.assign({
        today,
        forecast: fmt.generateMockForecast(),
        advice: {},
        weatherSymbol: symbolFor(today.weather)
      }, buildWeatherView(today, city)));
      wx.showToast({ title: error.error || '已使用模拟天气', icon: 'none' });
    }).finally(() => {
      this.setData({ loading: false });
    });
  }
,

  useLocation() {
    if (this.data.locating) return;
    if (!api.ensureLogin()) return;
    this.setData({ locating: true });

    wx.getLocation({
      type: 'gcj02',
      success: (location) => {
        this.setData({ loading: true });
        api.request({
          url: `/api/weather?lat=${location.latitude}&lng=${location.longitude}`
        }).then((res) => {
          const today = res.data.today || fmt.generateMockWeather();
          this.setData(Object.assign({
            city: today.city || this.data.city,
            today,
            forecast: res.data.forecast || [],
            advice: res.data.advice || {},
            weatherSymbol: symbolFor(today.weather)
          }, buildWeatherView(today, today.city || this.data.city)));
        }).catch((error) => {
          wx.showToast({ title: error.error || '定位天气失败', icon: 'none' });
        }).finally(() => {
          this.setData({ loading: false, locating: false });
        });
      },
      fail: () => {
        this.setData({ locating: false });
        wx.showModal({
          title: '无法获取位置',
          content: '请在微信开发者工具或手机设置中允许位置权限，也可以手动输入城市。',
          showCancel: false,
        });
      }
    });
  },

  goOotd() {
    wx.redirectTo({ url: '/pages/ootd/ootd' });
  }
});
