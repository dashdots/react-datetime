import React, {Component} from 'react';

class DateTimePickerYears extends Component {
  render() {
    let year = Number.parseInt(this.props.viewDate.year() / 10, 10) * 10;

    return (
        <table key="a">
          <thead>
          <tr>
            <th key="prev" className="prev">
              <button onClick={this.props.subtractTime(10, 'years')} type="button">‹</button>
            </th>
            <th key="year" className="switch" onClick={this.props.showView('years')} colSpan="2">
              {year + '-' + (year + 9)}
            </th>
            <th key="next" className="next">
              <button onClick={this.props.addTime(10, 'years')} type="button">›</button>
            </th>
          </tr>
          </thead>
        </table>
        <table key="years">
          <tbody>
          {this.renderYears(year)}
          </tbody>
        </table>
      </div>
    );
  }

  renderYears( year ) {
    let years = [],
      i = -1,
      rows = [],
      renderer = this.props.renderYear || this.renderYear.bind(this),
      selectedDate = this.props.selectedDate,
      classes, props
      ;

    year--;
    while (i < 11) {
      classes = 'year';
      if( i === -1 | i === 10 )
        classes += ' old';
      if( selectedDate && selectedDate.year() === year )
        classes += ' active';

      props = {
        key: year,
        'data-value': year,
        className: classes,
        onClick: this.props.setDate('year')
      };

      years.push( renderer( props, year, selectedDate && selectedDate.clone() ));

      if( years.length == 4 ){
        rows.push(<tr key={i}>{years}</tr>);
        years = [];
      }

      year++;
      i++;
    }

    return rows;
  }

  renderYear( props, year, selectedDate ){
    return <td {...props}>{year}</td>;
  }
}

export default DateTimePickerYears;
