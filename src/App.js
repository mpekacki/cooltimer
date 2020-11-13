import React from 'react';
import { Helmet } from 'react-helmet';
import './App.css';
import UserSettings from './UserSettings';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSettings = props.defaultSettings;
    this.storage = props.storage;
    this.state = this.getDefaultState();
    if (this.storage && this.storage.state) {
      this.state = Object.assign(this.state, this.storage.state);
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
    let minutesPart = String(Math.floor(seconds / 60)).padStart(2, '0');
    let secondsPart = String(seconds % 60).padStart(2, '0');
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
      timerSeconds: this.state.workMinutes * 60
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
        let availableBreakSecondsIncrement = this.state.shortBreakMinutes * 1.0 / this.state.workMinutes;
        if (this.tempState.availableBreakSeconds >= this.state.shortBreakMinutes * 60) {
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
      if (newCycle === this.state.longBreakFreq) {
        newCycle = 0;
        newAvailableBreakSeconds += this.state.longBreakMinutes * 60 - this.state.shortBreakMinutes * 60;
      }
      newAvailableBreakSeconds += this.tempState.hiddenAvailableBreakSeconds;
      newAvailableBreakSeconds = Math.round(newAvailableBreakSeconds);

      let newTimerSeconds;
      let newIsWork;

      if (this.tempState.continousWork) {
        newTimerSeconds = this.state.workMinutes * 60;
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
        timerSeconds: this.state.workMinutes * 60,
        isWork: true
      };
    }

    stateChange.timerRunning = this.state.autoStartTimers;

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
      this.setStateAndStorage(this.getDefaultStateWithoutSettings());
    }
  }

  onClickSettings = () => {
    this.setState({
      settingsVisible: !this.state.settingsVisible
    });
  }

  onChangeContinousWork = (event) => {
    this.setStateAndStorage({
      continousWork: event.target.checked
    });
  }

  onChangeAutoStartTimers = (event) => {
    this.setStateAndStorage({
      autoStartTimers: event.target.checked
    });
  }

  setStateAndStorage = (state) => {
    this.setState(state);
    if (this.storage) {
      this.storage.state = Object.assign(this.state, state);
    }
  }

  onChangeSettings = (settings) => {
    this.setStateAndStorage(settings);
  }

  get cyclesUntilLongBreak() {
    return this.state.longBreakFreq - this.state.cycle;
  }

  getDefaultState = () => {
    return {
      timerSeconds: this.defaultSettings.workMinutes * 60,
      totalWorkedSeconds: 0,
      isWork: null,
      availableBreakSeconds: 0,
      hiddenAvailableBreakSeconds: 0,
      cycle: 0,
      notificationsGranted: false,
      timerRunning: null,
      continousWork: false,
      timerLastUpdatedAt: Date.now(),
      autoStartTimers: true,
      workMinutes: this.defaultSettings.workMinutes,
      shortBreakMinutes: this.defaultSettings.shortBreakMinutes,
      longBreakMinutes: this.defaultSettings.longBreakMinutes,
      longBreakFreq: this.defaultSettings.longBreakFreq,
      settingsVisible: false
    };
  }

  getDefaultStateWithoutSettings = () => {
    const defaultState = this.getDefaultState();
    defaultState.continousWork = this.state.continousWork;
    defaultState.autoStartTimers = this.state.autoStartTimers;
    defaultState.workMinutes = this.state.workMinutes;
    defaultState.shortBreakMinutes = this.state.shortBreakMinutes;
    defaultState.longBreakMinutes = this.state.longBreakMinutes;
    defaultState.longBreakFreq = this.state.longBreakFreq;
    defaultState.timerSeconds = this.state.workMinutes * 60;
    return defaultState;
  }

  render() {
    return (
      <div className="App">
        <Helmet>
          <title>{this.formatSecondsAsTimer(this.state.timerSeconds)}</title>
        </Helmet>

        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
          integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous"></link>

        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

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
                <button className="btn btn-secondary" onClick={this.onClickResumeWork} data-testid="resume-work-btn">Resume work</button>
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
            <div class="col-sm font-weight-light text-md-right">
              Total time worked:
            </div>
            <div class="col-sm text-md-left" data-testid="totalWorkedTime">
              {this.formatSecondsAsText(this.state.totalWorkedSeconds)}
            </div>
          </div>
          <div class="row">
            <div class="col-sm font-weight-light text-md-right">
              Available break time:
            </div>
            <div class="col-sm text-md-left" data-testid="availableBreakTime">
              {this.formatSecondsAsText(this.state.availableBreakSeconds)}
            </div>
          </div>
          <div class="row">
            <div class="col-sm font-weight-light text-md-right">
              Cycles until long break ({this.state.longBreakMinutes} minutes):
            </div>
            <div class="col-sm text-md-left" data-testid="longBreakInfo">
              {this.cyclesUntilLongBreak}
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
          <div class="row">
            <div class="col-sm">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" value="" onChange={this.onChangeAutoStartTimers}
                  checked={this.state.autoStartTimers} data-testid="auto-start-timers" id="auto-start-timers-check" />
                <label class="form-check-label" for="auto-start-timers-check">
                  Start timers automatically
                </label>
              </div>
            </div>
          </div>
          <button class="btn m-2" type="button" onClick={this.onClickSettings}>
            Settings
          </button>
          <div class={this.state.settingsVisible ? 'collapse show' : 'collapse'}>
            <div class="card card-body">
              <UserSettings
                workMinutes={this.state.workMinutes} shortBreakMinutes={this.state.shortBreakMinutes}
                longBreakMinutes={this.state.longBreakMinutes} longBreakFreq={this.state.longBreakFreq}
                onchange={this.onChangeSettings} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
