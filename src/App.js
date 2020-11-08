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
      this.state = this.getDefaultState();
    }
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
    return hoursPart + ' ' + hoursLabel + ' ' + minutesPart + ' ' + minutesLabel + ' ' + secondsPart + ' ' + secondsLabel;
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
      this.tempState.timerSeconds--;
      if (this.tempState.isWork) {
        this.tempState.totalWorkedSeconds++;
        let availableBreakSecondsIncrement = this.settings.shortBreakMinutes * 1.0 / this.settings.workMinutes;
        if (this.tempState.availableBreakSeconds >= this.settings.shortBreakMinutes * 60) {
          this.tempState.availableBreakSeconds += availableBreakSecondsIncrement;
        } else {
          this.tempState.hiddenAvailableBreakSeconds += availableBreakSecondsIncrement;
        }
      } else {
        this.tempState.availableBreakSeconds--;
      }
      this.tempState.timerLastUpdatedAt = now;
      if (this.tempState.timerSeconds === 0) {
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

  onClickReset = () => {
    if (window.confirm("Are you sure you want to reset everything to inital state?")) {
      this.setStateAndStorage(this.getDefaultState());
    }
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

  getDefaultState = () => {
    return {
      timerSeconds: this.settings.workMinutes * 60,
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

  render() {
    return (
      <div className="App">
        <Helmet>
          <title>{this.formatSecondsAsTimer(this.state.timerSeconds)}</title>
        </Helmet>

        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" 
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></link>

        <div class="container">
          <div class="row">
            <div class="col-sm offset-sm-11">
              <button className="btn" onClick={this.onClickReset} data-testid="reset-btn">Reset</button>
            </div>
          </div>
          <div class="row">
            <div class="col-sm">
              {this.state.timerRunning === true &&
                <button className="btn btn-warning" onClick={this.onClickHoldWork}>Hold work</button>
              }
              {this.state.timerRunning === false &&
                <button className="btn btn-secondary" onClick={this.onClickResumeWork}>Resume work</button>
              }
              {this.state.isWork === null &&
                <button className="btn btn-success" onClick={this.onClickStartWorking} data-testid="start-working-btn">Start working</button>
              }
            </div>
          </div>
          <div class="row">
            <div class="col-sm">
              <h1 data-testid="timer">{this.formatSecondsAsTimer(this.state.timerSeconds)}</h1>
            </div>
          </div>
          <div class="row">
            <div class="col-sm">
              {(this.state.isWork === true && this.state.availableBreakSeconds) ?
                <>
                  <button className="btn btn-success" onClick={this.onClickGoOnABreak}>Go on a break</button>
                </> : null
              }
              {this.state.isWork === false ?
                <>
                  <button className="btn btn-secondary" onClick={this.onClickReturnToWork}>Return to work</button>
                </> : null
              }
            </div>
          </div>
          <div class="row">
            <div class="col-sm" data-testid="totalWorkedTime">
              {this.formatSecondsAsText(this.state.totalWorkedSeconds)}
            </div>
          </div>
          <div class="row">
            <div class="col-sm" data-testid="availableBreakTime">
              {this.formatSecondsAsText(this.state.availableBreakSeconds)}
            </div>
          </div>
          <div class="row">
            <div class="col-sm">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" onChange={this.onChangeContinousWork}
                  checked={this.state.continousWork} data-testid="cont-work" id="cont-work-check" />
                <label class="form-check-label" for="cont-work-check">
                  Continuous work
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
