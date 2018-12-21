import React, { Component } from 'react';
import PropTypes from 'prop-types';

import s from './PanelChart.module.scss';

/**
 * 仪表盘图
 */
export default class PanelChart extends Component {
  static defaultProps = {
    title: '',
    unit: '',
    data: [0, 100],
    labelColor: '#014ebd',
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
    const { title, unit, color, labelColor } = this.props;
    const data = (this.state.initRender || this.props.data[1] === 0) ? [0, 1] : this.props.data;
    const margin = { top: 80, right: 30, bottom: 60, left: 30 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const PI = Math.PI;
    const x = (r, arc) => r * Math.cos(PI * arc / 180 + PI);
    const y = (r, arc) => r * Math.sin(PI * arc / 180 + PI);

    const deg = data[0] / data[1] * 180;
    const r = 150;
    const tickR = 125;
    /* 指针位置 */
    const px = (r, arc) => r * Math.sin(PI * arc / 180);
    const py = (r, arc) => r * Math.cos(PI * arc / 180);

    return (
      <div className={s.root} ref={(c) => { this.chart = c; }}>
        <div className={s.label} style={{ backgroundColor: labelColor }}>
          <span className={s.pointer} style={{ borderRightColor: labelColor }} />
          <span className={s.text}>{data[0].toFixed(0)}</span>
        </div>
        <svg width="100%" height="100%" viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}>
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            <g className={s.panel} transform={`translate(${width / 2}, ${width / 2})`}>
              <path d={`M-${r},0A${r},${r} 0 0,1 ${x(r, deg)},${y(r, deg)}`} stroke={color} strokeWidth={15} fill="none" />
              <path d={`M${x(r, deg)},${y(r, deg)}A${r},${r} 0 0,1 ${r},0`} stroke="#aaa" strokeWidth={15} fill="none" />
              <g className="ticks">
                {Array(11).fill(0).map((d, i) => 15 * (i + 1)).map((d, i) => (
                  <circle key={i} className="tick" r={4} cx={x(tickR, d)} cy={y(tickR, d)} fill="#fff" stroke="none" />
                ))}
              </g>
            </g>
            <g className={s.pointer} transform={`translate(${width / 2}, ${width / 2}), rotate(${deg})`}>
              <path
                d={`M-60,0L-${px(20, 12.5)},-${py(20, 12.5)}A20,20 0 1,1 -${px(20, 12.5)},${py(20, 12.5)}Z`}
                fill="#8493a8"
              />
              <circle cx="0" cy="0" r="8" fill="#041b36" />
              <animate
                attributeName="transform"
                attributeType="XML"
                from={`translate(${width / 2}, ${width / 2}), rotate(${0})`}
                to={`translate(${width / 2}, ${width / 2}), rotate(${deg})`}
                dur="1s"
                repeatCount="1"
              />
            </g>
            <text className="title" x={width / 2} y={height} style={{ fontSize: 32, textAnchor: 'middle', fill: '#fff' }}>{title}</text>
            <text className="unit" x={width - 20} y={200} style={{ fontSize: 28, textAnchor: 'middle', fill: '#aaa' }}>{unit}</text>
          </g>
        </svg>
      </div>
    );
  }
}

PanelChart.propTypes = {
  data: PropTypes.array.isRequired,
  unit: PropTypes.string,
  title: PropTypes.string,
  labelColor: PropTypes.string,
  color: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
  ]).isRequired,
};
