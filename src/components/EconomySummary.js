import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import classnames from 'classnames';
import helper from '../libs/helper';
import Label from './Label';
import ColumnChart from './ColumnChart';
import ColumnChartWithTarget from './ColumnChartWithTarget';
import CircleChart from './CircleChart';
import mapData from '../constants/jiaxingAmap';
import areaMapping from '../constants/areaMapping';
import areaCenters from '../constants/areaMapCenter';
import s from './EconomySummary.module.scss';

function getMap(id) {
  return mapData.features.find(d => Number.parseInt(d.properties.id, 10) === id);
}

export default class EconomySummary extends Component {
  constructor(props) {
    super(props);
    this.specialAreas = ['经济开发区', '港区'];
    const { main, outputValue, unit, industryOutputValue, energy, energyUnit, consumptionWithTarget, energyWithTarget, gdpWithTarget } = props.data;
    const dataset = areaMapping.map((d) => {
      const getGroup = dataset => dataset.filter(t => Number.parseInt(t.code, 10) === d.uid);
      const getData = (data) => {
        const found = data.find(s => Number.parseInt(s.code, 10) === d.uid);
        if (found) {
          return found.data;
        }
        return [];
      };
      return Object.assign({}, d, {
        main: main.map(m => Object.assign({}, m, { product: m.product / 100000000, power: m.power / 100000000 })),
        outputValue: getGroup(outputValue),
        unit: getGroup(unit),
        energy: getGroup(energy),
        energyUnit: getGroup(energyUnit),
        industry: getData(industryOutputValue),
        consumptionWithTarget: getData(consumptionWithTarget),
        energyWithTarget: getData(energyWithTarget),
        gdpWithTarget: getData(gdpWithTarget),
      });
    }).sort((a, b) => {
      if (this.specialAreas.includes(a.area)) {
        return -1;
      }
      if (this.specialAreas.includes(b.area)) {
        return 1;
      }
      return 0;
    }).map((d, i) => Object.assign(d, { id: i }));
    this.state = {
      /* 当前区域id */
      currentId: 0,
      /* 鼠标hover的区域id */
      hoverId: null,
      dataset,
    };
  }
  componentDidMount() {
    setInterval(() => {
      if (this.state.hoverId === null) {
        this.updateState({ currentId: (this.state.currentId + 1) % this.state.dataset.length });
      }
    }, 10000);
  }
  getLabel(d, projection) {
    const coordinates = projection(areaCenters.find(dd => d.mapId === dd.id).coordinates);
    return <text onClick={() => this.updateState({ currentId: d.id })} x={coordinates[0]} y={coordinates[1]}>{d.area}</text>;
  }
  updateState(state) {
    this.setState(Object.assign({}, this.state, state));
  }
  render() {
    // 背景地图
    const { currentId, hoverId, dataset } = this.state;
    const datum = dataset[currentId];

    const margin = { top: 60, right: 0, bottom: 60, left: 40 };
    const width = 900 - margin.left - margin.right;
    const height = 670 - margin.top - margin.bottom;
    const x = d3.scaleBand().range([0, width]).padding(1);
    const y = d3.scaleLinear().range([height, 0]);
    const colors = ['#ff6161', '#0f98e7'];
    const xDomain = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const getSum = (arr, month, field) => (
      arr.filter(a => a.month <= month)
        .reduce((prev, cur) => cur[field] + prev, 0)
    );
    const data = datum.main.map((d, i, a) => ({
      month: d.month,
      product: getSum(a, d.month, 'product'),
      power: getSum(a, d.month, 'power'),
    }));
    x.domain(xDomain);
    const max = helper.getMax(
      d3.max(data, d => Math.max(d.power, d.product))
    );
    y.domain([0, max]);
    const yTicks = Array(11).fill(0).map((d, i) => max - (max / 10) * i);
    const projection = d3.geoMercator()
      .center([120.75, 30.7])
      .scale(35000)
      .translate([width / 2, height / 2]);
    const geoPath = d3.geoPath().projection(projection);
    const sortedData = dataset.filter(d => d.id !== hoverId && d.id !== currentId)
      .sort((a, b) => {
        if (this.specialAreas.includes(a.area)) {
          return -1;
        }
        if (this.specialAreas.includes(b.area)) {
          return 1;
        }
        return 0;
      });
    if (hoverId !== currentId) {
      sortedData.push(dataset[currentId]);
    }
    if (hoverId !== null) {
      sortedData.push(dataset[hoverId]);
    }
    // 其余小图表
    const areaName = dataset.find(d => currentId === d.id).area;

    // ColumnChart渐变色
    const columnColors = ['#d36bf9', '#1e88e5'];
    return (
      <div className={s.root}>
        <div style={{ paddingTop: '40px' }}>
          <div className={s.top}>
            <Label value={`${areaName}产值趋势`} style={{ marginLeft: '50px' }} />
            <ColumnChart data={datum.outputValue} unit="亿" unitValue={100000000} colors={columnColors} style={{ height: '295px' }} />
          </div>
          <div className={s.middle}>
            <Label value={`${areaName}万元产值能耗趋势`} style={{ marginLeft: '50px' }} />
            <ColumnChart data={datum.unit} unit="tce/万" colors={columnColors} style={{ height: '295px' }} />
          </div>
          <div className={s.bottom}>
            <Label value={`${areaName}行业产值占比`} style={{ marginLeft: '50px' }} />
            <CircleChart data={datum.industry} style={{ marginLeft: '', height: '210px' }} />
          </div>
        </div>
        <div>
          <svg height="670" viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}>
            <defs>
              <filter x="-50%" y="-50%" width="200%" height="200%" id="outerLight" filterUnits="objectBoundingBox">
                <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1" />
                <feGaussianBlur stdDeviation="7" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
                <feColorMatrix values="0 0 0 0 0.568627451   0 0 0 0 0.631372549   0 0 0 0 0.968627451  0 0 0 0.7 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1" />
                <feMerge>
                  <feMergeNode in="shadowMatrixOuter1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {sortedData.map(d => (
              <g key={d.id} className={s.mapItem}>
                <path
                  className={classnames({
                    [s.area]: true,
                    [s.active]: d.id === currentId,
                  })}
                  d={geoPath(getMap(d.mapId))}
                  fill={d.id === currentId ? '#e2992a' : '#002a52'}
                  stroke={d.id === currentId ? '#fff' : 'none'}
                  onClick={() => this.updateState({ currentId: d.id })}
                  onMouseOver={() => this.updateState({ hoverId: d.id })}
                  onMouseOut={() => this.updateState({ hoverId: null })}
                />
                {this.getLabel(d, projection)}
              </g>
            ))}
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              {xDomain.map((d, i) => (
                <g key={i} className={s.xTicks}>
                  <line className={s.grid} x1={x(d)} y1={0} x2={x(d)} y2={height} />
                  <text x={x(d)} y={height + 20}>{d}</text>
                </g>
              ))}
              {}
              {yTicks.map((d, i) => (
                <g key={i} className={s.yTicks}>
                  <line className={s.grid} x1={0} y1={y(d)} x2={width - 67} y2={y(d)} />
                  <text className={s.yTick} x={-7} y={y(d)}>{d}</text>
                </g>
              ))}
              <path d={`M0,${height}${data.map(d => `L${x(d.month)},${y(d.product)}`)}`} fill="none" stroke={colors[0]} strokeWidth="3.5" />
              <path d={`M0,${height}${data.map(d => `L${x(d.month)},${y(d.power)}`)}`} fill="none" stroke={colors[1]} strokeWidth="3.5" />
              {data.map((d, i) => (
                <g key={i}>
                  <circle cx={x(d.month)} cy={y(d.product)} r={6} fill="rgba(255, 255, 255, 0.22)" />
                  <circle cx={x(d.month)} cy={y(d.power)} r={6} fill="rgba(255, 255, 255, 0.22)" />
                  <circle cx={x(d.month)} cy={y(d.product)} r={3} fill="#fff" />
                  <circle cx={x(d.month)} cy={y(d.power)} r={3} fill="#fff" />
                </g>
              ))}
              <g className={s.x} transform={`translate(0, ${height})`}>
                <path className={s.arrow} d={`M0,0H${width - 40}H${width - 40}l-5,4`} strokeWidth="1.5" />
              </g>
              <g className={s.y}>
                <text y="-20">亿</text>
                <path className={s.arrow} d={`M0,${height + 0.75}V-15l-4,5`} strokeWidth="1.5" />
              </g>
              {['总产值', '总用电量'].map((d, i) => (
                <g key={i}>
                  <rect fill={colors[i]} x={600 + 80 * i} y={height - 85} width={12} height={12} />
                  <text x={620 + 80 * i} y={height - 73} style={{ textAnchor: 'start', fontSize: 14 }}>{d}</text>
                </g>
              ))}
            </g>
          </svg>
          <div className={s.subChart}>
            <div>
              <Label value={`${areaName}综合能耗`} />
              <ColumnChartWithTarget data={datum.consumptionWithTarget} unit="tce" style={{ marginLeft: '-30px' }} box={{ widthheight: 245, right: 0 }} />
            </div>
            <div>
              <Label value={`${areaName}电耗`} />
              <ColumnChartWithTarget data={datum.energyWithTarget} unit="亿 kWh" unitValue={100000000} style={{ marginLeft: '-30px' }} box={{ height: 245, right: 0 }} />
            </div>
          </div>
        </div>
        <div style={{ paddingTop: '40px' }}>
          <div className={s.top}>
            <Label value={`${areaName}电耗趋势`} style={{ marginLeft: '50px' }} />
            <ColumnChart data={datum.energy} unit="亿 kWh" unitValue={100000000} colors={columnColors} style={{ height: '295px' }} />
          </div>
          <div className={s.bottom}>
            <Label value={`${areaName}万元产值电耗`} style={{ marginLeft: '50px' }} />
            <ColumnChart data={datum.energyUnit} unit="万 kWh" colors={columnColors} style={{ height: '295px' }} />
          </div>
          <div className={s.bottom}>
            <Label value={`${areaName}单位GDP能耗`} style={{ marginLeft: '50px' }} />
            <ColumnChartWithTarget data={datum.gdpWithTarget} unit="tce" />
          </div>
        </div>
      </div>
    );
  }
}

EconomySummary.propTypes = {
  data: PropTypes.object.isRequired,
};
