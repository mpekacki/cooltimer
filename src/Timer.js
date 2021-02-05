import React from 'react';

class Timer extends React.Component {
    constructor(props) {
        super(props);
        let state = JSON.parse(JSON.stringify(props));
        this.timerStartedAt = state.timerStartedAt;
        this.timerStartedWithSeconds = state.timerStartedWithSeconds;
        delete state.timerStartedAt;
        delete state.timerStartedWithSeconds;
        this.state = { ...state };
        // console.log(props);
        setInterval(this.tick, 1000);
        this.tick();
    }

    componentWillReceiveProps(props) {
        if (!this.timerStartedAt)
        this.timerStartedAt = props.timerStartedAt;
        if (!this.timerStartedWithSeconds)
        this.timerStartedWithSeconds = props.timerStartedWithSeconds;
        let state = JSON.parse(JSON.stringify(props));
        delete state.timerStartedAt;
        delete state.timerStartedWithSeconds;
        this.setState(state);
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
        this.markTimerStart(this.state.timerSeconds, Date.now());
    }

    onClickReturnToWork = () => {
        const lastTimerSeconds = this.state.timerSeconds;
        const newTimerSeconds = this.state.workMinutes * 60;
        this.setStateAndStorage({
            isWork: true,
            timerSeconds: newTimerSeconds
        });
        this.notifyCycleChange(false, lastTimerSeconds, newTimerSeconds);
    }

    onClickGoOnABreak = () => {
        let availableBreakSeconds = Math.round(this.state.availableBreakSeconds);
        const lastTimerSeconds = this.state.timerSeconds;
        this.setStateAndStorage({
            isWork: false,
            timerSeconds: availableBreakSeconds,
            availableBreakSeconds: availableBreakSeconds
        });
        this.notifyCycleChange(true, lastTimerSeconds, availableBreakSeconds);
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

        const lastTimerSeconds = this.tempState.timerSeconds;
        this.tempState = Object.assign(this.tempState, stateChange);

        this.props.showNotification(isWork ? 'Work finished' : 'Break finished');
        this.notifyCycleChange(isWork, lastTimerSeconds, this.tempState.timerSeconds);
    }

    notifyCycleChange = (wasWork, oldTimerSeconds, newTimerSeconds) => {
        // console.log({
        //     oldTimerSeconds: oldTimerSeconds,
        //     newTimerSeconds: newTimerSeconds,
        //     stateTimerStartedWithSeconds: this.timerStartedWithSeconds
        // });
        const timerEndAt = this.timerStartedAt + (this.timerStartedWithSeconds - oldTimerSeconds) * 1000;
        const event = {
            wasWork: wasWork,
            start: this.timerStartedAt,
            end: timerEndAt
        };
        this.props.onTimerFinish(event);
        // console.log(event);
        this.markTimerStart(newTimerSeconds, timerEndAt);
    }

    markTimerStart = (timerSeconds, timerStartedAt) => {
        const newState = {
            timerStartedAt: timerStartedAt,
            timerStartedWithSeconds: timerSeconds
        };
        // console.log(newState);
        this.timerStartedAt = timerStartedAt;
        this.timerStartedWithSeconds = timerSeconds;
        this.props.setStateAndStorage(newState);
    }

    onClickHoldWork = () => {
        this.setStateAndStorage({
            timerRunning: false
        });
        this.notifyCycleChange(this.state.isWork, this.state.timerSeconds, this.state.timerSeconds);
    }

    onClickResumeWork = () => {
        this.setStateAndStorage({
            timerRunning: true
        });
        this.markTimerStart(this.state.timerSeconds, Date.now());
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

    setStateAndStorage = (newState) => {
        this.setState(newState);
        this.props.setStateAndStorage(newState);
    }

    get cyclesUntilLongBreak() {
        return this.state.longBreakFreq - this.state.cycle;
    }

    render() {
        return (
            <div>
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
                            <label class="form-check-label" htmlFor="cont-work-check">
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
                            <label class="form-check-label" htmlFor="auto-start-timers-check">
                                Start timers automatically
                </label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Timer;