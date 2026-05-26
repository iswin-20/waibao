const api = require('../../utils/api');
const fmt = require('../../utils/format');

function tomorrowDateOnly() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return fmt.dateOnly(tomorrow);
}

function decorateDate(item) {
  const days = fmt.getDaysUntil(item.date);
  let daysText = `${days}天后`;
  if (days === 0) daysText = '今天';
  if (days === 1) daysText = '明天';
  return Object.assign({}, item, {
    dateText: fmt.formatDate(item.date),
    daysText,
    close: days <= 7
  });
}

function weatherAdvice(weather) {
  if (!weather) return '';
  if (weather.rainProbability > 50) return '可能下雨，出门记得带伞。';
  if (weather.tempMax > 32) return '温度偏高，注意防晒和补水。';
  if (weather.tempMin < 10) return '今天有点冷，多穿一点。';
  return '天气还不错，适合把日子过得舒展一点。';
}

Page({
  data: {
    loading: true,
    user: {},
    greeting: '',
    encouragement: '',
    couple: null,
    loveDays: 0,
    dates: [],
    weather: fmt.generateMockWeather(),
    weatherAdvice: '',
    todos: [],
    todayDiary: null,
    selectedMood: null,
    content: '',
    submitting: false,
    analysis: null,
    moodOptions: [
      { score: 5, icon: '开', label: '开心' },
      { score: 2, icon: '难', label: '难过' },
      { score: 1, icon: '气', label: '生气' },
      { score: 3, icon: '焦', label: '焦虑' },
      { score: 4, icon: '静', label: '平静' }
    ]
  },

  onShow() {
    if (!api.ensureLogin()) return;
    this.load();
  },

  load() {
    const weather = fmt.generateMockWeather();
    this.setData({
      loading: true,
      greeting: fmt.getGreeting(),
      encouragement: fmt.getEncouragement(),
      weather,
      weatherAdvice: weatherAdvice(weather)
    });

    const today = fmt.dateOnly(new Date());
    Promise.allSettled([
      api.getMe(),
      api.request({ url: '/api/couples/status' }),
      api.request({ url: '/api/important-dates?upcoming=true' }),
      api.request({ url: '/api/todos?completed=false&pageSize=5' }),
      api.request({ url: `/api/diaries?startDate=${today}&endDate=${tomorrowDateOnly()}` })
    ]).then((results) => {
      const user = results[0].status === 'fulfilled' ? results[0].value : wx.getStorageSync('user') || {};
      const couple = results[1].status === 'fulfilled' ? results[1].value.data : null;
      const dates = results[2].status === 'fulfilled' ? (results[2].value.data.dates || []).map(decorateDate) : [];
      const todos = results[3].status === 'fulfilled'
        ? (results[3].value.data.todos || []).map((todo) => Object.assign({}, todo, {
            priorityText: fmt.priorityLabel(todo.priority),
            completing: false
          }))
        : [];
      const diaries = results[4].status === 'fulfilled' ? (results[4].value.data.diaries || []) : [];
      const todayDiary = diaries[0]
        ? Object.assign({}, diaries[0], { moodText: fmt.moodLabel(diaries[0].moodScore) })
        : null;
      const analysis = todayDiary && todayDiary.aiComfortText
        ? {
            emotionLevel: todayDiary.emotionLevel,
            emotionType: todayDiary.emotionType,
            comfortText: todayDiary.aiComfortText
          }
        : null;

      this.setData({
        loading: false,
        user,
        couple,
        loveDays: couple && couple.loveStartDate ? fmt.getLoveDays(couple.loveStartDate) : (couple && couple.loveDays) || 0,
        dates,
        todos,
        todayDiary,
        analysis
      });
    });
  },

  goProfile() {
    wx.redirectTo({ url: '/pages/profile/profile' });
  },

  goWeather() {
    wx.redirectTo({ url: '/pages/weather/weather' });
  },

  goDiary() {
    wx.navigateTo({ url: '/pages/diary/diary' });
  },

  copyBindCode() {
    const code = this.data.couple && this.data.couple.bindCode;
    if (!code) return;
    wx.setClipboardData({ data: code });
  },

  completeTodo(event) {
    const id = event.currentTarget.dataset.id;
    if (!id) return;
    const todos = this.data.todos.map((todo) => (
      todo.id === id ? Object.assign({}, todo, { completing: true }) : todo
    ));
    this.setData({ todos });

    api.request({
      url: `/api/todos/${id}`,
      method: 'PUT',
      data: { completed: true }
    }).then(() => {
      this.setData({ todos: this.data.todos.filter((todo) => todo.id !== id) });
      wx.showToast({ title: '已完成', icon: 'success' });
    }).catch((error) => {
      wx.showToast({ title: error.error || '操作失败', icon: 'none' });
      this.load();
    });
  },

  selectMood(event) {
    this.setData({ selectedMood: Number(event.currentTarget.dataset.score) });
  },

  onContentInput(event) {
    this.setData({ content: event.detail.value });
  },

  submitMood() {
    const { content, selectedMood, submitting } = this.data;
    if (submitting) return;
    if (!content.trim() || selectedMood === null) {
      wx.showToast({ title: '先选择心情并写一点内容', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    api.request({
      url: '/api/diaries',
      method: 'POST',
      data: { content: content.trim(), moodScore: selectedMood }
    }).then((diaryRes) => {
      const diary = Object.assign({}, diaryRes.data, { moodText: fmt.moodLabel(diaryRes.data.moodScore) });
      this.setData({ todayDiary: diary, content: '', selectedMood: null });
      return api.request({
        url: '/api/ai/analyze',
        method: 'POST',
        data: {
          diaryId: diary.id,
          diaryContent: content.trim(),
          moodScore: selectedMood,
          isPeriod: false
        }
      }).then((analyzeRes) => {
        this.setData({
          todayDiary: Object.assign({}, this.data.todayDiary, {
            aiComfortText: analyzeRes.data.comfortText,
            emotionLevel: analyzeRes.data.emotionLevel,
            emotionType: analyzeRes.data.emotionType,
            notifyPartner: analyzeRes.data.notifyPartner
          })
        });
        this.setData({ analysis: analyzeRes.data });
      }).catch(() => null);
    }).then(() => {
      wx.showToast({ title: '已记录', icon: 'success' });
    }).catch((error) => {
      wx.showToast({ title: error.error || '记录失败', icon: 'none' });
    }).finally(() => {
      this.setData({ submitting: false });
    });
  }
});
