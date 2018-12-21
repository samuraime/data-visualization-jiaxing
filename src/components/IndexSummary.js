import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import * as d3 from 'd3';
import Label from './Label';
import PanelChart from './PanelChart';
import mapData from '../constants/jiaxingAmap';
import areaMapping from '../constants/areaMapping';
import areaCenters from '../constants/areaMapCenter';
import s from './IndexSummary.module.scss';

function getMap(id) {
  return mapData.features.find(d => Number.parseInt(d.properties.id, 10) === id);
}

function SummaryHeader(props) {
  return (
    <div className={s.header}>
      {props.data.map((d, i) => (
        <div key={i} className={s.item}>
          <div className={s.label}>{d.label}</div>
          <div className={s.value}>{d.value}</div>
        </div>
      ))}
    </div>
  );
}

SummaryHeader.propTypes = {
  data: PropTypes.array.isRequired,
};

class SummaryChart extends Component {
  constructor(props) {
    super(props);
    this.specialAreas = ['经济开发区', '港区'];
    const { index, consumption, carbon, company, unit } = props.data;
    const dataset = areaMapping.map((d) => {
      const getValue = (set) => {
        const found = set.find(s => Number.parseInt(s.code, 10) === d.uid);
        if (found) {
          return found.value;
        }
        return 0;
      };
      const ind = getValue(index);
      const con = getValue(consumption);
      const unitConsumption = getValue(unit);
      const rank = consumption.filter(item => item.value > con).length + 1;
      const unitRank = unit.filter(item => item.value > unitConsumption).length + 1;
      return Object.assign({}, d, {
        index: ind,
        consumption: con,
        carbon: getValue(carbon),
        company: getValue(company),
        unit: unitConsumption,
        rank,
        unitRank,
      });
    }).sort((a, b) => {
      if (this.specialAreas.includes(a.area)) {
        return -1;
      }
      if (this.specialAreas.includes(b.area)) {
        return 1;
      }
      return b.consumption - a.consumption;
    }).map((d, i) => Object.assign(d, { id: i }));
    this.state = {
      /* 当前能耗类型标签页 */
      currentTab: 0,
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
        this.updateState({ currentTab: (this.state.currentTab + 1) % 3 });
      }
    }, 30000);
    setInterval(() => {
      if (this.state.hoverId === null) {
        this.updateState({ currentId: (this.state.currentId + 1) % this.state.dataset.length });
      }
    }, 10000);
  }
  switchTab(i) {
    const fields = ['consumption', 'carbon', 'unit'];
    this.updateState({
      currentTab: i,
      dataset: this.state.dataset.sort((a, b) => {
        if (this.specialAreas.includes(a.area)) {
          return -1;
        }
        if (this.specialAreas.includes(b.area)) {
          return 1;
        }
        return b[fields[i]] - a[fields[i]];
      }).map((d, i) => Object.assign(d, { id: i })),
    });
  }
  updateState(state) {
    this.setState(Object.assign({}, this.state, state));
  }
  getColor(d) {
    const { currentTab, dataset } = this.state;
    const colors = [
      ['#0962e6', '#024ebe', '#0447a2', '#003784', '#032e6e', '#03275b', '#022358'],
      ['#fcaf39', '#e2992a', '#cf8618', '#9e6303', '#774c04', '#614005', '#493206'],
      ['#fd512d', '#fb3911', '#d72f0b', '#b1270a', '#9b2007', '#791904', '#631201'],
    ];
    const cs = dataset.filter(d => !this.specialAreas.includes(d.area));
    const i = cs.map(d => d.id).indexOf(d.id);
    if (i !== -1) {
      return colors[currentTab][i];
    }
    return this.getColor(dataset.find(dd => dd.mapId === d.mapId && dd.area !== d.area));
  }
  getLabel(d, projection) {
    const coordinates = projection(areaCenters.find(dd => d.mapId === dd.id).coordinates);
    return (
      <text
        onClick={() => this.updateState({ currentId: d.id })}
        x={coordinates[0]}
        y={coordinates[1]}
      >
        {d.area}
      </text>
    );
  }
  render() {
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = 800 - margin.left - margin.right;
    const height = 530 - margin.top - margin.bottom;
    const linearGradients = [
      ['#0658cc', '#001e4b'],
      ['#f99700', '#553907'],
      ['#ec4928', '#821c06'],
    ];
    const projection = d3.geoMercator()
      .center([120.7, 30.6])
      .scale(30000)
      .translate([width / 2, height / 2]);
    const geoPath = d3.geoPath().projection(projection);

    const tabs = [
      { label: '能耗总量', color: '#0346a2' },
      { label: '碳排放总量', color: '#f99700' },
      { label: '万元产值能耗', color: '#d84122' },
    ];
    const { consumption, carbon, unit } = this.props.data;
    const sum = list => list.reduce((prev, cur) => prev + cur.value, 0);

    const { currentTab, currentId, hoverId, dataset } = this.state;
    const datum = dataset[currentId];

    // hover优先, 当前次之
    const sortedData = dataset.filter(d => d.id !== hoverId && d.id !== currentId);
    if (hoverId !== currentId) {
      sortedData.push(dataset[currentId]);
    }
    if (hoverId !== null) {
      sortedData.push(dataset[hoverId]);
    }
    return (
      <div className={s.chartContainer}>
        <div className={s.mapHeader}>
          <div className={s.title}>区域接入概览</div>
          <div className={s.tabContainer}>
            {tabs.map((d, i, a) => {
              const style = {};
              if (i === currentTab) {
                style.backgroundColor = d.color;
              }
              return (
                <div className={s.tab} key={i}>
                  <span onClick={() => this.switchTab(i)} className={s.tabName} style={style}>{d.label}</span>
                  {a.length !== i + 1 && <span className={s.divider} />}
                </div>
              );
            })}
          </div>
        </div>
        <svg className={s.mapChart} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="mapLinearChromatic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={linearGradients[currentTab][0]} />
              <stop offset="100%" stopColor={linearGradients[currentTab][1]} />
            </linearGradient>
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
          <g className={s.leftScale}>
            <rect x="27" y="105" width="8" height="300" />
            <text x="45" y="140">高</text>
            <text x="45" y="375">低</text>
          </g>

          {sortedData.map(d => (
            <g key={d.uid} className={s.mapItem}>
              <path
                className={classnames({
                  [s.area]: true,
                  [s.active]: d.id === currentId,
                })}
                d={geoPath(getMap(d.mapId))}
                fill={this.getColor(d)}
                stroke={d.id === currentId ? '#fff' : 'none'}
                onClick={() => this.updateState({ currentId: d.id })}
                onMouseOver={() => this.updateState({ hoverId: d.id })}
                onMouseOut={() => this.updateState({ hoverId: null })}
              />
              {this.getLabel(d, projection)}
            </g>
          ))}
        </svg>
        <div className={s.panelChart}>
          <Label value={`${datum.area}经济发展指数`} />
          <div className={s.main}>
            <div className={s.left}>
              <p>{datum.index.toFixed(2)}</p>
              <p>接入企业: <span className={s.number}>{datum.company.toFixed(0)}</span> 家</p>
              <p>能耗排名: <span className={s.number}>{datum.rank}</span></p>
              <p>万元产值能耗排名: <span className={s.number}>{datum.unitRank}</span></p>
            </div>
            <div className={s.chart}><PanelChart color={tabs[0].color} data={[datum.consumption, sum(consumption)]} unit="Tce" title={tabs[0].label} /></div>
            <div className={s.chart}><PanelChart color={tabs[1].color} data={[datum.carbon, sum(carbon)]} unit="吨" title={tabs[1].label} /></div>
            <div className={s.chart}><PanelChart color={tabs[2].color} data={[datum.unit, sum(unit)]} unit="Tce" title={tabs[2].label} /></div>
          </div>
        </div>
      </div>
    );
  }
}

SummaryChart.propTypes = {
  data: PropTypes.object.isRequired,
};

export default class IndexSummary extends Component {
  render() {
    const { header, data } = this.props;
    const headers = [
      { label: '接入企业总数（家）', value: header.company },
      { label: '累计能耗总量（tce）', value: header.consumption.toFixed(0) },
      { label: '碳排放总量（吨）', value: header.carbon.toFixed(0) },
      { label: '万元产值能耗（tce/万元）', value: header.unit },
    ];
    return (
      <div className={s.root}>
        <SummaryHeader data={headers} />
        <SummaryChart data={data} />
      </div>
    );
  }
}

IndexSummary.propTypes = {
  header: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
};
