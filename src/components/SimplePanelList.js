import React, { Component } from 'react';
import PropTypes from 'prop-types';
import s from './SimplePanelList.module.scss';

/**
 * 简版PanelChart
 */
class PanelChart extends Component {
  static defaultProps = {
    title: '',
    color: '#fff',
    value: 0,
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
    const { title, color, value } = this.props;
    const data = (this.state.initRender || this.props.data[1] === 0) ? [0, 1] : this.props.data;
    const margin = { top: 20, right: 20, bottom: 30, left: 20 };
    const width = 240 - margin.left - margin.right;
    const height = 240 - margin.top - margin.bottom;
    const PI = Math.PI;
    const r = 95;
    const x = (r, arc) => r * Math.cos(PI * arc / 180 + PI);
    const y = (r, arc) => r * Math.sin(PI * arc / 180 + PI);
    const deg = data[0] / data[1] * 180;

    return (
      <svg className={s.child} width="100%" height="100%" viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <g className={s.panel} transform={`translate(${width / 2}, ${width / 2})`}>
            <path d={`M-${r},0A${r},${r} 0 0,1 ${x(r, deg)},${y(r, deg)}`} stroke={color} strokeWidth={10} fill="none" />
            <path d={`M${x(r, deg)},${y(r, deg)}A${r},${r} 0 0,1 ${r},0`} stroke="#183652" strokeWidth={10} fill="none" />
          </g>
          <text className="title" x={width / 2} y={height - 20} style={{ fontSize: 28, textAnchor: 'middle', fill: '#fff' }}>{title}</text>
          <text className="title" x={width / 2} y={height - 100} style={{ fontSize: 36, textAnchor: 'middle', fill: '#fff' }}>{value}</text>
        </g>
      </svg>
    );
  }
}

PanelChart.propTypes = {
  data: PropTypes.array.isRequired,
  title: PropTypes.string,
  color: PropTypes.string,
  value: PropTypes.string,
};


export default function SimplePanelList(props) {
  const colors = ['#0346a2', '#f99700', '#d84121', '#55cdc1', '#183652'];
  const data = props.data;
  const total = data.reduce((prev, cur) => prev + cur.value, 0);
  return (
    <div className={s.root}>
      {data.map((d, i) => {
        const value = d.value * 100 / total;
        const digits = (value < 99.99 && value > 0.01) ? 2 : 0;
        return <PanelChart key={i} data={[d.value, total]} title={d.name} color={colors[i]} value={`${value.toFixed(digits)}%`} />;
      })}
    </div>
  );
}

SimplePanelList.propTypes = {
  data: PropTypes.array.isRequired,
};
