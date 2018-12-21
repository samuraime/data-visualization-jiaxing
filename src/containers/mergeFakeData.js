import lodash from 'lodash';

const thisYear = new Date().getFullYear();
const yearRange = Array(10).fill(thisYear - 4).map((d, i) => d + i);
const areaCodes = ['3340202', '3340203', '3340204', '3340205', '3340210', '3340220', '3340230', '3340240', '3340250'];
const getAreaValues = () => areaCodes.map(code => ({
  code,
  value: Math.random() * 1000,
}));
const padZero = num => num.toString().padStart(2, 0);
const months = Array.from({ length: 12 }).map((_, i) => `${thisYear}${padZero(i + 1)}`);
const getMonthValues = () => months.map(month => ({
  month,
  value: Math.random() * 1000,
}));
const codesAndMonths = lodash.flatten(months.map((month) => (
  areaCodes.map((code) => ({
    code,
    month,
  }))
)))
const getCodeAndMonthValues = () => {
  return codesAndMonths.map((item) => ({
    ...item,
    value: Math.random() * 1000,
  }));
};
const companys = [
  '某发电厂某某某股份有限公司',
  '某自来水厂某某某有限公司',
  '某造船厂某某某有限公司',
  '某冶钢厂某某某有限公司',
  '某铸造厂某某某有限公司',
  '某水泥公司某某某',
  '某废物处理厂某某某有限公司',
  '某机房有限某某某公司',
  '某化工厂有限公司',
];
const areas = [
  '南湖区', '秀洲区', '经济开发区', '港区', '海宁市', '平湖市', '桐乡市', '海盐县', '嘉善县',
];

const joinTarget = () => {
  // const areaCodes = set.filter((s, i, a) => a.findIndex(aa => aa.code === a.code) !== i).map(d => d.code);
  // @todo 为填补空数据, 有数据最好动态获取
  return areaCodes.map(code => ({
    code,
    data: yearRange.map((year) => {
      const value = 10000 * Math.random();
      const target = value * 1.5;
      return {
        code,
        year,
        value,
        target,
      };
    }),
  }));
};


