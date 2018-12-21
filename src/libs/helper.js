const getPow = (num) => {
  let i = 0;
  while (num > Math.pow(10, i)) {
    i++;
  }
  return i - 1;
};

const getDomain = (arr) => {
  arr.sort(() => -1);
  let [min, max] = arr;
  const range = (max - min) / 10;
  min -= range;
  max += range;
  // 根据最大/最小值的区间确定Y轴tick范围
  const rangePow = getPow(range);
  const base = Math.pow(10, rangePow);
  min = Math.floor(min / base) * base;
  max = Math.ceil(max / base) * base;
  const count = ((max - min) / base).toFixed(0);
  // 9的情况特殊处理
  if (count === 9) {
    max += base;
  }
  if (min < 0) {
    min = 0;
  }
  return [min, max];
};

const getTickValues = ([min, max]) => {
  const pow = getPow(max - min);
  const base = Math.pow(10, pow);
  const count = Math.round((max - min) / base);
  const countMap = { 1: 5, 2: 4, 3: 6, 4: 4, 5: 5, 6: 6, 7: 7, 8: 4, 9: 5, 10: 5 };
  const step = (max - min) / countMap[count];
  const values = [];
  for (let num = min; num - max <= 0.0001; num += step) {
    values.push(num);
  }
  return values;
};

// 以前两位5数字是5的最接近的倍数的方式获取y轴定义域最大值
const getMax = (max) => {
  // max *= 1.2;
  const count = 5;
  const pow = getPow(max);
  // 最大值的前两位
  const twoBit = max / Math.pow(10, pow - 1);
  return Math.ceil(twoBit / count) * count * Math.pow(10, pow - 1);
};
const getFiveTicks = ([min, max]) => {
  const count = 5;
  const step = (max - min) / count;
  const values = [];
  for (let num = min; num - max <= 0.0001 && max !== 0; num += step) {
    values.push(num);
  }
  return values;
};

export default {
  getPow,
  getDomain,
  getTickValues,
  getFiveTicks,
  getMax,
};
