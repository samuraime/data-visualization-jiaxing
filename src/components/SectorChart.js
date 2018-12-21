import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class SectorChart extends Component {
  render() {
    const margin = { top: 30, right: 0, bottom: 10, left: 0 };
    const width = 495 - margin.left - margin.right;
    const height = 325 - margin.top - margin.bottom;
    // const colors = ['#0346a2', '#0f98e7', '#75bbc8', '#ffaf48', '#ff6161'];
    const colors = d3.schemeCategory20;
    const { data, style } = this.props;
    const total = data.reduce((prev, cur) => prev + cur.value, 0);
    // const calcData = data.filter(d => d.value > 0).sort((a, b) => b.value - a.value)
    //   .map((d, i, a) => {
    //     const sum = arr => arr.reduce((prev, cur) => prev + cur.value, 0);
    //     const start = Math.PI * 2 * sum(a.slice(0, i)) / total;
    //     const end = Math.PI * 2 * sum(a.slice(0, i + 1)) / total;
    //     const p = d.value / total;
    //     return Object.assign({}, d, {
    //       start,
    //       end,
    //       p,
    //     });
    //   });
    const calcData = data.filter(d => d.value / total >= 0.0001).sort((a, b) => b.value - a.value)
      .map((d, i, a) => {
        const everyPartion = (20 / 180) * Math.PI;
        const publicPartion = Math.PI * 2 - everyPartion * a.length;
        const sum = arr => arr.reduce((prev, cur) => prev + cur.value, 0);
        const start = publicPartion * sum(a.slice(0, i)) / total + everyPartion * i;
        const end = publicPartion * sum(a.slice(0, i + 1)) / total + everyPartion * (i + 1);
        const p = d.value / total;
        return Object.assign({}, d, {
          start,
          end,
          p,
        });
      });

    return (
      <svg width="100%" height="100%" style={style}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          <g transform={`translate(${width / 2}, ${height / 2})`}>
            {calcData.map((d, i) => {
              const maxR = 110;
              const r = maxR - 3 * i;
              const x = (r, rad) => r * Math.sin(rad - Math.PI / 2);
              const y = (r, rad) => r * Math.cos(rad - Math.PI / 2);
              const largeArcFlag = d.p > 0.5 ? 1 : 0;
              const labelWidth = 80;
              const fw = 70;
              const middle = (d.start + d.end) / 2;
              const labelRad = Math.floor(middle / (Math.PI / 2)) * Math.PI / 2 + Math.PI / 4;
              const labelR = r * 0.6;
              const labelX = x(labelR, middle);
              const labelY = y(labelR, middle);
              const dir = labelX > 0 ? 1 : -1;
              return (
                <g key={i}>
                  <path
                    d={`
                      M0,0
                      L${x(r, d.start)},${y(r, d.start)}
                      A${r},${r} 0 ${largeArcFlag},0 ${x(r, d.end)},${y(r, d.end)}
                      Z`}
                    fill={colors[i]} stroke="none"
                  />
                  <path
                    d={`
                      M${labelX},${labelY}
                      l${x(fw, labelRad)},${y(fw, labelRad)}
                      h${dir * labelWidth}
                    `}
                    stroke="#fff"
                    fill="none"
                  />
                  <circle cx={labelX} cy={labelY} r="3" fill="rgba(255, 255, 255, .07)" stroke="none" />
                  <circle cx={labelX} cy={labelY} r="1" fill="#fff" stroke="none" />
                  <text
                    x={labelX + x(fw, labelRad) + dir * labelWidth / 2}
                    y={labelY + y(fw, labelRad) - 8}
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

SectorChart.propTypes = {
  data: PropTypes.array.isRequired,
  style: PropTypes.object,
};
