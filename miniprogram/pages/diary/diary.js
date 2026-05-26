const api = require('../../utils/api');
const fmt = require('../../utils/format');

function moodIcon(score) {
  const map = {
    5: '开',
    4: '静',
    3: '焦',
    2: '难',
    1: '气'
  };
  return map[score] || '记';
}

function summarize(text, length) {
  if (!text) return '';
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function decorate(diary) {
  return Object.assign({}, diary, {
    dateText: fmt.shortDate(diary.date),
    moodIcon: moodIcon(diary.moodScore),
    emotionText: diary.emotionLevel !== null && diary.emotionLevel !== undefined
      ? fmt.emotionLabel(diary.emotionLevel)
      : '',
    summary: summarize(diary.content, 82),
    aiSummary: summarize(diary.aiComfortText, 58),
    expanded: false
  });
}

function buildGroups(diaries) {
  const groups = fmt.groupByMonth(diaries.map(decorate), 'date');
  return Object.keys(groups)
    .sort((a, b) => b.localeCompare(a))
    .map((month) => {
      const parts = month.split('-');
      return {
        month,
        monthText: `${parts[0]}年${Number(parts[1])}月`,
        diaries: groups[month]
      };
    });
}

Page({
  data: {
    loading: true,
    groups: []
  },

  onLoad() {
    if (!api.ensureLogin()) return;
    this.load();
  },

  load() {
    this.setData({ loading: true });
    api.request({ url: '/api/diaries?pageSize=100' })
      .then((res) => {
        this.setData({ groups: buildGroups(res.data.diaries || []) });
      })
      .catch((error) => {
        wx.showToast({ title: error.error || '加载失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  toggle(event) {
    const id = event.currentTarget.dataset.id;
    const groups = this.data.groups.map((group) => Object.assign({}, group, {
      diaries: group.diaries.map((diary) => (
        diary.id === id ? Object.assign({}, diary, { expanded: !diary.expanded }) : diary
      ))
    }));
    this.setData({ groups });
  },

  back() {
    wx.navigateBack({
      fail() {
        wx.redirectTo({ url: '/pages/today/today' });
      }
    });
  }
});
