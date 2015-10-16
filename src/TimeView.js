import React, {Component} from 'react';

class DateTimePickerTime extends Component {

  constructor(props) {
    super(props);
    this.state = this.calculateState(props);
  }

  calculateState() {
    let date = this.props.selectedDate || this.props.viewDate,
      format = this.props.timeFormat,
      counters = [];

    if (format.indexOf('H') != -1 || format.indexOf('h') != -1) {
      counters.push('hours');
      if (format.indexOf('m') != -1) {
        counters.push('minutes');
        if (format.indexOf('s') != -1) {
          counters.push('seconds');
        }
      }
    }

    return {
      hours: date.format('H'),
      minutes: date.format('mm'),
      seconds: date.format('ss'),
      milliseconds: date.format('SSS'),
      counters: counters
    }
  }

  renderCounter(type) {
    return (
      <div key={type} className="ReactDatetime-Counter">
        <button className="btn" onMouseDown={this.onStartClicking.bind(this)('increase', type )} type="button">
          ▲
        </button>
        <div className="ReactDatetime-Count">{this.state[type]}</div>
        <button className="btn" onMouseDown={this.onStartClicking.bind(this)('decrease', type)} type="button">
          ▼
        </button>
      </div>
    );
  }

  render() {
    let me = this, counters = [];

    this.state.counters.map(c => {
      if (counters.length) {
        counters.push(<div key={`sep${counters.length}`} className="ReactDatetime-CounterSeparator">:</div>);
      }
      counters.push(me.renderCounter(c));
    });

    if (this.state.counters.length == 3 && this.props.timeFormat.indexOf('S') != -1) {
      counters.push(<div key='sep5' className="ReactDatetime-CounterSeparator">:</div>)
      counters.push(
        <div className="ReactDatetime-Counter ReactDatetime-Milli" key="m">
          <input value={this.state.milliseconds} type="text" onChange={this.updateMilli.bind(this)}/>
        </div>
      );
    }

    return (
      <div className="ReactDatetime-Time">
        <table>
          {this.renderHeader()}
          <tbody key="b">
          <tr>
            <td>
              <div className="ReactDatetime-Counters">{counters}</div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    );
  }

  componentWillReceiveProps(nextProps, nextState) {
    this.setState(this.calculateState(nextProps));
  }

  updateMilli(e) {
    let milli = Number.parseInt(e.target.value);
    if (milli == e.target.value && milli >= 0 && milli < 1000) {
      this.props.setTime('milliseconds', milli);
      this.setState({milliseconds: milli});
    }
  }

  renderHeader() {
    if (!this.props.dateFormat)
      return <thead/>;

    let date = this.props.selectedDate || this.props.viewDate;
    return (
      <thead key="h">
      <tr>
        <th className="switch" colSpan="4" onClick={this.props.showView('days')}>{date.format(this.props.dateFormat)}</th>
      </tr>
      </thead>
    );
  }

  onStartClicking(action, type) {
    let me = this;

    return async function () {
      let update = {};
      update[type] = me[action](type);
      await me.setState(update);
      me.props.setTime(type, update[type]);
      me.setState(update);

      me.timer = setTimeout(function () {
        me.increaseTimer = setInterval(function () {
          update[type] = me[action](type);
          me.props.setTime(type, update[type]);
          me.setState(update);
        }, 70);
      }, 500);

      me.mouseUpListener = function () {
        clearTimeout(me.timer);
        clearInterval(me.increaseTimer);

        me.props.setTime(type, me.state[type]);
        me.setState(update);
        document.body.removeEventListener('mouseup', me.mouseUpListener);
      };

      document.body.addEventListener('mouseup', me.mouseUpListener);
    };
  }

  maxValues = {
    hours: 23,
    minutes: 59,
    seconds: 59,
    milliseconds: 999
  };

  padValues = {
    hours: 1,
    minutes: 2,
    seconds: 2,
    milliseconds: 3
  };

  increase(type) {
    let value = Number.parseInt(this.state[type]) + 1;
    if (value > this.maxValues[type])
      value = 0;
    return this.pad(type, value);
  }

  decrease(type) {
    let value = Number.parseInt(this.state[type]) - 1;
    if (value < 0)
      value = this.maxValues[type];
    return this.pad(type, value);
  }

  pad(type, value) {
    let str = value + '';
    while (str.length < this.padValues[type])
      str = '0' + str;
    return str;
  }
}

export default DateTimePickerTime;
