import React from 'react';

class Timer extends React.Component {
    constructor(props) {
        super(props);
        setInterval(this.tick, 1000);
        this.tick();
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
        this.markTimerStart(this.props.timerSeconds, Date.now());
    }

    onClickReturnToWork = () => {
        const lastTimerSeconds = this.props.timerSeconds;
        const newTimerSeconds = this.props.workMinutes * 60;
        this.setStateAndStorage({
            isWork: true,
            timerSeconds: newTimerSeconds
        });
        this.notifyCycleChange(false, lastTimerSeconds, newTimerSeconds);
    }

    onClickGoOnABreak = () => {
        let availableBreakSeconds = Math.round(this.props.availableBreakSeconds);
        const lastTimerSeconds = this.props.timerSeconds;
        this.setStateAndStorage({
            isWork: false,
            timerSeconds: availableBreakSeconds,
            availableBreakSeconds: availableBreakSeconds
        });
        this.notifyCycleChange(true, lastTimerSeconds, availableBreakSeconds);
    }

    tick = () => {
        if (!this.props.timerRunning) {
            this.setStateAndStorage({
                timerLastUpdatedAt: Date.now()
            });
            return;
        }

        let now = Date.now();
        let secondsDiff = Math.round((now - this.props.timerLastUpdatedAt) / 1000);
        this.tempState = {
            isWork: this.props.isWork,
            totalWorkedSeconds: this.props.totalWorkedSeconds,
            availableBreakSeconds: this.props.availableBreakSeconds,
            hiddenAvailableBreakSeconds: this.props.hiddenAvailableBreakSeconds,
            timerLastUpdatedAt: this.props.timerLastUpdatedAt,
            cycle: this.props.cycle,
            continousWork: this.props.continousWork,
            timerSeconds: this.props.timerSeconds
        };

        for (let secondsPassed = secondsDiff; secondsPassed > 0; secondsPassed--) {
            this.tempState.timerSeconds--;
            if (this.tempState.isWork) {
                this.tempState.totalWorkedSeconds++;
                let availableBreakSecondsIncrement = this.props.shortBreakMinutes * 1.0 / this.props.workMinutes;
                if (this.tempState.availableBreakSeconds >= this.props.shortBreakMinutes * 60) {
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
            if (newCycle === this.props.longBreakFreq) {
                newCycle = 0;
                newAvailableBreakSeconds += this.props.longBreakMinutes * 60 - this.props.shortBreakMinutes * 60;
            }
            newAvailableBreakSeconds += this.tempState.hiddenAvailableBreakSeconds;
            newAvailableBreakSeconds = Math.round(newAvailableBreakSeconds);

            let newTimerSeconds;
            let newIsWork;

            if (this.tempState.continousWork) {
                newTimerSeconds = this.props.workMinutes * 60;
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
                timerSeconds: this.props.workMinutes * 60,
                isWork: true
            };
        }

        stateChange.timerRunning = this.props.autoStartTimers;

        const lastTimerSeconds = this.tempState.timerSeconds;
        this.tempState = Object.assign(this.tempState, stateChange);

        this.props.showNotification(isWork ? 'Work finished' : 'Break finished');
        this.notifyCycleChange(isWork, lastTimerSeconds, this.tempState.timerSeconds);
    }

    notifyCycleChange = (wasWork, oldTimerSeconds, newTimerSeconds) => {
        const timerEndAt = this.props.timerStartedAt + (this.props.timerStartedWithSeconds - oldTimerSeconds) * 1000;
        const event = {
            wasWork: wasWork,
            start: this.props.timerStartedAt,
            end: timerEndAt
        };
        this.props.onTimerFinish(event);
        this.markTimerStart(newTimerSeconds, timerEndAt);
    }

    markTimerStart = (timerSeconds, timerStartedAt) => {
        const newState = {
            timerStartedAt: timerStartedAt,
            timerStartedWithSeconds: timerSeconds
        };
        this.props.setStateAndStorage(newState);
    }

    onClickHoldWork = () => {
        this.setStateAndStorage({
            timerRunning: false
        });
        this.notifyCycleChange(this.props.isWork, this.props.timerSeconds, this.props.timerSeconds);
    }

    onClickResumeWork = () => {
        this.setStateAndStorage({
            timerRunning: true
        });
        this.markTimerStart(this.props.timerSeconds, Date.now());
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
        this.props.setStateAndStorage(newState);
    }

    get cyclesUntilLongBreak() {
        return this.props.longBreakFreq - this.props.cycle;
    }

    render() {
        return (
            <div>
                <div class="row">
                    <div class="col-sm">
                        {this.props.timerRunning === true &&
                            <button className="btn btn-warning" onClick={this.onClickHoldWork}>Hold work</button>
                        }
                        {this.props.timerRunning === false &&
                            <button className="btn btn-secondary" onClick={this.onClickResumeWork} data-testid="resume-work-btn">Resume work</button>
                        }
                        {this.props.isWork === null &&
                            <button className="btn btn-success" onClick={this.onClickStartWorking} data-testid="start-working-btn">Start working</button>
                        }
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm">
                        <h1 data-testid="timer">{this.formatSecondsAsTimer(this.props.timerSeconds)}</h1>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm">
                        {(this.props.isWork === true && this.props.availableBreakSeconds) ?
                            <>
                                <button className="btn btn-success" onClick={this.onClickGoOnABreak}>Go on a break</button>
                            </> : null
                        }
                        {this.props.isWork === false ?
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
                        {this.formatSecondsAsText(this.props.totalWorkedSeconds)}
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm font-weight-light text-md-right">
                        Available break time:
            </div>
                    <div class="col-sm text-md-left" data-testid="availableBreakTime">
                        {this.formatSecondsAsText(this.props.availableBreakSeconds)}
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm font-weight-light text-md-right">
                        Cycles until long break ({this.props.longBreakMinutes} minutes):
            </div>
                    <div class="col-sm text-md-left" data-testid="longBreakInfo">
                        {this.cyclesUntilLongBreak}
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="" onChange={this.onChangeContinousWork}
                                checked={this.props.continousWork} data-testid="cont-work" id="cont-work-check" />
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
                                checked={this.props.autoStartTimers} data-testid="auto-start-timers" id="auto-start-timers-check" />
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