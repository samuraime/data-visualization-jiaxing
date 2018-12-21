import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import classnames from 'classnames';
import Label from './Label';
import mapData from '../constants/jiaxingAmap';
import areaMapping from '../constants/areaMapping';
import areaCenters from '../constants/areaMapCenter';
import ColumnChart from './ColumnChart';
import CircleChart from './CircleChart';
import s from './CarbonSummary.module.scss';

function getMap(id) {
  return mapData.features.find(d => Number.parseInt(d.properties.id, 10) === id);
}

export default class CarbonSummary extends Component {
  constructor(props) {
    super(props);
    this.specialAreas = ['经济开发区', '港区'];
    const { carbon, trend, group } = props.data;
    const dataset = areaMapping.map((d) => {
      const getValue = (set) => {
        const found = set.find(s => Number.parseInt(s.code, 10) === d.uid);
        if (found) {
          return found.value;
        }
        return 0;
      };
      const g = group.find(g => Number.parseInt(g.code, 10) === d.uid);
      return Object.assign({}, d, {
        carbon: getValue(carbon),
        trend: trend.filter(t => Number.parseInt(t.code, 10) === d.uid),
        group: g ? g.data : [],
      });
    }).sort((a, b) => {
      if (this.specialAreas.includes(a.area)) {
        return -1;
      }
      if (this.specialAreas.includes(b.area)) {
        return 1;
      }
      return b.carbon - a.carbon;
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
  getColor(d) {
    const { dataset } = this.state;
    const colors = ['#fcaf39', '#e2992a', '#cf8618', '#9e6303', '#774c04', '#614005', '#493206'];
    const cs = dataset.filter(d => !this.specialAreas.includes(d.area));
    const i = cs.map(d => d.id).indexOf(d.id);
    if (i !== -1) {
      return colors[i];
    }
    return this.getColor(dataset.find(dd => dd.mapId === d.mapId && dd.area !== d.area));
  }
  getLabel(d, projection) {
    const coordinates = projection(areaCenters.find(dd => d.mapId === dd.id).coordinates);
    return <text onClick={() => this.updateState({ currentId: d.id })} x={coordinates[0]} y={coordinates[1]}>{d.area}</text>;
  }
  updateState(state) {
    this.setState(Object.assign({}, this.state, state));
  }
  render() {
    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = 870 - margin.left - margin.right;
    const height = 615 - margin.top - margin.bottom;
    const linearGradients = ['#f99700', '#553907'];
    const projection = d3.geoMercator()
      .center([120.7, 30.6])
      .scale(30000)
      .translate([width / 2, height / 2]);
    const geoPath = d3.geoPath().projection(projection);
    const { currentId, hoverId, dataset } = this.state;
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
        <svg className={s.mapChart} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="mapLinearChromatic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={linearGradients[0]} />
              <stop offset="100%" stopColor={linearGradients[1]} />
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
          <text x="38" y="90" style={{ fontSize: 24, textAnchor: 'start' }}>碳排放分布热图概览</text>
          <g className={s.leftScale} transform="translate(70, 190)">
            <rect x="0" y="0" width="8" height="300" fill="url(#mapLinearChromatic)" />
            <text x="20" y="30">高</text>
            <text x="20" y="275">低</text>
          </g>

          {sortedData.map(d => (
            <g key={d.uid} className={s.mapItem} transform="translate(0, 40)">
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
        <div className={s.subCharts}>
          <div className={s.subChart}>
            <Label style={{ marginLeft: '38px' }} value={`${datum.area}碳排放趋势`} />
            <ColumnChart data={datum.trend} unit="吨" />
          </div>
          <div className={s.subChart}>
            <Label value={`${datum.area}能源品种碳排放占比`} />
            <CircleChart data={datum.group} style={{ marginLeft: '', height: '210px' }} />
          </div>
        </div>
      </div>
    );
  }
}

CarbonSummary.propTypes = {
  data: PropTypes.object.isRequired,
};
