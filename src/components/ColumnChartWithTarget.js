import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import s from './ColumnChartWithTarget.module.scss';
import helper from '../libs/helper';

export default class ColumnChartWithTarget extends Component {
  static defaultProps = {
    unit: '',
    unitValue: 1,
    colors: ['#7ac4c7', '#297197'],
    digits: null,
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
    const { initRender } = this.state;
    const defaultBox = { width: 495, height: 240, top: 45, right: 0, bottom: 30, left: 80 };
    const { unit, colors, style, unitValue, data } = this.props;
    let { digits } = this.props;
    const box = Object.assign({}, defaultBox, this.props.box);
    const width = box.width - box.left - box.right;
    const height = box.height - box.top - box.bottom;
    const x = d3.scaleBand().range([0, width]).padding(1);
    const y = d3.scaleLinear().range([height, 0]);
    const minYear = Math.min(...data.map(d => d.year));
    const xDomain = Array(10).fill(minYear).map((d, i) => d + i);
    x.domain(xDomain);
    y.domain([0, helper.getMax(
      d3.max(data, d => Math.max(
        Number.parseFloat(d.value),
        Number.parseFloat(d.target),
      ))
    )]);
    const indent = 15;
    const linearId = `columnChromatic${colors.join('-').replace('#', '')}`;
    if (digits === null && y.domain()[1] / unitValue < 10) {
      digits = 2;
    }
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width + box.left + box.right} ${height + box.top + box.bottom}`} style={style}>
        <defs>
          <linearGradient id={linearId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <g transform={`translate(${box.left}, ${box.top})`}>
          {xDomain.map((d, i) => (
            <g key={i} className={s.xTicks}>
              <line className={s.grid} x1={x(d)} y1={0} x2={x(d)} y2={height} />
              <text x={x(d)} y={height + 20}>{d}</text>
            </g>
          ))}
          {helper.getFiveTicks(y.domain()).map((d, i) => (
            <text key={i} className={s.yTick} x={-7} y={y(d)}>{(d  / unitValue).toFixed(digits)}</text>
          ))}
          <path
            d={(() => {
              let path = `M${x(data[0].year)},${y(data[0].target)}`;
              data.slice(1).forEach((d) => {
                path += `L${x(d.year)},${y(d.target)}`;
              });
              return path;
            })()}
            fill="none"
            stroke="#c9c9c9"
            strokeWidth="2"
          />
          {data.map((d, i) => (
            <g key={i}>
              <rect className={s.bar} x={x(d.year) - 2} y={initRender ? y(0) : y(d.value)} width="4" height={initRender ? (height - y(0)) : (height - y(d.value))} fill={`url(#${linearId})`} />
              <circle cx={x(d.year)} cy={y(d.target)} r="4" fill="#f68905" />
              <circle cx={x(d.year)} cy={y(d.target)} r="2" fill="#000" />
            </g>
          ))}
          <g className={s.x} transform={`translate(0, ${height})`}>
            <path className={s.arrow} d={`M0,0H${width - indent}H${width - 10}l-5,4`} strokeWidth="1.5" />
          </g>
          <g className={s.y}>
            <text y="-20">{unit}</text>
            <path className={s.arrow} d={`M0,${height + 0.75}V-15l-4,5`} strokeWidth="1.5" />
          </g>
          <g className={s.legend} transform="translate(300, -20)">
            <circle cx={0} cy={0} r="4" fill="#f68905" />
            <circle cx={0} cy={0} r="2" fill="#000" />
            <text x={10}>目标</text>
            <rect x={50} y={-4} width={8} height={8} fill={`url(#${linearId})`} />
            <text x={65} y={0}>完成</text>
          </g>
        </g>
      </svg>
    );
  }
}

ColumnChartWithTarget.propTypes = {
  data: PropTypes.array.isRequired,
  unit: PropTypes.string,
  unitValue: PropTypes.number,
  colors: PropTypes.array,
  style: PropTypes.object,
  digits: PropTypes.number,
  box: PropTypes.object,
};
