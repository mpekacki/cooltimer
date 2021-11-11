import React from "react";
import { Helmet } from "react-helmet";
import "./App.css";
import UserSettings from "./UserSettings";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridMonth from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import SimpleTaskManager from "./SimpleTaskManager";
import TaskTimes from "./TaskTimes";
import Constants from "./Constants";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import CloseButton from "react-bootstrap/CloseButton";
import isEqual from "lodash/isEqual";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import ButtonGroup from "react-bootstrap/ButtonGroup";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSettings = props.defaultSettings;
    this.storage = props.storage;
    this.state = this.getDefaultState();
    if (this.storage && this.storage.state) {
      this.state = Object.assign(this.state, this.storage.state);
      this.state.events.forEach((e) => {
        e.start = new Date(Date.parse(e.start));
        e.end = new Date(Date.parse(e.end));
      });
    }
    if (props.notifications) {
      this.notifications = props.notifications;
      this.notifications.requestPermission().then((result) => {
        if (result === "granted") {
          this.notificationsGranted = true;
        }
      });
    }
    this.plugins = [timeGridPlugin];

    if (window.Worker) {
      this.worker = new Worker("./worker.js");
      this.worker.onmessage = () => {
        this.tick();
      };
    } else {
      this.interval = setInterval(this.tick, 1000);
    }
    this.tick();
  }

  componentWillUnmount() {
    if (this.worker) {
      this.worker.terminate();
    } else {
      clearInterval(this.interval);
    }
  }

  onClickReset = () => {
    if (window.confirm(Constants.RESET_CONFIRMATION_TEXT)) {
      this.setStateAndStorage(this.getStateForReset());
    }
  };

  onClickSettings = () => {
    this.setState({
      settingsVisible: !this.state.settingsVisible,
    });
  };

  onClickToggleCalendar = () => {
    this.setState({
      calendarVisible: !this.state.calendarVisible,
    });
  };

  setStateAndStorage = (state) => {
    this.setState(state);
    if (this.storage && !isEqual(this.storage.state, state)) {
      this.storage.state = Object.assign(this.state, state);
    }
  };

  onChangeSettings = (settings) => {
    this.setStateAndStorage(settings);
  };

  getDefaultState = () => {
    return Object.assign({}, this.defaultSettings.defaultState);
  };

  getStateForReset = () => {
    const stateForReset = this.getDefaultState();
    stateForReset.continousWork = this.state.continousWork;
    stateForReset.autoStartTimers = this.state.autoStartTimers;
    stateForReset.workMinutes = this.state.workMinutes;
    stateForReset.shortBreakMinutes = this.state.shortBreakMinutes;
    stateForReset.longBreakMinutes = this.state.longBreakMinutes;
    stateForReset.longBreakFreq = this.state.longBreakFreq;
    stateForReset.timerSeconds = this.state.workMinutes * 60;
    stateForReset.events = this.state.events;
    stateForReset.tasks = this.state.tasks;
    return stateForReset;
  };

  handleTimerStateChange = (timerState) => {
    this.setStateAndStorage(timerState);
  };

  handleShowNotification = (notificationTitle) => {
    if (this.notifications && this.notificationsGranted) {
      if (!this.notificationQueued) {
        // makes sure that notifications are sent not more frequently than 10 seconds apart
        this.notificationQueued = true;
        setTimeout(this.clearNotificationQueue, 10000);
        this.notifications.createNotification(notificationTitle);
      }
    }
  };

  clearNotificationQueue = () => {
    this.notificationQueued = null;
  };

  handleEventCreated = (event) => {
    let eventTitle = event.wasWork ? "Work" : "Break";
    if (this.state.selectedTask && event.wasWork) {
      eventTitle += " (" + this.state.selectedTask + ")";
    }
    const newEvent = {
      title: eventTitle,
      isWork: event.wasWork,
      start: new Date(event.start),
      end: new Date(event.end),
      color: event.wasWork ? "#3788d8" : "orange",
      task: this.state.selectedTask,
    };
    if (newEvent.start.getTime() === newEvent.end.getTime()) {
      return;
    }
    let newEvents = [...this.state.events, newEvent];
    if (
      newEvents.length > 1 &&
      newEvents[newEvents.length - 1].isWork ===
        newEvents[newEvents.length - 2].isWork &&
      newEvents[newEvents.length - 2].end.getTime() ===
        newEvents[newEvents.length - 1].start.getTime() &&
      newEvents[newEvents.length - 1].task ===
        newEvents[newEvents.length - 2].task
    ) {
      newEvents = newEvents.slice(0, newEvents.length - 1);
      newEvents[newEvents.length - 1].end = new Date(event.end);
    }
    this.setStateAndStorage({
      events: newEvents,
    });
    this.setEventsTimestamp();
  };

  handleTaskCreated = (task) => {
    let newTasks = this.state.tasks;
    newTasks.unshift(task);
    this.setStateAndStorage({
      tasks: newTasks,
    });
    this.setEventsTimestamp();
  };

  handleTaskSelected = (task) => {
    const end =
      this.state.timerStartedAt +
      (this.state.timerStartedWithSeconds - this.state.timerSeconds) * 1000;
    this.handleEventCreated({
      wasWork: this.state.isWork,
      start: this.state.timerStartedAt,
      end: end,
    });

    let newTasks = this.state.tasks;
    if (task) {
      newTasks.splice(this.state.tasks.indexOf(task), 1);
      newTasks.splice(0, 0, task);
    }

    this.setStateAndStorage({
      timerStartedAt: end,
      timerStartedWithSeconds: this.state.timerSeconds,
      selectedTask: task,
      tasks: newTasks,
    });
  };

  handleTaskRemoved = (task) => {
    let newTasks = this.state.tasks;
    newTasks.splice(newTasks.indexOf(task), 1);
    let newEvents = this.state.events.filter((e) => e.task !== task);
    this.setState({
      tasks: newTasks,
      events: newEvents,
      eventsTimestamp: Date.now(),
      selectedTask:
        this.state.selectedTask === task ? null : this.state.selectedTask,
    });
  };

  setEventsTimestamp = () => {
    this.setState({
      eventsTimestamp: Date.now(),
    });
  };

  handleAboutShow = () => {
    this.setState({
      showAboutModal: true,
    });
  };

  handleAboutClose = () => {
    this.setState({
      showAboutModal: false,
    });
  };

  formatSecondsAsTimer() {
    let minutesPart = this.getTimerMinutes();
    let secondsPart = this.getTimerSeconds();
    return minutesPart + ":" + secondsPart;
  }

  getTimerSeconds() {
    return String(this.state.timerSeconds % 60).padStart(2, "0");
  }

  getTimerMinutes() {
    return String(Math.floor(this.state.timerSeconds / 60)).padStart(2, "0");
  }

  formatSecondsAsText(seconds) {
    seconds = Math.round(seconds);
    let hoursPart = Math.floor(seconds / 3600) + "";
    let hoursLabel = hoursPart === "1" ? "hour" : "hours";
    seconds = seconds % 3600;
    let minutesPart = Math.floor(seconds / 60) + "";
    let minutesLabel = minutesPart === "1" ? "minute" : "minutes";
    seconds = seconds % 60;
    let secondsPart = (seconds % 60) + "";
    let secondsLabel = secondsPart === "1" ? "second" : "seconds";
    const formattedTime = (
      (hoursPart !== "0" ? hoursPart + " " + hoursLabel + " " : "") +
      (minutesPart !== "0" ? minutesPart + " " + minutesLabel + " " : "") +
      (secondsPart !== "0" ? secondsPart + " " + secondsLabel : "")
    ).trim();
    return formattedTime || "0 minutes";
  }

  onClickStartWorking = () => {
    this.setStateAndStorage({
      isWork: true,
      timerRunning: true,
    });
    this.markTimerStart(this.state.timerSeconds, Date.now());
  };

  onClickReturnToWork = () => {
    const lastTimerSeconds = this.state.timerSeconds;
    const newTimerSeconds =
      (!this.state.alwaysStartFullWork && this.state.lastWorkTimerSeconds) ||
      this.state.workMinutes * 60;
    this.setStateAndStorage({
      isWork: true,
      timerSeconds: newTimerSeconds,
    });
    this.notifyCycleChange(false, lastTimerSeconds, newTimerSeconds);
  };

  onClickGoOnABreak = () => {
    let availableBreakSeconds = Math.round(this.state.availableBreakSeconds);
    const lastTimerSeconds = this.state.timerSeconds;
    this.setStateAndStorage({
      isWork: false,
      timerSeconds: availableBreakSeconds,
      availableBreakSeconds: availableBreakSeconds,
    });
    this.notifyCycleChange(true, lastTimerSeconds, availableBreakSeconds);
  };

  tick = () => {
    if (!this.state.timerRunning) {
      this.setStateAndStorage({
        timerLastUpdatedAt: Date.now(),
      });
      return;
    }

    let now = Date.now();
    let secondsDiff = Math.round((now - this.state.timerLastUpdatedAt) / 1000);
    let newState = this.calculateNewState(secondsDiff, now);

    this.setStateAndStorage(newState);
  };

  notifyCycleChange = (wasWork, oldTimerSeconds, newTimerSeconds) => {
    const timerEndAt =
      this.state.timerStartedAt +
      (this.state.timerStartedWithSeconds - oldTimerSeconds) * 1000;
    const event = {
      wasWork: wasWork,
      start: this.state.timerStartedAt,
      end: timerEndAt,
    };
    this.handleEventCreated(event);
    this.markTimerStart(newTimerSeconds, timerEndAt);
  };

  markTimerStart = (timerSeconds, timerStartedAt) => {
    const newState = {
      timerStartedAt: timerStartedAt,
      timerStartedWithSeconds: timerSeconds,
    };
    this.setStateAndStorage(newState);
  };

  onClickHoldWork = () => {
    this.setStateAndStorage({
      timerRunning: false,
    });
    this.notifyCycleChange(
      this.state.isWork,
      this.state.timerSeconds,
      this.state.timerSeconds
    );
    this.handleClose();
  };

  onClickResumeWork = () => {
    this.setStateAndStorage({
      timerRunning: true,
    });
    this.markTimerStart(this.state.timerSeconds, Date.now());
  };

  onChangeContinousWork = (event) => {
    this.setStateAndStorage({
      continousWork: event.target.checked,
    });
  };

  onChangeAutoStartTimers = (event) => {
    this.setStateAndStorage({
      autoStartTimers: event.target.checked,
    });
  };

  onChangeAlwaysStartFullWork = (event) => {
    this.setStateAndStorage({
      alwaysStartFullWork: event.target.checked,
    });
  };

  calculateNewState(secondsDiff, now) {
    this.tempState = {
      isWork: this.state.isWork,
      totalWorkedSeconds: this.state.totalWorkedSeconds,
      lastWorkTimerSeconds: this.state.lastWorkTimerSeconds,
      availableBreakSeconds: this.state.availableBreakSeconds,
      hiddenAvailableBreakSeconds: this.state.hiddenAvailableBreakSeconds,
      timerLastUpdatedAt: this.state.timerLastUpdatedAt,
      cycle: this.state.cycle,
      continousWork: this.state.continousWork,
      timerSeconds: this.state.timerSeconds,
      totalCombinedTime: this.state.totalCombinedTime,
    };

    let cycleChanges = [];
    let notificationToShow = null;

    for (let secondsPassed = secondsDiff; secondsPassed > 0; secondsPassed--) {
      this.tempState.timerSeconds--;
      this.tempState.totalCombinedTime++;
      if (this.tempState.isWork) {
        this.tempState.totalWorkedSeconds++;
        this.tempState.lastWorkTimerSeconds = this.tempState.timerSeconds;
        let availableBreakSecondsIncrement =
          (this.state.shortBreakMinutes * 1.0) / this.state.workMinutes;
        if (
          this.tempState.availableBreakSeconds >=
          this.state.shortBreakMinutes * 60
        ) {
          this.tempState.availableBreakSeconds +=
            availableBreakSecondsIncrement;
        } else {
          this.tempState.hiddenAvailableBreakSeconds +=
            availableBreakSecondsIncrement;
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
          if (newCycle === this.state.longBreakFreq) {
            newCycle = 0;
            newAvailableBreakSeconds +=
              this.state.longBreakMinutes * 60 -
              this.state.shortBreakMinutes * 60;
          }
          newAvailableBreakSeconds +=
            this.tempState.hiddenAvailableBreakSeconds;
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
            cycle: newCycle,
          };
        } else {
          stateChange = {
            timerSeconds:
              (!this.state.alwaysStartFullWork &&
                this.state.lastWorkTimerSeconds) ||
              this.state.workMinutes * 60,
            isWork: true,
          };
        }

        stateChange.timerRunning = this.state.autoStartTimers;

        const lastTimerSeconds = this.tempState.timerSeconds;
        this.tempState = Object.assign(this.tempState, stateChange);

        notificationToShow = isWork ? "Work finished" : "Break finished";

        cycleChanges.push({
          isWork: isWork,
          lastTimerSeconds: lastTimerSeconds,
          newTimerSeconds: this.tempState.timerSeconds,
        });
      }
    }

    cycleChanges.forEach((cycleChange) => {
      this.notifyCycleChange(
        cycleChange.isWork,
        cycleChange.lastTimerSeconds,
        cycleChange.newTimerSeconds
      );
    });

    if (notificationToShow) {
      this.handleShowNotification(notificationToShow);
    }

    return this.tempState;
  }

  get cyclesUntilLongBreak() {
    return this.state.longBreakFreq - this.state.cycle;
  }

  handleShow = () => {
    this.setState({
      showHoldModal: true,
    });
  };

  handleClose = () => {
    this.setState({
      showHoldModal: false,
    });
  };

  getFutureAdditionBreakTime() {
    let additionalBreakTime = Math.round(
      this.state.hiddenAvailableBreakSeconds +
        ((this.state.timerSeconds * 1.0) / (this.state.workMinutes * 60.0)) *
          this.state.shortBreakMinutes *
          60
    );
    if (this.state.cycle === this.state.longBreakFreq - 1) {
      additionalBreakTime +=
        (this.state.longBreakMinutes - this.state.shortBreakMinutes) * 60;
    }
    return this.formatSecondsAsText(additionalBreakTime);
  }

  render() {
    return (
      <div className="App">
        <Helmet defer={false}>
          <title>
            {String(Math.floor(this.state.timerSeconds / 60)).padStart(2, "0") +
              ":" +
              String(this.state.timerSeconds % 60).padStart(2, "0")}{" "}
            {this.state.isWork === true
              ? "Work"
              : this.state.isWork === false
              ? "Break"
              : ""}
            {this.state.isWork && this.state.selectedTask
              ? " (" + this.state.selectedTask + ")"
              : ""}
          </title>
        </Helmet>
        <Container>
          <Modal
            size="lg"
            show={this.state.showAboutModal}
            onHide={this.handleAboutClose}
          >
            <Modal.Header closeButton>
              <Modal.Title>About</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Productivity timer that enables you to work in "25 minutes work
                - 5 minutes break" model, but designed to be tolerant of
                situations when you cannot go on a break when you should or when
                you are forced to cut your break short and go back to work right
                now. The goal of the app is to always calculate the amount of
                break time you are entitled to.
              </p>
              <p>
                Features:
                <ul>
                  <li>
                    work in sessions that are at least 25 minutes long, but
                    extend them at will as much as you want - the app will
                    calculate the correct amount of break time available to you
                    at all times
                  </li>
                  <li>
                    get back to work before finishing your break and be able to
                    reclaim the remaining break time later
                  </li>
                  <li>
                    track how much time you spent on a given task, with
                    precision down to minutes
                  </li>
                  <li>configure work and break times per your needs</li>
                  <li>
                    you may safely close the app when the timer is running -
                    when you open the app again, the correct app state will be
                    calculated, taking into account how much time has passed
                    (this also applies to forceful shutdowns like system crashes
                    or power outages)
                  </li>
                  <li>
                    100% private - all the data is kept locally on your device,
                    nothing is sent to the server - in fact, there is no server
                    backend at all
                  </li>
                </ul>
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleAboutClose}>Close</Button>
            </Modal.Footer>
          </Modal>
          <Row>
            <Col>
              <Button
                variant="link"
                onClick={this.handleAboutShow}
                className="float-right"
              >
                About
              </Button>
            </Col>
          </Row>
          <Modal show={this.state.showHoldModal} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>
                {Constants.CONFIRM_HOLD_TIMER_MODAL_HEADER}
              </Modal.Title>
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
          <Row className="mt-3">
            <Col>
              <ButtonGroup>
                {this.state.timerRunning === true && (
                  <Button variant="outline-warning" onClick={this.handleShow}>
                    {Constants.HOLD_WORK_BUTTON_TEXT}
                  </Button>
                )}
                {this.state.timerRunning === false && (
                  <Button
                    variant="secondary"
                    onClick={this.onClickResumeWork}
                    data-testid="resume-work-btn"
                  >
                    {Constants.RESUME_WORK_BUTTON_TEXT}
                  </Button>
                )}
                {this.state.isWork === null && (
                  <Button
                    variant="success"
                    onClick={this.onClickStartWorking}
                    data-testid="start-working-btn"
                  >
                    {Constants.START_WORKING_BUTTON_TEXT}
                  </Button>
                )}
                {this.state.isWork !== null && (
                  <Button
                    variant="outline-dark"
                    onClick={this.onClickReset}
                    data-testid="reset-btn"
                  >
                    {Constants.RESET_BUTTON_TEXT}
                  </Button>
                )}
              </ButtonGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <h3 className="mt-3">
                {this.state.isWork === true
                  ? Constants.WORK_LABEL_TEXT
                  : this.state.isWork === false
                  ? Constants.BREAK_LABEL_TEXT
                  : ""}
              </h3>
            </Col>
          </Row>
          <Row>
            <Col>
              <h1 data-testid="timer">
                {this.getTimerMinutes() + ":" + this.getTimerSeconds()}
              </h1>
            </Col>
          </Row>
          <Row>
            <Col>
              {this.state.isWork === true ? (
                <>
                  {!this.state.availableBreakSeconds ? (
                    <>
                      <OverlayTrigger
                        overlay={
                          <Tooltip id="tooltip-disabled">
                            {Constants.BREAK_WILL_BECOME_AVAILABLE_TEXT}
                          </Tooltip>
                        }
                      >
                        <span className="d-inline-block">
                          <Button
                            disabled
                            variant="success"
                            style={{ pointerEvents: "none" }}
                          >
                            {Constants.GO_ON_A_BREAT_BUTTON_TEXT}
                          </Button>
                        </span>
                      </OverlayTrigger>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="success"
                        onClick={this.onClickGoOnABreak}
                      >
                        {Constants.GO_ON_A_BREAT_BUTTON_TEXT}
                      </Button>
                    </>
                  )}
                </>
              ) : null}
              {this.state.isWork === false ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={this.onClickReturnToWork}
                  >
                    {Constants.RETURN_TO_WORK_BUTTON_TEXT}
                  </Button>
                </>
              ) : null}
            </Col>
          </Row>
          <Row>
            <Col sm={6} className="font-weight-light text-md-right">
              Total time worked:
            </Col>
            <Col sm={6} className="text-md-left" data-testid="totalWorkedTime">
              {this.formatSecondsAsText(this.state.totalWorkedSeconds)}
            </Col>
          </Row>
          <Row>
            <Col sm={6} className="font-weight-light text-md-right">
              Available break time:
            </Col>
            <Col
              sm={6}
              className="text-md-left"
              data-testid="availableBreakTime"
            >
              {this.formatSecondsAsText(this.state.availableBreakSeconds)}
            </Col>
          </Row>
          {this.state.isWork &&
            this.state.availableBreakSeconds <
              this.state.shortBreakMinutes * 60 && (
              <Row>
                <Col
                  xs={12}
                  sm={{ span: 6, offset: 6 }}
                  className="text-md-left text-muted font-weight-light small"
                >
                  +{" "}
                  <span data-testid="futureAdditionBreakTime">
                    {this.getFutureAdditionBreakTime()}
                  </span>{" "}
                  after work timer finishes
                </Col>
              </Row>
            )}
          <Row>
            <Col sm={6} className="font-weight-light text-md-right">
              Cycles until long break ({this.state.longBreakMinutes} minutes):
            </Col>
            <Col sm={6} className="text-md-left" data-testid="longBreakInfo">
              {this.cyclesUntilLongBreak}
            </Col>
          </Row>
          <Row>
            <Col sm={6} className="font-weight-light text-md-right">
              Total time (work + break):
            </Col>
            <Col
              sm={6}
              className="text-md-left"
              data-testid="totalCombinedTime"
            >
              {this.formatSecondsAsText(this.state.totalCombinedTime)}
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Check
                type="checkbox"
                label={Constants.CONTINOUS_WORK_TEXT}
                checked={this.state.continousWork}
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
                checked={this.state.autoStartTimers}
                id="auto-start-timers-check"
                data-testid="auto-start-timers"
                onChange={this.onChangeAutoStartTimers}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Check
                type="checkbox"
                label={Constants.ALWAYS_START_FULL_WORK_TEXT}
                checked={this.state.alwaysStartFullWork}
                id="full-work-check"
                data-testid="full-work"
                onChange={this.onChangeAlwaysStartFullWork}
              />
            </Col>
          </Row>
          <Row className="mt-2 mb-2">
            <Col>
              <Button variant="outline-dark" onClick={this.onClickSettings}>
                Settings
              </Button>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <Collapse in={this.state.settingsVisible}>
                <div>
                  <Card>
                    <Card.Header>
                      <CloseButton onClick={this.onClickSettings} />
                    </Card.Header>
                    <Card.Body>
                      <UserSettings
                        workMinutes={this.state.workMinutes}
                        shortBreakMinutes={this.state.shortBreakMinutes}
                        longBreakMinutes={this.state.longBreakMinutes}
                        longBreakFreq={this.state.longBreakFreq}
                        onchange={this.onChangeSettings}
                      />
                    </Card.Body>
                  </Card>
                </div>
              </Collapse>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <SimpleTaskManager
                onTaskCreate={this.handleTaskCreated}
                onTaskSelected={this.handleTaskSelected}
                tasks={this.state.tasks}
                selectedTask={this.state.selectedTask}
                onTaskRemoved={this.handleTaskRemoved}
                eventsTimestamp={this.state.eventsTimestamp}
                totalMaxVisibleCharacters={255}
              />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <TaskTimes
                events={this.state.events}
                eventsTimestamp={this.state.eventsTimestamp}
              />
            </Col>
          </Row>
          <Row className="mb-2">
            <Col>
              <Button
                variant="outline-dark"
                data-testid="toggle-calendar-btn"
                onClick={this.onClickToggleCalendar}
              >
                {this.state.calendarVisible ? "Hide calendar" : "Show calendar"}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <Collapse in={this.state.calendarVisible}>
                <Card>
                  <Card.Body>
                    {this.state.calendarVisible && (
                      <FullCalendar
                        events={this.state.events}
                        plugins={[timeGridPlugin, dayGridMonth, listPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                          right:
                            "today prev,next dayGridMonth,timeGridWeek,timeGridDay listWeek",
                        }}
                        slotDuration="00:10:00"
                        height={650}
                        eventDidMount={function (event) {
                          event.el.title = event.event.title;
                        }}
                      />
                    )}
                  </Card.Body>
                </Card>
              </Collapse>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default App;
