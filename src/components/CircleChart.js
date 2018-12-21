import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class CircleChart extends Component {
  render() {
    const margin = { top: 35, right: 0, bottom: 10, left: 0 };
    const width = 495 - margin.left - margin.right;
    const height = 210 - margin.top - margin.bottom;
    // const colors = ['#0f98e7', '#ff6161', '#75bbc8', '#ffaf48', '#ff6161'];
    const colors = d3.schemeCategory20;
    const bgColors = ['#474747', '#4f4f4f'];
    const circleWidth = 15;
    const { data, style } = this.props;
    const total = data.reduce((prev, cur) => prev + cur.value, 0) || 1;
    const calcData = data.filter(d => d.value > 0).sort((a, b) => a.value - b.value)
      .map((d, i, a) => {
        const sum = arr => arr.reduce((prev, cur) => prev + cur.value, 0);
        const start = Math.PI * 2 * sum(a.slice(0, i)) / total;
        const end = Math.PI * 2 * sum(a.slice(0, i + 1)) / total;
        const p = d.value / total;
        return Object.assign({}, d, {
          start,
          end,
          p,
        });
      });
    // const calcData = data.filter(d => d.value / total >= 0.0001).sort((a, b) => a.value - b.value)
    //   .map((d, i, a) => {
    //     const everyPartion = (20 / 180) * Math.PI;
    //     const publicPartion = Math.PI * 2 - everyPartion * a.length;
    //     const sum = arr => arr.reduce((prev, cur) => prev + cur.value, 0);
    //     const start = publicPartion * sum(a.slice(0, i)) / total + everyPartion * i;
    //     const end = publicPartion * sum(a.slice(0, i + 1)) / total + everyPartion * (i + 1);
    //     const p = d.value / total;
    //     return Object.assign({}, d, {
    //       start,
    //       end,
    //       p,
    //     });
    //   });
    return (
      <svg width="100%" height="100%" style={style}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <g transform={`translate(${width / 2}, ${height / 2})`}>
            {Array(6).fill(0).map((d, i, a) => (
              <circle key={i} x="0" y="0" r={circleWidth * (a.length - i)} fill={bgColors[i % 2]} />
            ))}
            {calcData.map((d, i) => {
              const ir = circleWidth * 3;
              const or = circleWidth * 4;
              const x = (r, rad) => r * Math.sin(rad - Math.PI / 2);
              const y = (r, rad) => r * Math.cos(rad - Math.PI / 2);
              const largeArcFlag = d.p > 0.5 ? 1 : 0;
              const labelWidth = 150;
              const middle = (d.start + d.end) / 2;
              const labelR = circleWidth * 4.5;
              const labelX = x(labelR, middle);
              const labelY = y(labelR, middle);
              const dir = labelX > 0 ? 1 : -1;
              return (
                <g key={i}>
                  <path
                    d={`
                      M${x(ir, d.start)},${y(ir, d.start)}
                      A${ir},${ir} 0 ${largeArcFlag},0 ${x(ir, d.end)},${y(ir, d.end)}
                      L${x(or, d.end)},${y(or, d.end)}
                      A${or},${or} 0 ${largeArcFlag},1 ${x(or, d.start)},${y(or, d.start)}
                      Z`}
                    fill={colors[i]} stroke="none"
                  />
                  <path
                    d={`M${labelX},${labelY} l${dir * labelWidth},0v-2`}
                    stroke="#fff"
                  />
                  <circle cx={labelX} cy={labelY} r="3" fill="rgba(255, 255, 255, .07)" stroke="none" />
                  <circle cx={labelX} cy={labelY} r="1" fill="#fff" stroke="none" />
                  <text
                    x={labelX + dir * labelWidth / 2}
                    y={labelY - 8}
                    style={{ fontSize: 10, textAnchor: 'middle' }}
                  >
                    {d.name}{(d.p * 100).toFixed(2)}%
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    );
  }
}

CircleChart.propTypes = {
  data: PropTypes.array.isRequired,
  style: PropTypes.object,
};
