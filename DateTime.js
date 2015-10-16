import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import DaysView from './src/DaysView';
import MonthsView from './src/MonthsView';
import TimeView from './src/TimeView';
import YearsView from './src/YearsView';

const nof = function(){};

class Datetime extends Component {
  //mixins: [
  //  require('react-onclickoutside')
  //],

  static propTypes = {
    // value: TYPES.object | TYPES.string,
    // defaultValue: TYPES.object | TYPES.string,
    onBlur: PropTypes.func,
    onChange: PropTypes.func,
    locale: PropTypes.string,
    input: PropTypes.bool,
    // dateFormat: TYPES.string | TYPES.bool,
    // timeFormat: TYPES.string | TYPES.bool,
    inputProps: PropTypes.object,
    viewMode: PropTypes.oneOf(['years', 'months', 'days', 'time']),
    isValidDate: PropTypes.func,
    minDate: PropTypes.number,//PropTypes.object,
    maxDate: PropTypes.number,//PropTypes.object,
    style: PropTypes.object
  };

  static defaultProps = {
    className: '',
    locale: 'zh-cn',
    defaultValue: '',
    viewMode: 'days',
    inputProps: {},
    input: true,
    onBlur: nof,
    onChange: nof,
    timeFormat: true,
    dateFormat: true,
    style: {}
  };

  constructor(props) {
    super(props);

    let state = this.getStateFromProps( props );
    state.open = !props.input;
    state.currentView = props.dateFormat ? props.viewMode : 'time';
    this.state = state;
  }


  componentWillReceiveProps(nextProps) {
    let formats = this.getFormats( nextProps ), update = {};

    if( nextProps.value ){
      update = this.getStateFromProps( nextProps );
    }
    if ( formats.datetime !== this.getFormats( this.props ).datetime ) {
      update.inputFormat = formats.datetime;
    }

    this.setState( update );
  }

  static moment = moment;

  viewComponents = {
    days: DaysView,
    months: MonthsView,
    years: YearsView,
    time: TimeView
  };

  getStateFromProps(props){
    let formats = this.getFormats( props ),
      date = props.value || props.defaultValue,
      selectedDate, viewDate
      ;

    if( date && typeof date == 'string' )
      selectedDate = this.localMoment( date, formats.datetime );
    else if( date )
      selectedDate = this.localMoment( date );

    if( selectedDate && !selectedDate.isValid() )
      selectedDate = null;

    viewDate = selectedDate ?
      selectedDate.clone().startOf('month') :
      this.localMoment().startOf('month')
    ;

    return {
      inputFormat: formats.datetime,
      viewDate: viewDate,
      selectedDate: selectedDate,
      inputValue: selectedDate ? selectedDate.format( formats.datetime ) : (date || '')
    };
  }

  getFormats(props) {
    let formats = {
        date: props.dateFormat || '',
        time: props.timeFormat || ''
      },
      locale = this.localMoment( props.date ).localeData()
      ;

    if( formats.date === true ){
      formats.date = locale.longDateFormat('L');
    }
    if( formats.time === true ){
      formats.time = locale.longDateFormat('LT');
    }

    formats.datetime = formats.date && formats.time ?
    formats.date + ' ' + formats.time :
    formats.date || formats.time
    ;

    return formats;
  }

  onInputChange(e) {
    let value = e.target == null ? e : e.target.value,
      localMoment = this.localMoment( value, this.state.inputFormat ),
      update = { inputValue: value }
      ;

    if ( localMoment.isValid() && !this.props.value ) {
      update.selectedDate = localMoment;
      update.viewDate = localMoment.clone().startOf('month');
    }
    else {
      update.selectedDate = null;
    }

    return this.setState( update, () => this.props.onChange( localMoment.isValid() ? localMoment : this.state.inputValue ));
  }

  showView( view ){
    let me = this;
    return function(/*e*/){
      me.setState({ currentView: view });
    };
  }

  setDate(type){
    let me = this,
      nextViews = {
        month: 'days',
        year: 'months'
      };
    return function(e){
      me.setState({
        viewDate: me.state.viewDate.clone()[ type ]( parseInt(e.target.getAttribute('data-value')) ).startOf( type ),
        currentView: nextViews[ type ]
      });
    };
  }

  updateTime( op, amount, type, toSelected ) {
    let me = this;

    return function(){
      let update = {}, date = toSelected ? 'selectedDate' : 'viewDate';

      update[ date ] = me.state[ date ].clone()[ op ]( amount, type );

      this.setState( update );
    }.bind(me);
  }

  addTime( amount, type, toSelected ) {
    return this.updateTime( 'add', amount, type, toSelected );
  }

  subtractTime( amount, type, toSelected ) {
    return this.updateTime( 'subtract', amount, type, toSelected );
  }

  allowedSetTime = ['hours','minutes','seconds', 'milliseconds'];

  setTime( type, value ){
    var index = this.allowedSetTime.indexOf( type ) + 1,
      state = this.state,
      date = (state.selectedDate || state.viewDate).clone(),
      nextType
      ;

    // It is needed to set all the time properties
    // to not to reset the time
    date[ type ]( value );
    for (; index < this.allowedSetTime.length; index++) {
      nextType = this.allowedSetTime[index];
      date[ nextType ]( date[nextType]() );
    }

    if( !this.props.value ){


      this.setState({
        selectedDate: date,
        inputValue: date.format( state.inputFormat )
      });
    }
    this.props.onChange( date );
  }

