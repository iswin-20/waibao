const api = require('../../utils/api');
const fmt = require('../../utils/format');

const painMap = { none: '无不适', mild: '轻微', moderate: '明显', severe: '严重' };
const moodMap = { happy: '开心', calm: '平静', sad: '低落', irritable: '烦躁', tired: '疲惫' };
const flowMap = { light: '少量', medium: '中等', heavy: '量多' };
const initialDate = new Date();

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildPeriodSet(records) {
  const set = {};
  (records || []).forEach((record) => {
    const start = fmt.toDate(record.startDate);
    const end = fmt.toDate(record.endDate) || start;
    if (!start || !end) return;
    let cursor = new Date(start);
    while (cursor.getTime() <= end.getTime()) {
      set[fmt.dateOnly(cursor)] = true;
      cursor = addDays(cursor, 1);
    }
  });
  return set;
}

function buildCalendar(year, month, records) {
  const periodSet = buildPeriodSet(records);
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const start = addDays(first, -offset);
  const today = fmt.dateOnly(new Date());
  const days = [];

  for (let i = 0; i < 42; i += 1) {
    const date = addDays(start, i);
    const dateText = fmt.dateOnly(date);
    days.push({
      date: dateText,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: dateText === today,
      isPeriod: !!periodSet[dateText]
    });
  }
  return days;
}

function decorateRecord(record) {
  return Object.assign({}, record, {
    startText: fmt.shortDate(record.startDate),
    endText: record.endDate ? fmt.shortDate(record.endDate) : '',
    painText: painMap[record.painLevel] || '未填',
    moodText: moodMap[record.mood] || '未填',
    flowText: flowMap[record.flowLevel] || '未填'
  });
}

Page({
  data: {
    loading: true,
    saving: false,
    predictLoading: false,
    showModal: false,
    currentYear: initialDate.getFullYear(),
    currentMonth: initialDate.getMonth(),
    yearTitle: String(initialDate.getFullYear()),
    monthTitle: `${initialDate.getMonth() + 1}月`,
    weekDays: ['一', '二', '三', '四', '五', '六', '日'],
    days: buildCalendar(initialDate.getFullYear(), initialDate.getMonth(), []),
    records: [],
    predict: null,
    form: {
      startDate: '',
      endDate: '',
      painLevel: 'none',
      mood: 'calm',
      flowLevel: 'medium',
      note: ''
    },
    painOptions: [
      { value: 'none', label: '无不适' },
      { value: 'mild', label: '轻微疼痛' },
      { value: 'moderate', label: '明显疼痛' },
      { value: 'severe', label: '非常疼痛' }
    ],
    moodOptions: [
      { value: 'happy', label: '开心' },
      { value: 'calm', label: '平静' },
      { value: 'sad', label: '低落' },
      { value: 'irritable', label: '烦躁' },
      { value: 'tired', label: '疲惫' }
    ],
    flowOptions: [
      { value: 'light', label: '少量' },
      { value: 'medium', label: '中等' },
      { value: 'heavy', label: '量多' }
    ]
  },

  onShow() {
    this.refreshCalendar();
    if (!api.ensureLogin()) return;
    this.loadRecords();
  },

  refreshCalendar(records) {
    const { currentYear, currentMonth } = this.data;
    this.setData({
      yearTitle: String(currentYear),
      monthTitle: `${currentMonth + 1}月`,
      days: buildCalendar(currentYear, currentMonth, records || this.data.records)
    });
  },

  loadRecords() {
    this.setData({ loading: true });
    api.request({ url: '/api/periods' })
      .then((res) => {
        const records = (res.data.records || []).map(decorateRecord);
        this.setData({ records, loading: false });
        this.refreshCalendar(records);
      })
      .catch((error) => {
        this.setData({ loading: false });
        wx.showToast({ title: error.error || '加载失败', icon: 'none' });
      });
  },

  changeMonth(event) {
    const step = Number(event.currentTarget.dataset.step);
    let { currentYear, currentMonth } = this.data;
    currentMonth += step;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear -= 1;
    }
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear += 1;
    }
    this.setData({ currentYear, currentMonth });
    this.refreshCalendar();
  },

  loadPredict() {
    this.setData({ predictLoading: true });
    api.request({ url: '/api/periods/predict' })
      .then((res) => {
        const predict = res.data || {};
        if (predict.predictNextDate) {
          predict.nextText = fmt.formatDate(predict.predictNextDate);
          predict.daysUntil = fmt.getDaysUntil(predict.predictNextDate);
        }
        this.setData({ predict });
      })
      .catch((error) => {
        wx.showToast({ title: error.error || '预测失败', icon: 'none' });
      })
      .finally(() => {
        this.setData({ predictLoading: false });
      });
  },

  openModal() {
    this.setData({ showModal: true });
  },

  closeModal() {
    this.setData({ showModal: false });
  },

  noop() {},

  onStartDate(event) {
    this.setData({ 'form.startDate': event.detail.value });
  },

  onEndDate(event) {
    this.setData({ 'form.endDate': event.detail.value });
  },

  chooseForm(event) {
    const { field, value } = event.currentTarget.dataset;
    this.setData({ [`form.${field}`]: value });
  },

  onNoteInput(event) {
    this.setData({ 'form.note': event.detail.value });
  },

  submit() {
    const { form, saving } = this.data;
    if (saving) return;
    if (!form.startDate) {
      wx.showToast({ title: '请选择开始日期', icon: 'none' });
      return;
    }

    this.setData({ saving: true });
    api.request({
      url: '/api/periods',
      method: 'POST',
      data: {
        startDate: form.startDate,
        endDate: form.endDate || null,
        painLevel: form.painLevel,
        mood: form.mood,
        flowLevel: form.flowLevel,
        note: form.note || null
      }
    }).then(() => {
      wx.showToast({ title: '已保存', icon: 'success' });
      this.setData({
        showModal: false,
        form: {
          startDate: '',
          endDate: '',
          painLevel: 'none',
          mood: 'calm',
          flowLevel: 'medium',
          note: ''
        }
      });
      this.loadRecords();
    }).catch((error) => {
      wx.showToast({ title: error.error || '保存失败', icon: 'none' });
    }).finally(() => {
      this.setData({ saving: false });
    });
  }
});