const fakeData = {
  // // 综合
  // { url: '/api/summary', mark: 'middle1' },
  middle1: {
    company: 200,
    consumption: 20000,
    carbon: 20000,
    unit: 2222,
  },
  // { url: '/api/area', mark: 'middle2' },
  middle2: {
    index: getAreaValues(),
    carbon: getAreaValues(),
    company: getAreaValues(),
    consumption: getAreaValues(),
    unit: getAreaValues(),
  },
  // { url: '/api/summary/consumption', mark: 'left1' },
  left1: {
    trend: getCodeAndMonthValues(),
    group: [
      {
        no: 'GG00',
        name: '电',
        value: Math.random() * 10000,
      },
      {
        no: '99B0',
        name: '水',
        value: Math.random() * 3000,
      },
      {
        no: 'GG10',
        name: '泥煤',
        value: Math.random() * 10000,
      },
      {
        no: 'AAAA',
        name: '液化天然气',
        value: Math.random() * 3000,
      },
    ],
  },
  // { url: '/api/summary/carbon', mark: 'left2' },
  left2: {
    trend: getMonthValues(),
    group: [
      {
        no: 'GG00',
        name: '工业',
        value: Math.random() * 10000,
      },
      {
        no: '99B0',
        name: '第二产业',
        value: Math.random() * 3000,
      },
      {
        no: 'GG10',
        name: '轻工业',
        value: Math.random() * 2000,
      },
      {
        no: 'AAAA',
        name: '全社会用电',
        value: Math.random() * 3000,
      },
      {
        no: 0,
        name: '其他',
        value: Math.random() * 1000,
      },
    ],
  },
  // { url: '/api/area/consumption', mark: 'left3' },
  left3: getAreaValues().map((item, i) => ({
    ...item,
    name: areas[i],
  })),
  // { url: '/api/summary/company', mark: 'right1' },
  right1: {
    trend: getCodeAndMonthValues(),
    group: [
      {
        no: 'GG00',
        name: '工业',
        value: Math.random() * 10000,
      },
      {
        no: '99B0',
        name: '第二产业',
        value: Math.random() * 3000,
      },
      {
        no: 'GG10',
        name: '轻工业',
        value: Math.random() * 10000,
      },
    ],
  },
  // { url: '/api/summary/unit', mark: 'right2' },
  right2: {
    trend: getCodeAndMonthValues(),
    group: [
      {
        no: 'GG00',
        name: '工业',
        value: Math.random() * 10000,
      },
      {
        no: '99B0',
        name: '第二产业',
        value: Math.random() * 3000,
      },
      {
        no: 'GG10',
        name: '轻工业',
        value: Math.random() * 10000,
      },
    ],
  },
  // { url: '/api/area/unit', mark: 'right3' },
  right3: getAreaValues().map((item, i) => ({
    ...item,
    name: areas[i],
  })),
  // 碳排放
  // { url: '/api/carbon/trend', mark: 'cleft1' },
  cleft1: getMonthValues(),
  // { url: '/api/carbon/industry', mark: 'cleft2' },
  cleft2: [
    {
      no: 'GG00',
      name: '工业',
      value: Math.random() * 10000,
    },
    {
      no: '99B0',
      name: '第二产业',
      value: Math.random() * 3000,
    },
    {
      no: 'GG10',
      name: '轻工业',
      value: Math.random() * 2000,
    },
    {
      no: 'AAAA',
      name: '全社会用电',
      value: Math.random() * 3000,
    },
    {
      no: 0,
      name: '其他',
      value: Math.random() * 1000,
    },
  ],
  // { url: '/api/carbon/energy', mark: 'cleft3' },
  cleft3: [
    {
      no: 'GG00',
      name: '电',
      value: Math.random() * 10000,
    },
    {
      no: '99B0',
      name: '水',
      value: Math.random() * 3000,
    },
    {
      no: 'GG10',
      name: '泥煤',
      value: Math.random() * 10000,
    },
    {
      no: 'AAAA',
      name: '液化天然气',
      value: Math.random() * 3000,
    },
  ],
  // { url: '/api/carbon', mark: 'cmiddle' },
  cmiddle: {
    carbon: getAreaValues().map((item, i) => ({
      ...item,
      name: companys[i],
    })),
    trend: getCodeAndMonthValues(),
    group: areaCodes.map(code => ({
      code,
      data: [
        {
          no: 'GG00',
          name: '电',
          value: Math.random() * 10000,
        },
        {
          no: '99B0',
          name: '水',
          value: Math.random() * 3000,
        },
        {
          no: 'GG10',
          name: '泥煤',
          value: Math.random() * 2000,
        },
        {
          no: 'AAAA',
          name: '液化石油气',
          value: Math.random() * 3000,
        },
      ],
    })),
  },
  // { url: '/api/area/carbon', mark: 'cright1' },
  cright1: getAreaValues().map((item, i) => ({
    ...item,
    name: areas[i],
  })),
  // { url: '/api/carbon/company', mark: 'cright2' },
  cright2: getAreaValues().map((item, i) => ({
    ...item,
    name: companys[i],
  })),
  // 经济
  // { url: '/api/area/economy', mark: 'economy' },
  economy: {
    main: Array.from({ length: 12 }).map((i) => ({
      month: i + 1,
      product: Math.random() * 20000,
      power: Math.random() * 20000,
    })),
    outputValue: getCodeAndMonthValues(),
    unit: getCodeAndMonthValues(),
    industryOutputValue: areaCodes.map(code => ({
      code,
      data: [
        {
          no: 'GG00',
          name: '工业',
          value: Math.random() * 10000,
        },
        {
          no: '99B0',
          name: '第二产业',
          value: Math.random() * 3000,
        },
        {
          no: 'GG10',
          name: '轻工业',
          value: Math.random() * 2000,
        },
        {
          no: 'AAAA',
          name: '全社会用电',
          value: Math.random() * 3000,
        },
        {
          no: 0,
          name: '其他',
          value: Math.random() * 1000,
        },
      ],
    })),
    energy: getCodeAndMonthValues(),
    energyUnit: getCodeAndMonthValues(),
    consumptionWithTarget: joinTarget(),
    energyWithTarget: joinTarget(),
    gdpWithTarget: joinTarget(),
  },
};

export default function mergeFakeData(list) {
  return list.map((item) => ({
    ...item,
    data: fakeData[item.mark],
  }));
};