  updateSelectedDate( e ) {
    var target = e.target,
      modifier = 0,
      viewDate = this.state.viewDate,
      currentDate = this.state.selectedDate || viewDate,
      date
      ;

    if(target.className.indexOf('new') != -1)
      modifier = 1;
    else if(target.className.indexOf('old') != -1)
      modifier = -1;

    date = viewDate.clone()
      .month( viewDate.month() + modifier )
      .date( parseInt( target.getAttribute('data-value') ) )
      .hours( currentDate.hours() )
      .minutes( currentDate.minutes() )
      .seconds( currentDate.seconds() )
      .milliseconds( currentDate.milliseconds() )
    ;

    if( !this.props.value ){
      this.setState({
        selectedDate: date,
        viewDate: date.clone().startOf('month'),
        inputValue: date.format( this.state.inputFormat )
      });
    }

    this.props.onChange( date );
  }

  openCalendar() {
    this.setState({ open: true });
  }

  registeredComponents = [];
  handlers = [];

  IGNORE_CLASS = 'ignore-react-onclickoutside';

  isSourceFound(source, localNode) {
    if (source === localNode) {
      return true;
    }
    if (source.correspondingElement) {
      return source.correspondingElement.classList.contains(this.IGNORE_CLASS);
    }
    return source.classList.contains(this.IGNORE_CLASS);
  }

  componentDidMount() {
    let me = this;
    var fn = this.__outsideClickHandler = (function(localNode, eventHandler) {
      return function(evt) {
        evt.stopPropagation();
        var source = evt.target;
        var found = false;
        while(source.parentNode) {
          found = me.isSourceFound(source, localNode);
          if(found) return;
          source = source.parentNode;
        }
        eventHandler(evt);
      }
    }(ReactDOM.findDOMNode(this), this.onClickOutside.bind(me)));

    var pos = this.registeredComponents.length;
    this.registeredComponents.push(this);
    this.handlers[pos] = fn;

    if (!this.props.disableOnClickOutside) {
      this.enableOnClickOutside();
    }
  }

  componentWillUnmount() {
    this.disableOnClickOutside();
    this.__outsideClickHandler = false;
    var pos = this.registeredComponents.indexOf(this);
    if( pos>-1) {
      if (this.handlers[pos]) {
        // clean up so we don't leak memory
        this.handlers.splice(pos, 1);
        this.registeredComponents.splice(pos, 1);
      }
    }
  }

  enableOnClickOutside() {
    let fn = this.__outsideClickHandler;
    document.addEventListener('mousedown', fn);
    document.addEventListener('touchstart', fn);
  }

  disableOnClickOutside() {
    let fn = this.__outsideClickHandler;
    document.removeEventListener('mousedown', fn);
    document.removeEventListener('touchstart', fn);
  }

  onClickOutside(){
    if( this.props.input && this.state.open ){
      this.setState({ open: false });
      this.props.onBlur( this.state.selectedDate || this.state.inputValue );
    }
  }

  localMoment( date, format ){
    var m = moment( date, format );
    if( this.props.locale )
      m.locale( this.props.locale );
    return m;
  }

  componentProps = {
    fromProps: ['value', 'isValidDate', 'renderDay', 'renderMonth', 'renderYear', 'minDate', 'maxDate'],
    fromState: ['viewDate', 'selectedDate' ],
    fromThis: ['setDate', 'setTime', 'showView', 'addTime', 'subtractTime', 'updateSelectedDate', 'localMoment']
  };

  getComponentProps(){
    let me = this,
      formats = this.getFormats( this.props ),
      props = {dateFormat: formats.date, timeFormat: formats.time}
      ;
    this.componentProps.fromProps.map(name => {
      props[ name ] = this.props[ name ];
    });
    this.componentProps.fromState.map(name => {
      props[ name ] = this.state[ name ];
    });
    this.componentProps.fromThis.map(name => {
      props[ name ] = this[ name ].bind(this);
    });

    return props;
  }


  render() {
    let Component = this.viewComponents[ this.state.currentView ],
      className = 'ReactDatetime ' + this.props.className,
      children = []
      ;

    if(this.props.input) {

      let inputProps = Object.assign({
        key: 'i',
        type:'text',
        className: 'form-control',
        onFocus: this.openCalendar.bind(this),
        onChange: this.onInputChange.bind(this),
// Make moment accessible through the Datetime class
        value: this.state.inputValue
      }, this.props.inputProps );

      children = [<input {...inputProps}/>];
    }
    else {
      className += ' ReactDatetime-Static';
    }

    if( this.state.open )
      className += ' ReactDatetime-Open';

    children.push(<div key='dt' className='ReactDatetime-Picker'>
      {React.createElement( Component, this.getComponentProps())}
    </div>);

    return (
      <div className={className} style={this.props.style}>
        {children}
      </div>
    );
  }

}

export default Datetime;
