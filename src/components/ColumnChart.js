import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import s from './ColumnChart.module.scss';
import helper from '../libs/helper';

export default class ColumnChart extends Component {
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
    const { unit, colors, style, unitValue } = this.props;
    let { data, digits } = this.props;
    const { initRender } = this.state;
    const margin = { top: 45, right: 0, bottom: 30, left: 80 };
    const width = 495 - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;
    const x = d3.scaleBand().range([0, width]).padding(1);
    const y = d3.scaleLinear().range([height, 0]);
    const xDomain = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    data = data.map((d) => {
      let month = d.month.toString();
      month = month.replace(/^\d{4}0?/, '');
      return Object.assign({}, d, { month });
    });
    x.domain(xDomain);
    y.domain([0, helper.getMax(
      d3.max(data, d => Number.parseFloat(d.value))
    )]);
    const indent = 15;
    const linearId = `columnChromatic${colors.join('-').replace('#', '')}`;
    if (digits === null && y.domain()[1] / unitValue < 10) {
      digits = 2;
    }
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`} style={style}>
        <defs>
          <linearGradient id={linearId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors[0]} />
            <stop offset="100%" stopColor={colors[1]} />
          </linearGradient>
        </defs>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {xDomain.map((d, i) => (
            <g key={i} className={s.xTicks}>
              <line className={s.grid} x1={x(d)} y1={0} x2={x(d)} y2={height} />
              <text x={x(d)} y={height + 20}>{d}</text>
            </g>
          ))}
          {helper.getFiveTicks(y.domain()).map((d, i) => (
            <text key={i} className={s.yTick} x={-7} y={y(d)}>{(d  / unitValue).toFixed(digits)}</text>
          ))}
          {data.map((d, i) => (
            <rect key={i} className={s.bar} x={x(d.month) - 2} y={initRender ? y(0) : y(d.value)} width="4" height={initRender ? (height - y(0)) : (height - y(d.value))} fill={`url(#${linearId})`} />
          ))}
          <g className={s.x} transform={`translate(0, ${height})`}>
            <path className={s.arrow} d={`M0,0H${width - indent}H${width - 10}l-5,4`} strokeWidth="1.5" />
          </g>
          <g className={s.y}>
            <text y="-20">{unit}</text>
            <path className={s.arrow} d={`M0,${height + 0.75}V-15l-4,5`} strokeWidth="1.5" />
          </g>
        </g>
      </svg>
    );
  }
}

ColumnChart.propTypes = {
  data: PropTypes.array.isRequired,
  unit: PropTypes.string,
  unitValue: PropTypes.number,
  colors: PropTypes.array,
  style: PropTypes.object,
  digits: PropTypes.number,
};
