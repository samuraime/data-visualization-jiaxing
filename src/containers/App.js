import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import update from 'react-addons-update';
import IndexSummary from '../components/IndexSummary';
// import SimpleClock from '../components/SimpleClock';
import Label from '../components/Label';
import ColumnChart from '../components/ColumnChart';
import SimplePanelList from '../components/SimplePanelList';
import BarChart from '../components/BarChart';
import CircleChart from '../components/CircleChart';
import CompanyBarChart from '../components/CompanyBarChart';
import SectorChart from '../components/SectorChart';
import CarbonSummary from '../components/CarbonSummary';
import EconomySummary from '../components/EconomySummary';
import Panel from '../components/Panel';
import mergeFakeData from './mergeFakeData';

import s from './App.module.scss';

export default class App extends Component {
  state = {
    reqs: [
      // 综合
      { url: '/api/summary', mark: 'middle1' },
      { url: '/api/area', mark: 'middle2' },
      { url: '/api/summary/consumption', mark: 'left1' },
      { url: '/api/summary/carbon', mark: 'left2' },
      { url: '/api/area/consumption', mark: 'left3' },
      { url: '/api/summary/company', mark: 'right1' },
      { url: '/api/summary/unit', mark: 'right2' },
      { url: '/api/area/unit', mark: 'right3' },
      // 碳排放
      { url: '/api/carbon/trend', mark: 'cleft1' },
      { url: '/api/carbon/industry', mark: 'cleft2' },
      { url: '/api/carbon/energy', mark: 'cleft3' },
      { url: '/api/carbon', mark: 'cmiddle' },
      { url: '/api/area/carbon', mark: 'cright1' },
      { url: '/api/carbon/company', mark: 'cright2' },
      // 经济
      { url: '/api/area/economy', mark: 'economy' },
    ],
    tab: 1,
  }
  constructor(props) {
    super(props);
    // 这里造一波假数据
    this.state.reqs = mergeFakeData(this.state.reqs);
  }
  componentDidMount() {
    // this.freshData();
    // // 1小时刷新一次数据
    // setInterval(this.freshData.bind(this), 3600000);

    document.addEventListener('keydown', (e) => {
      if ([37, 39].includes(e.keyCode)) {
        e.preventDefault();
        const tabs = 3;
        const plus = e.keyCode === 37 ? -1 : 1;
        this.setState(Object.assign({}, this.state, { tab: (this.state.tab + tabs + plus) % tabs }));
      }
    });
  }
  freshData() {
    try {
        this.state.reqs.forEach(async (d, i) => {
        const result = await fetch(d.url);
        const data = await result.json();
        this.setState(update(this.state, {
          reqs: {
            [i]: {
              data: {
                $set: data,
              },
            },
          },
        }));
      });
    } catch (e) {
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }
  switchTab(i) {
    if (i === this.state.tab) return;
    this.setState(Object.assign({}, this.state, { tab: i }));
  }
  render() {
    const { reqs, tab } = this.state;
    // if (reqs.some(d => d.data === undefined)) {
    //   return null;
    // }
    const d = mark => reqs.find(d => d.mark === mark).data;
    return (
      <div className={s.root}>
        <header>某在线监测直播室{/*<SimpleClock />*/}</header>
        <div className={s.slideContainer}>
          <div className={s.slides} style={{ left: `-${tab * 100}%` }}>
            <div className={[s.tab, s.consumption].join(' ')}>
              <EconomySummary data={d('economy')} />
            </div>
            <div className={[s.tab, s.index].join(' ')}>
              <div>
                <div className={s.top}>
                  <Label value="综合能耗趋势" style={{ marginLeft: '50px' }} />
                  <div className={s.barChart}>
                    <ColumnChart data={d('left1').trend} unit="tce" />
                  </div>
                  <div className={s.panelList}>
                    <SimplePanelList data={d('left1').group} />
                  </div>
                </div>
                <div className={s.middle}>
                  <Label value="碳排放趋势" style={{ marginLeft: '50px' }} />
                  <div className={s.barChart}>
                    <ColumnChart data={d('left2').trend} unit="吨" />
                  </div>
                  <div className={s.panelList}>
                    <SimplePanelList data={d('left2').group} />
                  </div>
                </div>
                <div className={s.bottom}>
                  <Label value="区域能耗排名" style={{ marginLeft: '50px' }} />
                  <BarChart style={{ width: '100%', padding: '20px 20px 0 50px' }} data={d('left3').sort((a, b) => b.value - a.value)} unit="tce" />
                </div>
              </div>
              <div><IndexSummary header={d('middle1')} data={d('middle2')} /></div>
              <div>
                <div className={s.top}>
                  <Label value="接入企业" style={{ marginLeft: '50px' }} />
                  <div className={s.barChart}>
                    <ColumnChart data={d('right1').trend} unit="家" />
                  </div>
                  <div className={s.panelList}>
                    <SimplePanelList data={d('right1').group} />
                  </div>
                </div>
                <div className={s.middle}>
                  <Label value="万元产值能耗" style={{ marginLeft: '50px' }} />
                  <div className={s.barChart}>
                    <ColumnChart data={d('right2').trend} unit="tce/万元" />
                  </div>
                  <div className={s.panelList}>
                    <SimplePanelList data={d('right2').group} />
                  </div>
                </div>
                <div className={s.bottom}>
                  <Label value="区域万元产值能耗排名" style={{ marginLeft: '50px' }} />
                  <BarChart style={{ width: '100%', padding: '20px 20px 0 50px' }} data={d('right3').sort((a, b) => b.value - a.value)} unit="tce/万元" />
                </div>
              </div>
            </div>
            <div className={[s.tab, s.carbon].join(' ')}>
              <div style={{ paddingTop: '40px' }}>
                <div className={s.top}>
                  <Label value="某市碳排放趋势" style={{ marginLeft: '50px' }} />
                  <div className={s.barChart} style={{ height: '275px' }}>
                    <ColumnChart data={d('cleft1')} unit="tce" />
                  </div>
                </div>
                <div className={s.middle}>
                  <Label value="某市行业碳排放占比" style={{ marginLeft: '50px' }} />
                  <SectorChart data={d('cleft2')} style={{ marginLeft: '0', height: '325px' }} />
                </div>
                <div className={s.bottom}>
                  <Label value="某市能源品种碳排放占比" style={{ marginLeft: '50px' }} />
                  <CircleChart data={d('cleft3')} style={{ marginLeft: '', height: '210px' }} />
                </div>
              </div>
              <div><CarbonSummary data={d('cmiddle')} /></div>
              <div style={{ paddingTop: '40px' }}>
                <div className={s.top}>
                  <Label value="区域碳排放排名" style={{ marginLeft: '50px' }} />
                  <BarChart style={{ width: '100%', padding: '20px 20px 30px 50px' }} data={d('cright1')} unit="吨" box={{ height: 290 }} />
                </div>
                <div className={s.bottom}>
                  <Label value="企业碳排放排名" style={{ marginLeft: '50px' }} />
                  <CompanyBarChart style={{ width: '100%', padding: '20px 20px 0 50px' }} data={d('cright2').slice(0, 15)} unit="吨" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Panel tab={this.state.tab} onClick={this.switchTab.bind(this)} />
      </div>
    );
  }
}
