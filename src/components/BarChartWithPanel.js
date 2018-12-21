import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helper from '../libs/helper';

// import './CommonLineChart.ccss';

/**
 * 带PanelChart
 */
export default class BarChartWithPanel extends Component {
  static defaultProps = {
    title: '',
    unit: '',
    decimal: 0,
  }

  componentDidMount() {
    const { title, unit, legends, data, decimal } = this.props;
    const schemeCategory3 = ['#4caf50', '#e57f04', '#c9c9c9'];
    const margin = {top: 60, right: 20, bottom: 60, left: 60}
    const width = 440 - margin.left - margin.right
    const height = 320 - margin.top - margin.bottom;
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
    const color = d3.scaleOrdinal(schemeCategory3);
    const line = d3.line()
      .x(d => x(d.month))
      .y(d => y(d.average));

    const svg = d3.select(this.refs.chart).append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const timeParse = d3.timeParse('%Y-%m');
    const dataMap = item => ({
      month: timeParse(item.month),
      average: Number.parseFloat(item.average).toFixed(2),
    });

    data.thisYear = data.thisYear.map(dataMap);
    data.lastYear = data.lastYear.map(item => {
      const { month, average } = item;
      item.month = item.month.replace(/(\d{4})/, match => {
        match = Number.parseInt(match);
        return match + 1;
      })
      return item;
    }).map(dataMap);
    data.target = data.target.map(dataMap);

    const dataset = [
      data.target, data.thisYear, data.lastYear,
    ];

    x.domain(d3.extent(data.target.concat(data.thisYear).concat(data.lastYear), d => d.month));
    // y.domain(Helper.getDomain(
    //   d3.extent(
    //     data.thisYear.concat(data.lastYear).concat(data.target),
    //     d => Number.parseFloat(d.average)
    //   )
    // ));
    y.domain(Helper.getDomain(
      d3.extent(
        data.thisYear.concat(data.lastYear).concat(data.target),
        d => Number.parseFloat(d.average)
      )
    ));

    /* 绘制Axis */
    const xAxis = d3.axisBottom(x)
      .tickSizeInner(-height)
      .tickSizeOuter(0)
      .tickPadding(10)
      .ticks(x.month)
      .tickFormat(d3.timeFormat('%m'));
    const yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickValues(Helper.getFiveTicks(y.domain()))
      .tickSizeInner(-width)
      .tickSizeOuter(0)
      .tickPadding(10);

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .append('path')
      .attr('d', `M0,0H${width + 8}L${width + 2.5},5H${width + 2}L${width + 7},0.5H0`)
      .attr('class', 'arrow');

    const yGroup = svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis);
    yGroup.append('text')
      .attr('dy', '-2em')
      .style('text-anchor', 'middle')
      .text(unit);
    yGroup.append('path')
      .attr('d', 'M0,0L0,-7L-5,-2V-2.5L0.5,-8V0')
      .attr('class', 'arrow');

    /* 绘制三条折线 */
    const brokenLine = svg.append('g')
      .attr('class', 'lines')
      .selectAll('.brokenLine')
      .data(dataset)
      .enter().append('g')
        .attr('class', 'brokenLine');
    brokenLine.append('path')
      .attr('class', 'line')
      .attr('d', line)
      .style('fill', 'none')
      .style('stroke', (d, i) => color(i));

    /* 为当前年份添加额外内容 */
    const tooltip = svg.append('g')
      .attr('class', 'tooltips')
      .selectAll('.tooltip')
      .data(data.thisYear)
      .enter()
      .append('g')
      .attr('class', 'tooltip');
    tooltip.append('circle')
      .attr('cx', d => x(d.month))
      .attr('cy', d => y(d.average))
      .attr('r', 3)
      .style('stroke', schemeCategory3[1])
      .style('stroke-width', 1.5)
      .style('fill', '#041b36');
    tooltip.append("text")
      .attr('dx', '-.5em')
      .attr('dy', '-.5em')
      .attr('x', d => x(d.month))
      .attr('y', d => y(d.average))
      .text(d => Number.parseFloat(d.average).toFixed(decimal))
      .style('font-size', '.8rem')
      .style('text-anchor', 'start')
      .style('fill', '#fff');

    /* 绘制legend */
    const legend = svg.append('g')
      .attr('class', 'legends')
      .selectAll('.legend')
      .data(color.domain())
      .enter().append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${i * 150}, 0)`);

    legend.append('rect')
      .attr('x', 65)
      .attr('y', height + 38)
      .attr('width', 20)
      .attr('height', 3.5)
      .style('fill', color);
    legend.append("text")
      .attr('x', 90)
      .attr('y', height + 40)
      .attr('dy', '.5em')
      .text((d, i) => legends[i])
      .style('font-size', '.8rem')
      .style('text-anchor', 'start')
      .style('fill', '#fff');

    svg.append('g')
      .attr('class', 'title')
      .append('text')
      .text(title)
      .attr('x', (width - margin.left) / 2)
      .attr('y', -30)
      .style('text-anchor', 'middle')
      .style('fill', '#fff');
  }

  render() {
    return (
      <div className="commonLineChart" ref="chart"></div>
    );
  }
}

BarChartWithPanel.propTypes = {
  data: PropTypes.object.isRequired,
  legends: PropTypes.array.isRequired,
  title: PropTypes.string,
  unit: PropTypes.string,
  decimal: PropTypes.number,
}
