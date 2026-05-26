function pad(value) {
  return String(value).padStart(2, '0');
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateOnly(value) {
  const date = toDate(value) || new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return '';
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function shortDate(value) {
  const date = toDate(value);
  if (!date) return '';
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatMonth(value) {
  const date = toDate(value) || new Date();
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function startOfDay(value) {
  const date = toDate(value) || new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function diffDays(a, b) {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / oneDay);
}

function getDaysUntil(value) {
  return diffDays(value, new Date());
}

function getLoveDays(value) {
  return Math.max(0, diffDays(new Date(), value));
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return '早安';
  if (hour >= 11 && hour < 14) return '中午好';
  if (hour >= 14 && hour < 18) return '下午好';
  if (hour >= 18 && hour < 24) return '晚上好';
  return '夜深啦';
}

function getEncouragement() {
  const messages = [
    '今天也要好好吃饭，好好爱自己。',
    '慢一点也没关系，你已经在认真生活了。',
    '愿今天的风都温柔一点，事情都顺利一点。',
    '把重要的小事交给这里记录，剩下的慢慢来。',
    '你值得被温柔对待，也值得拥有很亮的一天。'
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function moodLabel(score) {
  const map = {
    5: '开心',
    4: '平静',
    3: '焦虑',
    2: '难过',
    1: '生气'
  };
  return map[score] || '已记录';
}

function emotionLabel(level) {
  const labels = ['正常', '轻微低落', '明显不开心', '需要关心', '强烈异常'];
  return labels[level] || '未知';
}

function categoryLabel(category) {
  const map = {
    buy: '想买',
    food: '想吃',
    travel: '想去',
    movie: '想看',
    together: '一起',
    surprise: '惊喜',
    word: '一句话',
    birthday: '生日',
    anniversary: '纪念日',
    holiday: '节日'
  };
  return map[category] || '其他';
}

function priorityLabel(priority) {
  const map = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急'
  };
  return map[priority] || '中';
}

function groupByMonth(items, dateKey) {
  return (items || []).reduce((groups, item) => {
    const date = toDate(item[dateKey]);
    const key = date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}` : 'unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

function generateMockWeather() {
  const weathers = ['晴', '多云', '阴天', '小雨', '阵雨'];
  const weather = weathers[Math.floor(Math.random() * weathers.length)];
  const tempMin = 16 + Math.floor(Math.random() * 8);
  const tempMax = tempMin + 5 + Math.floor(Math.random() * 6);
  const rainProbability = weather.includes('雨') ? 60 + Math.floor(Math.random() * 30) : Math.floor(Math.random() * 35);
  return {
    city: '上海',
    weather,
    tempMin,
    tempMax,
    rainProbability,
    humidity: 48 + Math.floor(Math.random() * 34),
    windLevel: `${1 + Math.floor(Math.random() * 3)}级`,
    uvLevel: ['弱', '中等', '强'][Math.floor(Math.random() * 3)]
  };
}

function generateMockForecast() {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const result = [];
  for (let i = 1; i <= 3; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    result.push(Object.assign({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      weekday: days[date.getDay()]
    }, generateMockWeather()));
  }
  return result;
}

module.exports = {
  pad,
  toDate,
  dateOnly,
  formatDate,
  shortDate,
  formatMonth,
  diffDays,
  getDaysUntil,
  getLoveDays,
  getGreeting,
  getEncouragement,
  moodLabel,
  emotionLabel,
  categoryLabel,
  priorityLabel,
  groupByMonth,
  generateMockWeather,
  generateMockForecast
};
