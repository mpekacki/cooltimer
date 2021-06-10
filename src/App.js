import React from 'react';
import { Helmet } from 'react-helmet';
import './App.css';
import UserSettings from './UserSettings';
import Timer from './Timer';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridMonth from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import SimpleTaskManager from './SimpleTaskManager';
import TaskTimes from './TaskTimes';
import Constants from './Constants';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Collapse from 'react-bootstrap/Collapse';
import CloseButton from 'react-bootstrap/CloseButton';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.defaultSettings = props.defaultSettings;
    this.storage = props.storage;
    this.state = this.getDefaultState();
    if (this.storage && this.storage.state) {
      this.state = Object.assign(this.state, this.storage.state);
      this.state.events.forEach(e => {
        e.start = new Date(Date.parse(e.start));
        e.end = new Date(Date.parse(e.end));
      });
    }
    if (props.notifications) {
      this.notifications = props.notifications;
      this.notifications.requestPermission().then((result) => {
        if (result === 'granted') {
          this.notificationsGranted = true;
        }
      });
    }
    this.plugins = [timeGridPlugin];
  }

  onClickReset = () => {
    if (window.confirm(Constants.RESET_CONFIRMATION_TEXT)) {
      this.setStateAndStorage(this.getStateForReset());
    }
  }

  onClickSettings = () => {
    this.setState({
      settingsVisible: !this.state.settingsVisible
    });
  }

  onClickToggleCalendar = () => {
    this.setState({
      calendarVisible: !this.state.calendarVisible
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

  getDefaultState = () => {
    return {
      timerSeconds: this.defaultSettings.workMinutes * 60,
      lastWorkTimerSeconds: this.defaultSettings.workMinutes * 60,
      totalWorkedSeconds: 0,
      isWork: null,
      availableBreakSeconds: 0,
      hiddenAvailableBreakSeconds: 0,
      totalCombinedTime: 0,
      cycle: 0,
      notificationsGranted: false,
      timerRunning: null,
      continousWork: this.defaultSettings.continousWork,
      timerLastUpdatedAt: Date.now(),
      autoStartTimers: true,
      workMinutes: this.defaultSettings.workMinutes,
      shortBreakMinutes: this.defaultSettings.shortBreakMinutes,
      longBreakMinutes: this.defaultSettings.longBreakMinutes,
      longBreakFreq: this.defaultSettings.longBreakFreq,
      settingsVisible: false,
      calendarVisible: false,
      events: [],
      timerStartedAt: null,
      timerStartedWithSeconds: null,
      tasks: []
    };
  }

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
  }

  handleTimerStateChange = (timerState) => {
    this.setStateAndStorage(timerState);
  }

  handleShowNotification = (notificationTitle) => {
    if (this.notifications && this.notificationsGranted) {
      if (!this.notificationQueued) {
        // makes sure that notifications are sent not more frequently than 10 seconds apart
        this.notificationQueued = true;
        setTimeout(this.clearNotificationQueue, 10000);
        this.notifications.createNotification(notificationTitle);
      }
    }
  }

  clearNotificationQueue = () => {
    this.notificationQueued = null;
  }

  handleEventCreated = (event) => {
    let eventTitle = event.wasWork ? 'Work' : 'Break';
    if (this.state.selectedTask && event.wasWork) {
      eventTitle += ' (' + this.state.selectedTask + ')';
    }
    const newEvent = {
      title: eventTitle,
      isWork: event.wasWork,
      start: new Date(event.start),
      end: new Date(event.end),
      color: event.wasWork ? '#3788d8' : 'orange',
      task: this.state.selectedTask
    };
    if (newEvent.start.getTime() === newEvent.end.getTime()) {
      return;
    }
    let newEvents = [...this.state.events, newEvent];
    if (newEvents.length > 1 && newEvents[newEvents.length - 1].isWork === newEvents[newEvents.length - 2].isWork
      && newEvents[newEvents.length - 2].end.getTime() === newEvents[newEvents.length - 1].start.getTime()
      && newEvents[newEvents.length - 1].task === newEvents[newEvents.length - 2].task) {
      newEvents = newEvents.slice(0, newEvents.length - 1);
      newEvents[newEvents.length - 1].end = new Date(event.end);
    }
    this.setStateAndStorage({
      events: newEvents
    });
    this.setEventsTimestamp();
  }

  handleTaskCreated = (task) => {
    let newTasks = this.state.tasks;
    newTasks.push(task);
    this.setStateAndStorage({
      tasks: newTasks
    });
    this.setEventsTimestamp();
  }

  handleTaskSelected = (task) => {
    const end = this.state.timerStartedAt + (this.state.timerStartedWithSeconds - this.state.timerSeconds) * 1000;
    this.handleEventCreated({
      wasWork: this.state.isWork,
      start: this.state.timerStartedAt,
      end: end
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
      tasks: newTasks
    });
  }

  setEventsTimestamp() {
    this.setState({
      eventsTimestamp: Date.now()
    });
  }

  render() {
    return (
      <div className="App">
        <Helmet defer={false}>
          <title>{String(Math.floor(this.state.timerSeconds / 60)).padStart(2, '0') + ':' + String(this.state.timerSeconds % 60).padStart(2, '0')} {this.state.isWork === true ? "Work" : ( this.state.isWork === false ? "Break" : "" )}{this.state.isWork && this.state.selectedTask ? ' (' + this.state.selectedTask + ')' : ''}</title>
        </Helmet>
        <Container>
          <Timer timerSeconds={this.state.timerSeconds}
            lastWorkTimerSeconds={this.state.lastWorkTimerSeconds}
            totalWorkedSeconds={this.state.totalWorkedSeconds}
            isWork={this.state.isWork}
            availableBreakSeconds={this.state.availableBreakSeconds}
            hiddenAvailableBreakSeconds={this.state.hiddenAvailableBreakSeconds}
            totalCombinedTime={this.state.totalCombinedTime}
            cycle={this.state.cycle}
            timerRunning={this.state.timerRunning}
            continousWork={this.state.continousWork}
            timerLastUpdatedAt={this.state.timerLastUpdatedAt}
            autoStartTimers={this.state.autoStartTimers}
            workMinutes={this.state.workMinutes}
            shortBreakMinutes={this.state.shortBreakMinutes}
            longBreakMinutes={this.state.longBreakMinutes}
            longBreakFreq={this.state.longBreakFreq}
            timerStartedAt={this.state.timerStartedAt}
            timerStartedWithSeconds={this.state.timerStartedWithSeconds}
            setStateAndStorage={this.handleTimerStateChange}
            showNotification={this.handleShowNotification}
            onTimerFinish={this.handleEventCreated}
            onClickReset={this.onClickReset} />
          <Row>
            <Col>
              <Button variant="outline-dark" className="m-2" onClick={this.onClickSettings}>Settings</Button>
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
                        workMinutes={this.state.workMinutes} shortBreakMinutes={this.state.shortBreakMinutes}
                        longBreakMinutes={this.state.longBreakMinutes} longBreakFreq={this.state.longBreakFreq}
                        onchange={this.onChangeSettings} />
                    </Card.Body>
                  </Card>
                </div>
              </Collapse>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <SimpleTaskManager onTaskCreate={this.handleTaskCreated} onTaskSelected={this.handleTaskSelected} tasks={this.state.tasks} selectedTask={this.state.selectedTask} />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <TaskTimes events={this.state.events} eventsTimestamp={this.state.eventsTimestamp} />
            </Col>
          </Row>
          <Row className="mb-2">
            <Col>
              <Button variant="outline-dark" onClick={this.onClickToggleCalendar}>{this.state.calendarVisible ? 'Hide calendar' : 'Show calendar'}</Button>
            </Col>
          </Row>
          <Row>
            <Col>
              <Collapse in={this.state.calendarVisible}>
                <Card>
                  <Card.Body>
                    <FullCalendar events={this.state.events} plugins={[timeGridPlugin, dayGridMonth, listPlugin]} initialView="timeGridWeek" headerToolbar={
                      { right: 'today prev,next dayGridMonth,timeGridWeek,timeGridDay listWeek' }
                    } slotDuration='00:10:00' height={650} eventDidMount={function (event) {
                      event.el.title = event.event.title;
                    }} />
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
