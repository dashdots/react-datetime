import React, {Component} from 'react';
import moment from'moment';

class DateTimePickerDays extends Component {

  render() {
    let footer = this.renderFooter(),
      date = this.props.viewDate,
      locale = date.localeData(),
      tableChildren = []
      ;

    tableChildren.push(
      <thead key='th'>
      <tr key='h'>
        <th key='p' className='prev'>
          <button onClick={this.props.subtractTime(1, 'months')} type='button'>‹</button>
        </th>
        <th key='s' className='switch' onClick={this.props.showView('months')} colSpan="5" data-value={this.props.viewDate.month()}>{locale.months( date ) + ' ' + date.year()}</th>
        <th key='n' className='next'>
          <button onClick={this.props.addTime(1, 'months')} type='button'>›</button>
        </th>
      </tr>
      <tr key='d'>
        {
          this.getDaysOfWeek( locale ).map(day => {
            return <th key={day} className='dow'>{day}</th>
          })
        }
      </tr>
      </thead>
    );

    tableChildren.push(
      <tbody key='tb'>
      {this.renderDays()}
      </tbody>
    );

    if( footer ) {
      tableChildren.push( footer );
    }

    return (
      <div className='ReactDatetime-Days'>
        <table>{tableChildren}</table>
      </div>
    );
  }

  /**
   * Get a list of the days of the week
   * depending on the current locale
   * @return {array} A list with the shortname of the days
   */
  getDaysOfWeek( locale ){
    let days = locale._weekdaysMin,
      first = locale.firstDayOfWeek(),
      dow = [],
      i = 0
      ;

    days.forEach(( day ) => {
      dow[ (7 + (i++) - first) % 7 ] = day;
    });

    return dow;
  }

  renderDays() {
    let date = this.props.viewDate,
      selected = this.props.selectedDate && this.props.selectedDate.clone(),
      prevMonth = date.clone().subtract( 1, 'months' ),
      currentYear = date.year(),
      currentMonth = date.month(),
      minDate = this.props.minDate,
      maxDate = this.props.maxDate,
      weeks = [],
      days = [],
      renderer = this.props.renderDay || this.renderDay,
      isValid = this.props.isValidDate || this.isValidDate,
      classes, disabled, dayProps, currentDate
      ;
    //console.log(this.props);

    // Go to the last week of the previous month
    prevMonth.date( prevMonth.daysInMonth() ).startOf('week');
    let lastDay = prevMonth.clone().add(42, 'd');

    while( prevMonth.isBefore( lastDay ) ){
      classes = 'day';
      currentDate = prevMonth.clone();

      if( prevMonth.year() < currentYear || prevMonth.month() < currentMonth )
        classes += ' old';
      else if( prevMonth.year() > currentYear || prevMonth.month() > currentMonth )
        classes += ' new';

      if( selected && prevMonth.isSame( {y: selected.year(), M: selected.month(), d: selected.date()} ) )
        classes += ' active';

      if (prevMonth.isSame(moment(), 'day') )
        classes += ' today';

      disabled = !isValid( currentDate, selected, minDate, maxDate );
      if( disabled )
        classes += ' disabled';

      dayProps = {
        key: prevMonth.format('M_D'),
        'data-value': prevMonth.date(),
        className: classes
      };
      if( !disabled )
        dayProps.onClick = this.props.updateSelectedDate;

      days.push( renderer( dayProps, currentDate, selected ) );

      if( days.length == 7 ){
        weeks.push(<tr key={prevMonth.format('M_D')}>{days}</tr>);
        days = [];
      }

      prevMonth.add( 1, 'd' );
    }

    return weeks;
  }

  renderDay( props, currentDate, selectedDate ){
    return <td {...props}>{currentDate.date()}</td>;
  }

  renderFooter(){
    if( !this.props.timeFormat )
      return '';

    var date = this.props.selectedDate || this.props.viewDate;
    return (
      <tfoot key='tf'>
      <tr>
        <td onClick={this.props.showView('time')} colSpan="7" className="timeToggle">
          {date.format( this.props.timeFormat )}
        </td>
      </tr>
      </tfoot>
    );
  }

  isValidDate(currentDate, selected, minDate, maxDate){
    if(minDate !== undefined) {
      let minDateUnix = moment(moment(minDate).format('YYYY-MM-DD')).unix();
      if(minDateUnix > currentDate.unix()) {
        return false;
      }
    }
    if(maxDate !== undefined) {
      let maxDateUnix = moment(moment(maxDate).format('YYYY-MM-DD')).unix();
      if(maxDateUnix < currentDate.unix()) {
        return false;
      }
    }
    return true;
  }

}

export default DateTimePickerDays;
