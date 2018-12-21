import React, { Component } from 'react';
import * as d3 from 'd3';

export default class SimpleClock extends Component {
  state = {
    timestamp: Date.now(),
  }
  componentDidMount() {
    // fetch('/api/time')
    //   .then(res => res.json())
    //   .then((res) => {
    //     this.setState(Object.assign({}, this.state, {
    //       timestamp: res.timestamp,
    //     }));
    //     setInterval(() => {
    //       this.setState(Object.assign({}, this.state, {
    //         timestamp: this.state.timestamp + 1000,
    //       }));
    //     }, 1000);
    //   });
    setInterval(() => {
      this.setState(Object.assign({}, this.state, {
        timestamp: this.state.timestamp + 1000,
      }));
    }, 1000);
  }
  getTime() {
    const timeFormat = d3.timeFormat('%Y/%m/%d %H:%M:%S');
    return timeFormat(this.state.timestamp);
  }
  render() {
    if (!this.state.timestamp) {
      return null;
    }
    return (
      <div {...this.props}>{this.getTime()}</div>
    );
  }
}
