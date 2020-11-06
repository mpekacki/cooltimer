import React from 'react';
import { Helmet } from 'react-helmet';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.settings = props.settings;
    this.storage = props.storage;
    if (this.storage && this.storage.state) {
      this.state = this.storage.state;
    } else {
      let timerSecondsInitial = props.settings.workMinutes * 60
      this.state = {
        timerSeconds: timerSecondsInitial,
        totalWorkedSeconds: 0,
        isWork: null,
        availableBreakSeconds: 0,
        hiddenAvailableBreakSeconds: 0,
        cycle: 0,
        notificationsGranted: false,
        timerRunning: null,
        continousWork: false,
        timerLastUpdatedAt: Date.now()
      };
    }
    this.tempState = this.state;
    setInterval(this.tick, 1000);
    this.tick();
    if (props.notifications) {
      this.notifications = props.notifications;
      this.notifications.requestPermission().then((result) => {
        if (result === 'granted') {
          this.notificationsGranted = true;
        }
      });
    }
  }

  formatSecondsAsTimer(seconds) {
    let minutesPart = Math.floor(seconds / 60) + '';
    if (minutesPart.length === 1) {
      minutesPart = '0' + minutesPart;
    }
    let secondsPart = (seconds % 60) + '';
    if (secondsPart.length === 1) {
      secondsPart = '0' + secondsPart;
    }
    return minutesPart + ':' + secondsPart;
  }

  formatSecondsAsText(seconds) {
    seconds = Math.round(seconds);
    let hoursPart = Math.floor(seconds / 3600) + '';
    let hoursLabel = hoursPart === '1' ? 'hour' : 'hours';
    seconds = seconds % 3600;
    let minutesPart = Math.floor(seconds / 60) + '';
    let minutesLabel = minutesPart === '1' ? 'minute' : 'minutes';
    seconds = seconds % 60;
    let secondsPart = (seconds % 60) + '';
    let secondsLabel = secondsPart === '1' ? 'second' : 'seconds';
    return hoursPart + ' ' + hoursLabel + ' ' + minutesPart + ' ' + minutesLabel + ' ' + secondsPart + ' ' + secondsLabel + ' ';
  }

  onClickStartWorking = () => {
    this.setStateAndStorage({
      isWork: true,
      timerRunning: true
    });
  }

  onClickReturnToWork = () => {
    this.setStateAndStorage({
      isWork: true,
      timerSeconds: this.settings.workMinutes * 60
    });
  }

  onClickGoOnABreak = () => {
    let availableBreakSeconds = Math.round(this.state.availableBreakSeconds);
    this.setStateAndStorage({
      isWork: false,
      timerSeconds: availableBreakSeconds,
      availableBreakSeconds: availableBreakSeconds
    });
  }

  tick = () => {
    if (!this.state.timerRunning) {
      this.setStateAndStorage({
        timerLastUpdatedAt: Date.now()
      });
      return;
    }

    let now = Date.now();

    let secondsDiff = Math.round((now - this.state.timerLastUpdatedAt) / 1000);

    this.tempState = this.state;

    for (let secondsPassed = secondsDiff; secondsPassed > 0; secondsPassed--) {
      let newState = {};
      let newTimerSeconds = this.tempState.timerSeconds - 1;
      newState.timerSeconds = newTimerSeconds;
      if (this.tempState.isWork) {
        let newTotalWorkedSeconds = this.tempState.totalWorkedSeconds + 1;
        newState.totalWorkedSeconds = newTotalWorkedSeconds;
        let availableBreakSecondsIncrement = this.settings.shortBreakMinutes * 1.0 / this.settings.workMinutes;
        if (this.tempState.availableBreakSeconds >= this.settings.shortBreakMinutes * 60) {
          newState.availableBreakSeconds = this.tempState.availableBreakSeconds + availableBreakSecondsIncrement;
        } else {
          newState.hiddenAvailableBreakSeconds = this.tempState.hiddenAvailableBreakSeconds + availableBreakSecondsIncrement;
        }
      } else {
        let newAvailableBreakSeconds = this.tempState.availableBreakSeconds - 1;
        newState.availableBreakSeconds = newAvailableBreakSeconds;
      }
      newState.timerLastUpdatedAt = now;
      this.tempState = Object.assign(this.tempState, newState);
      if (newTimerSeconds === 0) {
        this.onTimerFinish();
      }
    }
    this.setStateAndStorage(this.tempState);
  }

  onTimerFinish = () => {
    let isWork = this.tempState.isWork;
    let stateChange = {};
    if (isWork) {
      let newCycle = this.tempState.cycle + 1;
      let newAvailableBreakSeconds = this.tempState.availableBreakSeconds;
      if (newCycle === this.settings.longBreakFreq) {
        newCycle = 0;
        newAvailableBreakSeconds += this.settings.longBreakMinutes * 60 - this.settings.shortBreakMinutes * 60;
      }
      newAvailableBreakSeconds += this.tempState.hiddenAvailableBreakSeconds;
      newAvailableBreakSeconds = Math.round(newAvailableBreakSeconds);

      let newTimerSeconds;
      let newIsWork;

      if (this.tempState.continousWork) {
        newTimerSeconds = this.settings.workMinutes * 60;
        newIsWork = true;
      } else {
        newTimerSeconds = newAvailableBreakSeconds;
        newIsWork = false;
      }

      stateChange = {
        timerSeconds: newTimerSeconds,
        availableBreakSeconds: newAvailableBreakSeconds,
        hiddenAvailableBreakSeconds: 0,
        isWork: newIsWork,
        cycle: newCycle
      };
    } else {
      stateChange = {
        timerSeconds: this.settings.workMinutes * 60,
        isWork: true
      };
    }

    this.tempState = Object.assign(this.tempState, stateChange);

    if (this.notifications && this.notificationsGranted) {
      let notificationTitle = isWork ? 'Work finished' : 'Break finished';
      this.notifications.createNotification(notificationTitle);
    }
  }

  onClickHoldWork = () => {
    this.setStateAndStorage({
      timerRunning: false
    });
  }

  onClickResumeWork = () => {
    this.setStateAndStorage({
      timerRunning: true
    });
  }

  onChangeContinousWork = (event) => {
    this.setStateAndStorage({
      continousWork: event.target.checked
    });
  }

  setStateAndStorage = (state) => {
    this.setState(state);
    if (this.storage) {
      this.storage.state = Object.assign(this.state, state);
    }
  }

  render() {
    return (
      <div className="App">
        <Helmet>
          <title>{this.formatSecondsAsTimer(this.state.timerSeconds)}</title>
        </Helmet>

        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></link>
        {this.state.timerRunning === true &&
          <button className="btn btn-warning" onClick={ this.onClickHoldWork }>Hold work</button>
        }
        {this.state.timerRunning === false &&
          <button className="btn btn-secondary" onClick={ this.onClickResumeWork }>Resume work</button>
        }
        {this.state.isWork === null &&
          <button className="btn btn-success" onClick={ this.onClickStartWorking }>Start working</button>
        }
        <br/>
        <h1>{this.formatSecondsAsTimer(this.state.timerSeconds)}</h1>
        {(this.state.isWork === true && this.state.availableBreakSeconds) ? 
          <>
            <button className="btn btn-success" onClick={ this.onClickGoOnABreak }>Go on a break</button>
            <br/>
          </> : null
        }
        {this.state.isWork === false ?
          <>
            <button className="btn btn-secondary" onClick={ this.onClickReturnToWork }>Return to work</button>
            <br/>
          </> : null
        }
        {this.formatSecondsAsText(this.state.totalWorkedSeconds)}<br/>
        {this.formatSecondsAsText(this.state.availableBreakSeconds)}<br/>
        <input 
          type="checkbox" 
          value="Continuous work" 
          data-testid="cont-work" 
          onChange={ this.onChangeContinousWork } 
          checked={ this.state.continousWork }/> Continuous work
      </div>
    );
  }
}

export default App;
