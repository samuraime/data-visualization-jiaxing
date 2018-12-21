import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
// import Helper from '../libs/helper';
import s from './BarChart.module.scss';

export default class CompanyBarChart extends Component {
  static defaultProps = {
    unit: '',
  }
  state = {
    initRender: true,
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState(Object.assign({}, this.state, { initRender: false }));
    });
  }
  render() {
    const { data, unit, style } = this.props;
    const { initRender } = this.state;
    if (data.length < 2) {
      return null;
    }
    const margin = { top: 0, right: 0, bottom: 20, left: 0 };
    const width = 420 - margin.left - margin.right;
    const height = 475 - margin.top - margin.bottom;

    const yStep = height / (data.length - 1);
    const legendWidth = 150;
    const valueUnitWidth = d3.max(data, d => {
      // 粗略计算文字长度, 非英文按英文的1.5x
      const chars = `${d.value.toFixed(0)} ${unit}`.split('');
      return chars.map(dd => /[\x00-\xff]/.test(dd) ? 1 : 1.5) // eslint-disable-line
        .reduce((prev, cur) => prev + cur, 0);
    }) * 6.5;
    const barWidth = width - legendWidth - valueUnitWidth - 10;
    const x = d3.scaleLinear().range([barWidth, 0]);

    x.domain([0, (() => {
      let max = d3.max(data, d => Number.parseFloat(d.value));
      max = Math.ceil(max);
      return max;
    })()]);

    return (
      <svg style={style} width="100%" height="100%" viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}>
        <defs>
          <linearGradient id="barChromatic">
            <stop offset="0%" stopColor="#297197" />
            <stop offset="100%" stopColor="#7ac4c7" />
          </linearGradient>
        </defs>
        <g transform={`translate(0,${margin.bottom / 2})`}>
          {data.map((d, i) => (
            <g key={i} className={s.item} transform={`translate(0,${yStep * i})`}>
              <line x1={legendWidth} y1={0} x2={legendWidth + barWidth} y2={0} stroke="#2d4057" strokeWidth={1.5} />
              <rect x={legendWidth} y={-1.5} fill="url(#barChromatic)" height={3.5} width={initRender ? 0 : barWidth - x(d.value)} />
              <text x={width} y={0} style={{ alignmentBaseline: 'central', textAnchor: 'end', fontSize: 10 }}>{`${d.value.toFixed(0)} ${unit}`}</text>
              <path transform="translate(0, -5.5)" d="M2,0L9,0A2,2 0 0,1 11,2L11,9A2,2 0 0,1 9,11L2,11A2,2 0 0,1 0,9L0,2A2,2 0 0,1 2,0Z" fill="#3a83a2" />
              <text x="5.5" y="0" style={{ alignmentBaseline: 'central', textAnchor: 'middle', fontSize: 8 }}>{i + 1}</text>
              <text x="18" y="0" style={{ alignmentBaseline: 'central', textAnchor: 'start', fontSize: 12 }}>{d.name.replace(/(有限)?公司$/, '')}</text>
            </g>
          ))}
        </g>
      </svg>
    );
  }
}

CompanyBarChart.propTypes = {
  data: PropTypes.array.isRequired,
  style: PropTypes.object,
  unit: PropTypes.string,
};
