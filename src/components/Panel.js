import React, { Component } from 'react';
import PropTypes from 'prop-types';

import s from './Panel.module.scss';

export default class Panel extends Component {
  static defaultProps = {
    tab: 1,
  }
  state = {
    visible: false,
  }
  handleHover(enter = true) {
    return () => {
      this.setState(Object.assign({}, this.state, { visible: enter }));
    };
  }
  render() {
    const margin = { top: 30, right: 10, bottom: 0, left: 10 };
    const width = 800 - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom;
    const diff = 30;
    const tabs = ['经济分析及节能管理', '综合展示', '碳排放分析'];
    const { tab } = this.props;
    return (
      <div className={s.root} onMouseEnter={this.handleHover(true)} onMouseLeave={this.handleHover(false)}>
        <div className={this.state.visible ? s.hover : undefined}>
          <svg width="100%" height="100%" viewBox={`0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`}>
            <defs>
              <linearGradient id="controllerLinearGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0676a1" />
                <stop offset="100%" stopColor="#00081c" />
              </linearGradient>
              <filter x="-50%" y="-50%" width="200%" height="200%" id="outerLight" filterUnits="objectBoundingBox">
                <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1" />
                <feGaussianBlur stdDeviation="10" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
                <feColorMatrix values="0 0 0 0 0.568627451   0 0 0 0 0.631372549   0 0 0 0 0.968627451  0 0 0 0.7 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1" />
                <feMerge>
                  <feMergeNode in="shadowMatrixOuter1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              <polygon
                points={`0,${height} ${width},${height} ${width - diff},0 ${diff},0`}
                stroke="#0bc2fc"
                strokeWidth="3"
                fill="url(#controllerLinearGradient)"
                filter="url(#outerLight)"
              />
            </g>
          </svg>
          <div className={s.buttons}>
            {tabs.map((d, i) => (
              <button className={tab === i ? s.active : undefined} key={i} onClick={() => { this.props.onClick(i); }}>{d}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

Panel.propTypes = {
  onClick: PropTypes.func.isRequired,
  tab: PropTypes.number,
};
