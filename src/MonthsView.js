import React, {Component} from 'react';
import DOM from 'react-dom';
import moment from'moment';

class DateTimePickerMonths extends Component {
  render() {
    return (
      <div className="ReactDatetime-Months">
        <table key="a">
          <thead>
          <tr>
            <th key="prev" className="prev">
              <button onClick={this.props.subtractTime(1, 'years')} type="button">‹</button>
            </th>
            <th key="year" className="switch" onClick={this.props.showView('years')} colSpan="2" data-value={this.props.viewDate.year()}>
              {this.props.viewDate.year()}
            </th>
            <th key="next" className="next">
              <button onClick={this.props.addTime(1, 'years')} type="button">›</button>
            </th>
          </tr>
          </thead>
        </table>
        <table key="months">
          <tbody key="b">{this.renderMonths()}</tbody>
        </table>
      </div>
    );
  }

  renderMonths() {
    var date = this.props.selectedDate,
      month = this.props.viewDate.month(),
      year = this.props.viewDate.year(),
      rows = [],
      i = 0,
      months = [],
      renderer = this.props.renderMonth || this.renderMonth.bind(this),
      classes, props
      ;

    while (i < 12) {
      classes = 'month';
      if( date && i === month && year === date.year() )
        classes += ' active';

      props = {
        key: i,
        'data-value': i,
        className: classes,
        onClick: this.props.setDate('month')
      };

      months.push( renderer( props, i, year, date && date.clone() ));

      if(months.length === 4){
        rows.push(<tr key={month + '_' + rows.length}>{months}</tr>);
        months = [];
      }

      i++;
    }

    return rows;
  }

  renderMonth( props, month, year, selectedDate ) {
    return <td {...props}>{this.props.viewDate.localeData()._monthsShort[ month ]}</td>;
  }
}

export default DateTimePickerMonths;
