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
    // if (timerState.timerStartedAt < this.state.timerStartedAt) {
    //   timerState.timerStartedAt = this.state.timerStartedAt;
    // }
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
    if (this.state.selectedTask) {
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
        <Helmet>
          <title>Timer</title>
        </Helmet>

        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossOrigin="anonymous"></link>

        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossOrigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossOrigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js" integrity="sha384-B4gt1jrGC7Jh4AgTPSdUtOBvfO8shuf57BaghqFfPlYxofvL8/KUEfYiJOMMV+rV" crossOrigin="anonymous"></script>
        
        <Container>
          <Row>
            <Col sm={{ offset: 11 }}>
              <Button variant="light" onClick={this.onClickReset} data-testid="reset-btn">{Constants.RESET_BUTTON_TEXT}</Button>
            </Col>
          </Row>
          <Timer timerSeconds={this.state.timerSeconds}
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
            onTimerFinish={this.handleEventCreated} />
          <Button variant="light" className="m-2" onClick={this.onClickSettings}>Settings</Button>
          <div className={this.state.settingsVisible ? 'collapse show' : 'collapse'}>
            <div className="card card-body row">
              <UserSettings
                workMinutes={this.state.workMinutes} shortBreakMinutes={this.state.shortBreakMinutes}
                longBreakMinutes={this.state.longBreakMinutes} longBreakFreq={this.state.longBreakFreq}
                onchange={this.onChangeSettings} />
            </div>
          </div>
          <Row className="mb-3">
            <SimpleTaskManager onTaskCreate={this.handleTaskCreated} onTaskSelected={this.handleTaskSelected} tasks={this.state.tasks} selectedTask={this.state.selectedTask} />
          </Row>
          <Row className="mb-3">
            <TaskTimes events={this.state.events} eventsTimestamp={this.state.eventsTimestamp} />
          </Row>
          <div className="card card-body">
            <FullCalendar events={this.state.events} plugins={[timeGridPlugin, dayGridMonth, listPlugin]} initialView="timeGridWeek" headerToolbar={
              { right: 'today prev,next dayGridMonth,timeGridWeek,timeGridDay listWeek' }
            } slotDuration='00:10:00' eventDidMount={function (event) {
              event.el.title = event.event.title;
            }} />
          </div>
        </Container>
      </div>
    );
  }
}

export default App;
