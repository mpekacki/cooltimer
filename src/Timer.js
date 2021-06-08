import React from 'react';
import Constants from './Constants';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

class Timer extends React.Component {
    constructor(props) {
        super(props);
        this.interval = setInterval(this.tick, 1000);
        this.tick();
        this.state = {
            showHoldModal: false
        };
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    formatSecondsAsTimer() {
        let minutesPart = this.getTimerMinutes();
        let secondsPart = this.getTimerSeconds();
        return minutesPart + ':' + secondsPart;
    }

    getTimerSeconds() {
        return String(this.props.timerSeconds % 60).padStart(2, '0');
    }

    getTimerMinutes() {
        return String(Math.floor(this.props.timerSeconds / 60)).padStart(2, '0');
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
        let newState = this.calculateNewState(secondsDiff, now);

        this.setStateAndStorage(newState);
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
        this.handleClose();
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

    calculateNewState(secondsDiff, now) {
        this.tempState = {
            isWork: this.props.isWork,
            totalWorkedSeconds: this.props.totalWorkedSeconds,
            availableBreakSeconds: this.props.availableBreakSeconds,
            hiddenAvailableBreakSeconds: this.props.hiddenAvailableBreakSeconds,
            timerLastUpdatedAt: this.props.timerLastUpdatedAt,
            cycle: this.props.cycle,
            continousWork: this.props.continousWork,
            timerSeconds: this.props.timerSeconds,
            totalCombinedTime: this.props.totalCombinedTime
        };

        for (let secondsPassed = secondsDiff; secondsPassed > 0; secondsPassed--) {
            this.tempState.timerSeconds--;
            this.tempState.totalCombinedTime++;
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
        }

        return this.tempState;
    }

    get cyclesUntilLongBreak() {
        return this.props.longBreakFreq - this.props.cycle;
    }

    handleShow = () => {
        this.setState({
            showHoldModal: true
        });
    }

    handleClose = () => {
        this.setState({
            showHoldModal: false
        });
    }

    render() {
        return (
            <>
                <Modal show={this.state.showHoldModal} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{Constants.CONFIRM_HOLD_TIMER_MODAL_HEADER}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{Constants.CONFIRM_HOLD_TIMER_MODAL_TEXT}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            No
                        </Button>
                        <Button variant="primary" onClick={this.onClickHoldWork}>
                            {Constants.CONFIRM_HOLD_TIMER_BUTTON_TEXT}
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Row>
                    <Col>
                        {this.props.timerRunning === true &&
                            <Button variant="outline-warning" onClick={this.handleShow}>{Constants.HOLD_WORK_BUTTON_TEXT}</Button>
                        }
                        {this.props.timerRunning === false &&
                            <Button variant="secondary" onClick={this.onClickResumeWork} data-testid="resume-work-btn">{Constants.RESUME_WORK_BUTTON_TEXT}</Button>
                        }
                        {this.props.isWork === null &&
                            <Button variant="success" onClick={this.onClickStartWorking} data-testid="start-working-btn">{Constants.START_WORKING_BUTTON_TEXT}</Button>
                        }
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h3 className="mt-2">{this.props.isWork === true ? Constants.WORK_LABEL_TEXT : (this.props.isWork === false ? Constants.BREAK_LABEL_TEXT : '')}</h3>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <h1 data-testid="timer">{this.getTimerMinutes() + ':' + this.getTimerSeconds()}</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {this.props.isWork === true ?
                            <>
                                {!this.props.availableBreakSeconds ? <>
                                    <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{Constants.BREAK_WILL_BECOME_AVAILABLE_TEXT}</Tooltip>}>
                                        <span className="d-inline-block">
                                            <Button disabled variant="success" style={{ pointerEvents: 'none' }}>
                                                {Constants.GO_ON_A_BREAT_BUTTON_TEXT}
                                            </Button>
                                        </span>
                                    </OverlayTrigger>
                                </> : <>
                                    <Button variant="success" onClick={this.onClickGoOnABreak}>{Constants.GO_ON_A_BREAT_BUTTON_TEXT}</Button>
                                </>}
                            </> : null
                        }
                        {this.props.isWork === false ?
                            <>
                                <Button variant="secondary" onClick={this.onClickReturnToWork}>{Constants.RETURN_TO_WORK_BUTTON_TEXT}</Button>
                            </> : null
                        }
                    </Col>
                </Row>
                <Row>
                    <Col sm={6} className="font-weight-light text-md-right">
                        Total time worked:
                    </Col>
                    <Col sm={6} className="text-md-left" data-testid="totalWorkedTime">
                        {this.formatSecondsAsText(this.props.totalWorkedSeconds)}
                    </Col>
                </Row>
                <Row>
                    <Col sm={6} className="font-weight-light text-md-right">
                        Available break time:
                    </Col>
                    <Col sm={6} className="text-md-left" data-testid="availableBreakTime">
                        {this.formatSecondsAsText(this.props.availableBreakSeconds)}
                    </Col>
                </Row>
                <Row>
                    <Col sm={6} className="font-weight-light text-md-right">
                        Cycles until long break ({this.props.longBreakMinutes} minutes):
                    </Col>
                    <Col sm={6} className="text-md-left" data-testid="longBreakInfo">
                        {this.cyclesUntilLongBreak}
                    </Col>
                </Row>
                <Row>
                    <Col sm={6} className="font-weight-light text-md-right">
                        Total time (work + break):
                    </Col>
                    <Col sm={6} className="text-md-left" data-testid="totalCombinedTime">
                        {this.formatSecondsAsText(this.props.totalCombinedTime)}
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Check
                            type="checkbox"
                            label={Constants.CONTINOUS_WORK_TEXT}
                            checked={this.props.continousWork}
                            id="cont-work-check"
                            data-testid="cont-work"
                            onChange={this.onChangeContinousWork}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form.Check
                            type="checkbox"
                            label={Constants.START_TIMERS_AUTOMATICALLY_TEXT}
                            checked={this.props.autoStartTimers}
                            id="auto-start-timers-check"
                            data-testid="auto-start-timers"
                            onChange={this.onChangeAutoStartTimers}
                        />
                    </Col>
                </Row>
            </>
        );
    }
}

export default Timer;