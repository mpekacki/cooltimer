import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import App from './App';
import Settings from './Settings';
import { Simulate } from 'react-dom/test-utils';
import Constants from './Constants';

const MOCK_START_TIME = 1614544215000;

let container;
let mockedTime = {
  val: MOCK_START_TIME
};


beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  mockedTime.val = MOCK_START_TIME;
  mockDate();
  jest.useFakeTimers();
});

function mockDate() {
  jest.spyOn(Date, 'now').mockImplementation(() => mockedTime.val);
}

afterEach(() => {
  cleanup();
  document.body.removeChild(container);
  container = null;
  jest.clearAllTimers();
});

function advanceDateMock(time) {
  mockedTime.val += time;
  mockDate();
}

function advanceTimersByTime(time) {
  advanceDateMock(time);
  jest.advanceTimersByTime(time);
}

jest.mock('@fullcalendar/react', () => {
  return {
    __esModule: true,
    A: true,
    default: (props) => {
      return <ul>{props && props.events && props.events.map((event, i) => <li key={i}>{event.title + ' ' + event.start.getTime() + ' ' + event.end.getTime()}</li>)}</ul>;
    },
  };
});
jest.mock('@fullcalendar/timegrid', () => {
  return {
    __esModule: true,
    A: true,
    default: () => {
      return <div></div>;
    },
  };
});
jest.mock('@fullcalendar/daygrid', () => {
  return {
    __esModule: true,
    A: true,
    default: () => {
      return <div></div>;
    },
  };
});
jest.mock('@fullcalendar/list', () => {
  return {
    __esModule: true,
    A: true,
    default: () => {
      return <div></div>;
    },
  };
});

test('renders timer based on passed settings', () => {
  const testSettings = new Settings(25, 5, 10, 4, false);
  const { getByText } = render(<App defaultSettings={testSettings} />);
  const mainTimer = getByText(/25:00/i);
  expect(mainTimer).toBeInTheDocument();
  const startWorkingBtn = getByText(Constants.START_WORKING_BUTTON_TEXT);
  expect(startWorkingBtn).toBeInTheDocument();
});

test('starts timer after clicking the button', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime(1000);
  verifyTimer(c, '24:59');
  verifyTotalWorkedTime(c, '0 hours 0 minutes 1 second');
  // expect(document.title).toBe("24:59");
  advanceTimersByTime((12 * 60 + 12) * 1000);
  verifyTimer(c, '12:47');
  verifyTotalWorkedTime(c, '0 hours 12 minutes 13 seconds');
  // expect(document.title).toBe("12:47");
  advanceTimersByTime((12 * 60 + 46) * 1000);
  verifyTimer(c, '00:01');
  verifyTotalWorkedTime(c, '0 hours 24 minutes 59 seconds');
  // expect(document.title).toBe("00:01");
});

test('switches to break after work time elapses', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  verifyTimer(c, '05:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 5 minutes 0 seconds');
  advanceTimersByTime(1000);
  verifyTimer(c, '04:59');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 59 seconds');
  advanceTimersByTime(15 * 1000);
  verifyTimer(c, '04:44');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 44 seconds');
  advanceTimersByTime((4 * 60 + 44) * 1000);
  verifyTimer(c, '25:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 0 minutes 0 seconds');
  advanceTimersByTime(1000);
  verifyTimer(c, '24:59');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 1 second');
  verifyAvailableBreakTime(c, '0 hours 0 minutes 0 seconds');
});

test('renders total work time correctly', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  verifyTotalWorkedTime(c, "0 hours 0 minutes 0 seconds");
  advanceTimersByTime((25 * 60) * 1000);
  verifyTotalWorkedTime(c, "0 hours 25 minutes 0 seconds");
  advanceTimersByTime(((5 + 25 + 5 + 9) * 60) * 1000);
  verifyTotalWorkedTime(c, "0 hours 59 minutes 0 seconds");
  advanceTimersByTime(60 * 1000);
  verifyTotalWorkedTime(c, "1 hour 0 minutes 0 seconds");
  advanceTimersByTime(60 * 1000);
  verifyTotalWorkedTime(c, "1 hour 1 minute 0 seconds");
});

test('renders total combined time correctly', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  verifyTotalCombinedTime(c, "0 hours 0 minutes 0 seconds");
  advanceTimersByTime((25 * 60) * 1000);
  verifyTotalCombinedTime(c, "0 hours 25 minutes 0 seconds");
  advanceTimersByTime((5 * 60) * 1000);
  verifyTotalCombinedTime(c, "0 hours 30 minutes 0 seconds");
  advanceTimersByTime((25 * 60) * 1000);
  verifyTotalCombinedTime(c, "0 hours 55 minutes 0 seconds");
});

test('after n periods, uses long break instead of short break', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime(((25 + 5 + 25 + 5 + 25 + 5 + 25) * 60) * 1000);
  verifyTimer(c, '10:00');
  verifyTotalWorkedTime(c, '1 hour 40 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 10 minutes 0 seconds');
  advanceTimersByTime(((10 + 25) * 60) * 1000);
  verifyTimer(c, '05:00');
  verifyTotalWorkedTime(c, '2 hours 5 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 5 minutes 0 seconds');
});

test('after clicking on "Return to work" during break, resumes work', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 5 minutes 0 seconds');
  advanceTimersByTime(10 * 1000);
  verifyTimer(c, '04:50');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 50 seconds');
  fireEvent.click(returnToWorkButton(c));
  verifyTimer(c, '25:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 50 seconds');
  advanceTimersByTime((10 * 60) * 1000);
  verifyTimer(c, '15:00');
  verifyTotalWorkedTime(c, '0 hours 35 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 50 seconds');
  advanceTimersByTime((15 * 60) * 1000);
  verifyTimer(c, '09:50');
  verifyTotalWorkedTime(c, '0 hours 50 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 9 minutes 50 seconds');
  advanceTimersByTime((9 * 60 + 50) * 1000);
  verifyTimer(c, '25:00');
  verifyTotalWorkedTime(c, '0 hours 50 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 0 minutes 0 seconds');
});

test('if during work there is break time available, clicking on "Go on a break" starts break', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 5 minutes 0 seconds');
  advanceTimersByTime(10 * 1000);
  verifyTimer(c, '04:50');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 50 seconds');
  fireEvent.click(returnToWorkButton(c));
  verifyTimer(c, '25:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 50 seconds');
  advanceTimersByTime((10 * 60) * 1000);
  verifyTimer(c, '15:00');
  verifyTotalWorkedTime(c, '0 hours 35 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 50 seconds');
  fireEvent.click(goOnABreakButton(c));
  verifyTimer(c, '04:50');
  verifyTotalWorkedTime(c, '0 hours 35 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 50 seconds');
  advanceTimersByTime(50 * 1000);
  verifyTimer(c, '04:00');
  verifyTotalWorkedTime(c, '0 hours 35 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 0 seconds');
  fireEvent.click(returnToWorkButton(c));
  verifyTimer(c, '25:00');
  verifyTotalWorkedTime(c, '0 hours 35 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 0 seconds');
  advanceTimersByTime((5 * 60) * 1000);
  verifyTimer(c, '20:00');
  verifyTotalWorkedTime(c, '0 hours 40 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 0 seconds');
  fireEvent.click(goOnABreakButton(c));
  verifyTimer(c, '04:00');
  verifyTotalWorkedTime(c, '0 hours 40 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 0 seconds');
  advanceTimersByTime((4 * 60) * 1000);
  verifyTimer(c, '25:00');
  verifyTotalWorkedTime(c, '0 hours 40 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 0 minutes 0 seconds');
});

test('after clicking on "Hold work" button, holds all timers, and after clicking on "Resume work" starts them again', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  expect(c.queryByText(Constants.HOLD_WORK_BUTTON_TEXT)).toBeNull();
  expect(c.queryByText(Constants.RESUME_WORK_BUTTON_TEXT)).toBeNull();
  fireEvent.click(startWorkingButton(c));
  expect(c.queryByText(Constants.HOLD_WORK_BUTTON_TEXT)).toBeInTheDocument();
  expect(c.queryByText(Constants.RESUME_WORK_BUTTON_TEXT)).toBeNull();
  advanceTimersByTime((15 * 60) * 1000);
  verifyTimer(c, '10:00');
  verifyTotalWorkedTime(c, '0 hours 15 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 0 minutes 0 seconds');
  fireEvent.click(holdWorkButton(c));
  expect(c.queryByText(Constants.HOLD_WORK_BUTTON_TEXT)).toBeNull();
  expect(c.queryByText(Constants.RESUME_WORK_BUTTON_TEXT)).toBeInTheDocument();
  verifyTimer(c, '10:00');
  verifyTotalWorkedTime(c, '0 hours 15 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 0 minutes 0 seconds');
  advanceTimersByTime((5 * 60) * 1000);
  expect(c.queryByText(Constants.HOLD_WORK_BUTTON_TEXT)).toBeNull();
  expect(c.queryByText(Constants.RESUME_WORK_BUTTON_TEXT)).toBeInTheDocument();
  verifyTimer(c, '10:00');
  verifyTotalWorkedTime(c, '0 hours 15 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 0 minutes 0 seconds');
  fireEvent.click(resumeWorkButton(c));
  expect(c.queryByText(Constants.HOLD_WORK_BUTTON_TEXT)).toBeInTheDocument();
  expect(c.queryByText(Constants.RESUME_WORK_BUTTON_TEXT)).toBeNull();
  verifyTimer(c, '10:00');
  verifyTotalWorkedTime(c, '0 hours 15 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 0 minutes 0 seconds');
  advanceTimersByTime((5 * 60) * 1000);
  expect(c.queryByText(Constants.HOLD_WORK_BUTTON_TEXT)).toBeInTheDocument();
  expect(c.queryByText(Constants.RESUME_WORK_BUTTON_TEXT)).toBeNull();
  verifyTimer(c, '05:00');
  verifyTotalWorkedTime(c, '0 hours 20 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 0 minutes 0 seconds');
  advanceTimersByTime((5 * 60) * 1000);
  expect(c.queryByText(Constants.HOLD_WORK_BUTTON_TEXT)).toBeInTheDocument();
  expect(c.queryByText(Constants.RESUME_WORK_BUTTON_TEXT)).toBeNull();
  verifyTimer(c, '05:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 5 minutes 0 seconds');
  advanceTimersByTime((1 * 60) * 1000);
  verifyTimer(c, '04:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 0 seconds');
  fireEvent.click(holdWorkButton(c));
  expect(c.queryByText(Constants.HOLD_WORK_BUTTON_TEXT)).toBeNull();
  expect(c.queryByText(Constants.RESUME_WORK_BUTTON_TEXT)).toBeInTheDocument();
  verifyTimer(c, '04:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 0 seconds');
  advanceTimersByTime(1000);
  expect(c.queryByText(Constants.HOLD_WORK_BUTTON_TEXT)).toBeNull();
  expect(c.queryByText(Constants.RESUME_WORK_BUTTON_TEXT)).toBeInTheDocument();
  verifyTimer(c, '04:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 0 seconds');
  fireEvent.click(resumeWorkButton(c));
  expect(c.queryByText(Constants.HOLD_WORK_BUTTON_TEXT)).toBeInTheDocument();
  expect(c.queryByText(Constants.RESUME_WORK_BUTTON_TEXT)).toBeNull();
  verifyTimer(c, '04:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 0 seconds');
  advanceTimersByTime(1000);
  expect(c.queryByText(Constants.HOLD_WORK_BUTTON_TEXT)).toBeInTheDocument();
  expect(c.queryByText(Constants.RESUME_WORK_BUTTON_TEXT)).toBeNull();
  verifyTimer(c, '03:59');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 3 minutes 59 seconds');
});

test('hides "Start working" button after it\'s clicked', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  expect(c.queryByText(Constants.START_WORKING_BUTTON_TEXT)).toBeNull();
});

test('displays "Return to work" button only if on a break', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  expect(c.queryByText(Constants.RETURN_TO_WORK_BUTTON_TEXT)).toBeNull();
  fireEvent.click(startWorkingButton(c));
  expect(c.queryByText(Constants.RETURN_TO_WORK_BUTTON_TEXT)).toBeNull();
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getByText(Constants.RETURN_TO_WORK_BUTTON_TEXT)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(c.queryByText(Constants.RETURN_TO_WORK_BUTTON_TEXT)).toBeNull();
});

test('displays "Go on a break" button only during work and when there is break time available', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  expect(c.queryByText(Constants.GO_ON_A_BREAT_BUTTON_TEXT)).toBeNull();
  fireEvent.click(startWorkingButton(c));
  expect(c.queryByText(Constants.GO_ON_A_BREAT_BUTTON_TEXT)).toBeNull();
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.queryByText(Constants.GO_ON_A_BREAT_BUTTON_TEXT)).toBeNull();
  advanceTimersByTime((5 * 60) * 1000);
  expect(c.queryByText(Constants.GO_ON_A_BREAT_BUTTON_TEXT)).toBeNull();
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.queryByText(Constants.GO_ON_A_BREAT_BUTTON_TEXT)).toBeNull();
  advanceTimersByTime((1 * 60) * 1000);
  fireEvent.click(returnToWorkButton(c));
  expect(c.getByText(Constants.GO_ON_A_BREAT_BUTTON_TEXT)).toBeInTheDocument();
  fireEvent.click(goOnABreakButton(c));
  expect(c.queryByText(Constants.GO_ON_A_BREAT_BUTTON_TEXT)).toBeNull();
});

test('asks for notification permission on startup', () => {
  let mockNotifications = new MockNotifications();
  render(<App defaultSettings={ getTestSettings() } notifications={ mockNotifications }/>);
  expect(mockNotifications.permissionRequested).toBeTruthy();
});

test('if permission for notifications is granted, displays notification after time elapses', () => {
  let mockNotifications = new MockNotifications('granted');
  const c = render(<App defaultSettings={ getTestSettings() } notifications={ mockNotifications }/>);
  fireEvent.click(startWorkingButton(c));
  expect(mockNotifications.createdNotifications.length).toBe(0);
  advanceTimersByTime((10 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(0);
  advanceTimersByTime((15 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(1);
  let notification = mockNotifications.createdNotifications[0];
  expect(notification.title).toBe('Work finished');
  advanceTimersByTime((5 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(2);
  let breakNotification = mockNotifications.createdNotifications[1];
  expect(breakNotification.title).toBe('Break finished');
});

test('if permission for notifications is not granted, does not attempt to create a notfication', () => {
  let mockNotifications = new MockNotifications('denied');
  const c = render(<App defaultSettings={ getTestSettings() } notifications={ mockNotifications }/>);
  fireEvent.click(startWorkingButton(c));
  expect(mockNotifications.createdNotifications.length).toBe(0);
  advanceTimersByTime((10 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(0);
  advanceTimersByTime((15 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(0);
});

test('if "Continous work" is checked, should switch to next work period instead of break period', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  expect(c.getByTestId("cont-work")).toBeInTheDocument();
  fireEvent.click(startWorkingButton(c));
  expect(c.getByTestId("cont-work")).toBeInTheDocument();
  Simulate.change(c.getByTestId("cont-work"), {target: {checked: true}});
  advanceTimersByTime((25 * 60) * 1000);
  verifyTimer(c, '25:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 5 minutes 0 seconds');
  advanceTimersByTime(1000);
  verifyTimer(c, '24:59');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 1 second');
  verifyAvailableBreakTime(c, '0 hours 5 minutes 0 seconds');
  Simulate.change(c.getByTestId("cont-work"), {target: {checked: false}});
  advanceTimersByTime((24 * 60 + 59) * 1000);
  verifyTimer(c, '10:00');
  verifyTotalWorkedTime(c, '0 hours 50 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 10 minutes 0 seconds');
});

test('if work is continued even though there is full break available, then add incrementally to break time during work', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  Simulate.change(c.getByTestId("cont-work"), {target: {checked: true}});
  advanceTimersByTime((25 * 60) * 1000);
  verifyTimer(c, '25:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 5 minutes 0 seconds');
  advanceTimersByTime((5 * 60) * 1000);
  verifyTimer(c, '20:00');
  verifyTotalWorkedTime(c, '0 hours 30 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 6 minutes 0 seconds');
  advanceTimersByTime((5 * 60) * 1000);
  verifyTimer(c, '15:00');
  verifyTotalWorkedTime(c, '0 hours 35 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 7 minutes 0 seconds');
  advanceTimersByTime((5 * 60) * 1000);
  verifyTimer(c, '10:00');
  verifyTotalWorkedTime(c, '0 hours 40 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 8 minutes 0 seconds');
  advanceTimersByTime((5 * 60) * 1000);
  verifyTimer(c, '05:00');
  verifyTotalWorkedTime(c, '0 hours 45 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 9 minutes 0 seconds');
  advanceTimersByTime((5 * 60) * 1000);
  verifyTimer(c, '25:00');
  verifyTotalWorkedTime(c, '0 hours 50 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 10 minutes 0 seconds');
  advanceTimersByTime((5 * 60) * 1000);
  verifyTimer(c, '20:00');
  verifyTotalWorkedTime(c, '0 hours 55 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 11 minutes 0 seconds');
  expect(c.getByText(Constants.GO_ON_A_BREAT_BUTTON_TEXT)).toBeInTheDocument();
  fireEvent.click(goOnABreakButton(c));
  verifyTimer(c, '11:00');
  advanceTimersByTime((11 * 60) * 1000);
  verifyTimer(c, '25:00');
  verifyTotalWorkedTime(c, '0 hours 55 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 0 minutes 0 seconds');
});

test('if there is less than short break time during work and break is started, then the awarded break is not lost and is added to next break time', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  Simulate.change(c.getByTestId("cont-work"), {target: {checked: true}});
  advanceTimersByTime((25 * 60) * 1000);
  verifyTimer(c, '25:00');
  verifyTotalWorkedTime(c, '0 hours 25 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 5 minutes 0 seconds');
  fireEvent.click(goOnABreakButton(c));
  advanceTimersByTime((1 * 60) * 1000);
  verifyTimer(c, '04:00');
  fireEvent.click(returnToWorkButton(c));
  verifyTimer(c, '25:00');
  advanceTimersByTime((20 * 60) * 1000);
  verifyTotalWorkedTime(c, '0 hours 45 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 4 minutes 0 seconds');
  fireEvent.click(goOnABreakButton(c));
  advanceTimersByTime((4 * 60) * 1000);
  advanceTimersByTime((25 * 60) * 1000);
  fireEvent.click(goOnABreakButton(c));
  verifyTimer(c, '09:00');
  verifyTotalWorkedTime(c, '1 hour 10 minutes 0 seconds');
  verifyAvailableBreakTime(c, '0 hours 9 minutes 0 seconds');
});

test('saves app state to provided storage', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = null;
  const c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime(1000);
  expect(mockStorage.state).toBeTruthy();
  expect(mockStorage.state).toMatchObject({
    autoStartTimers: true,
    timerSeconds: 24 * 60 + 59,
    totalWorkedSeconds: 1,
    isWork: true,
    availableBreakSeconds: 0,
    hiddenAvailableBreakSeconds: 0.2,
    cycle: 0,
    notificationsGranted: false,
    timerLastUpdatedAt: mockedTime.val,
    timerRunning: true,
    continousWork: false,
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 10,
    longBreakFreq: 4
  });
});

test('restores app state from provided storage', () => {
  let mockStorage = new MockStorage();
  let savedState = {
    autoStartTimers: true,
    timerSeconds: 21 * 60 + 37,
    totalWorkedSeconds: 8,
    isWork: true,
    availableBreakSeconds: 3,
    hiddenAvailableBreakSeconds: 0,
    cycle: 0,
    notificationsGranted: false,
    timerLastUpdatedAt: mockedTime.val - 2000,
    timerRunning: true,
    continousWork: true,
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 10,
    longBreakFreq: 4
  };
  mockStorage.state = savedState;
  const c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  verifyTimer(c, '21:35');
  verifyTotalWorkedTime(c, '0 hours 0 minutes 10 seconds');
  verifyAvailableBreakTime(c, '0 hours 0 minutes 3 seconds');
  advanceTimersByTime(1000);
  verifyTimer(c, '21:34');
});

test('restores app state from incomplete storage', () => {
  let mockStorage = new MockStorage();
  let savedState = {
    foof: "suus",
    shortBreakMinutes: 3
  };
  mockStorage.state = savedState;
  const c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  verifyTimer(c, "25:00");
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime(25 * 60 * 1000);
  verifyTimer(c, "03:00");
});

test('saves app state with timer stopped if timer is stopped', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = null;
  const c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime(1000);
  fireEvent.click(holdWorkButton(c));
  expect(mockStorage.state).toBeTruthy();
  expect(mockStorage.state).toMatchObject({
    autoStartTimers: true,
    timerSeconds: 24 * 60 + 59,
    totalWorkedSeconds: 1,
    isWork: true,
    availableBreakSeconds: 0,
    hiddenAvailableBreakSeconds: 0.2,
    cycle: 0,
    notificationsGranted: false,
    timerLastUpdatedAt: Date.now(),
    timerRunning: false,
    continousWork: false,
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 10,
    longBreakFreq: 4
  });
});

test('correctly calculates after long time elapsed', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime(65 * 60 * 1000);
  verifyTimer(c, "20:00");
  verifyTotalWorkedTime(c, "0 hours 55 minutes 0 seconds");
  verifyAvailableBreakTime(c, "0 hours 0 minutes 0 seconds");
});

test('resets state after clicking Reset', () => {
  let confirmCalled = false;
  global.confirm = () => {
    confirmCalled = true;
    return true;
  };
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  verifyTimer(c, "05:00");
  verifyTotalWorkedTime(c, "0 hours 25 minutes 0 seconds");
  verifyAvailableBreakTime(c, "0 hours 5 minutes 0 seconds");
  fireEvent.click(resetButton(c));
  expect(confirmCalled).toBe(true);
  verifyTimer(c, "25:00");
  verifyTotalWorkedTime(c, "0 hours 0 minutes 0 seconds");
  verifyAvailableBreakTime(c, "0 hours 0 minutes 0 seconds");
  expect(startWorkingButton(c)).toBeInTheDocument();
  advanceTimersByTime(2 * 1000);
  verifyTimer(c, "25:00");
  verifyTotalWorkedTime(c, "0 hours 0 minutes 0 seconds");
  verifyAvailableBreakTime(c, "0 hours 0 minutes 0 seconds");
  expect(startWorkingButton(c)).toBeInTheDocument();
});

test('timers start automatically based on checkbox', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  expect(startTimersAutomaticallyCheckbox(c)).toBeInTheDocument();
  fireEvent.click(startWorkingButton(c));
  Simulate.change(startTimersAutomaticallyCheckbox(c), {target: {checked: false}});
  advanceTimersByTime(25 * 60 * 1000);
  verifyTimer(c, "05:00");
  advanceTimersByTime(3 * 60 * 1000);
  verifyTimer(c, "05:00");
  Simulate.change(startTimersAutomaticallyCheckbox(c), {target: {checked: true}});
  fireEvent.click(resumeWorkButton(c));
  advanceTimersByTime(5 * 60 * 1000);
  verifyTimer(c, "25:00");
  advanceTimersByTime(5 * 60 * 1000);
  verifyTimer(c, "20:00");
});

test('shows info how many cycles until long break', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  expect(c.getByTestId('longBreakInfo').textContent).toBe('4');
  advanceTimersByTime(25 * 60 * 1000);
  expect(c.getByTestId('longBreakInfo').textContent).toBe('3');
  advanceTimersByTime(30 * 60 * 1000);
  expect(c.getByTestId('longBreakInfo').textContent).toBe('2');
  advanceTimersByTime(30 * 60 * 1000);
  expect(c.getByTestId('longBreakInfo').textContent).toBe('1');
  advanceTimersByTime(30 * 60 * 1000);
  expect(c.getByTestId('longBreakInfo').textContent).toBe('4');
});

test('restores settings from storage', () => {
  let mockStorage = new MockStorage();
  let savedState = {
    autoStartTimers: true,
    timerSeconds: 13 * 60,
    totalWorkedSeconds: 0,
    isWork: true,
    availableBreakSeconds: 0,
    hiddenAvailableBreakSeconds: 0,
    cycle: 0,
    notificationsGranted: false,
    timerLastUpdatedAt: mockedTime.val,
    timerRunning: true,
    continousWork: false,
    workMinutes: 13,
    shortBreakMinutes: 3,
    longBreakMinutes: 7,
    longBreakFreq: 2
  };
  mockStorage.state = savedState;
  const c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  verifyTimer(c, "13:00");
  advanceTimersByTime(13 * 60 * 1000);
  verifyTimer(c, "03:00");
  advanceTimersByTime(3 * 60 * 1000);
  verifyTimer(c, "13:00");
  advanceTimersByTime(13 * 60 * 1000);
  verifyTimer(c, "07:00");
});

test('displays values passed in props', () => {
  const { getByDisplayValue } = render(<App defaultSettings={ new Settings(13, 3, 7, 2, false) }/>);
  expect(getByDisplayValue("13")).toBeInTheDocument();
  expect(getByDisplayValue("3")).toBeInTheDocument();
  expect(getByDisplayValue("7")).toBeInTheDocument();
  expect(getByDisplayValue("2")).toBeInTheDocument();
});

test('updates settings after changing settings values', () => {
  const c = render(<App defaultSettings={ new Settings(13, 3, 7, 2, false) }/>);
  expect(c.getByDisplayValue("13")).toBeInTheDocument();
  expect(c.getByDisplayValue("3")).toBeInTheDocument();
  expect(c.getByDisplayValue("2")).toBeInTheDocument();
  expect(c.getByDisplayValue("7")).toBeInTheDocument();
  Simulate.change(c.getByDisplayValue("13"), { target: { value: 19 } });
  Simulate.change(c.getByDisplayValue("3"), { target: { value: 8 } });
  Simulate.change(c.getByDisplayValue("7"), { target: { value: 11 } });
  Simulate.change(c.getByDisplayValue("2"), { target: { value: 3 } });
  expect(c.getByDisplayValue("19")).toBeInTheDocument();
  expect(c.getByDisplayValue("8")).toBeInTheDocument();
  expect(c.getByDisplayValue("11")).toBeInTheDocument();
  expect(c.getByDisplayValue("3")).toBeInTheDocument();
  verifyTimer(c, "13:00");
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime(13 * 60 * 1000);
  verifyTimer(c, "05:28");
  advanceTimersByTime((5 * 60 + 28) * 1000);
  verifyTimer(c, "19:00");
  advanceTimersByTime(19 * 60 * 1000);
  verifyTimer(c, "08:00");
  advanceTimersByTime(8 * 60 * 1000);
  advanceTimersByTime(19 * 60 * 1000);
  verifyTimer(c, "11:00");
});

test('resets using updated settings', () => {
  const c = render(<App defaultSettings={ new Settings(13, 3, 7, 2, false) }/>);
  Simulate.change(c.getByDisplayValue("13"), { target: { value: 19 } });
  expect(c.getByDisplayValue("19")).toBeInTheDocument();
  verifyTimer(c, "13:00");
  fireEvent.click(resetButton(c));
  verifyTimer(c, "19:00");
});

test('resets without events or tasks', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  createTask(c, TEST_TASK_NAME);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  fireEvent.click(resetButton(c));
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  expect(getTaskElement(c, TEST_TASK_NAME)).toBeInTheDocument();
});

test('displays event in calendar', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((5 * 60) * 1000);
  expect(c.getAllByText(`Break ${MOCK_START_TIME + 25 * 60 * 1000} ${MOCK_START_TIME + 30 * 60 * 1000}`).length).toBe(1);
});

test('displays events in calendar correctly when manually switching timer', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((1 * 60) * 1000);
  fireEvent.click(returnToWorkButton(c));
  expect(c.getAllByText(`Break ${MOCK_START_TIME + 25 * 60 * 1000} ${MOCK_START_TIME + 26 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((4 * 60) * 1000);
  fireEvent.click(goOnABreakButton(c));
  expect(c.getAllByText(`Work ${MOCK_START_TIME + 26 * 60 * 1000} ${MOCK_START_TIME + 30 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((1 * 60) * 1000);
  fireEvent.click(holdWorkButton(c));
  expect(c.getAllByText(`Break ${MOCK_START_TIME + 30 * 60 * 1000} ${MOCK_START_TIME + 31 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((1 * 60) * 1000);
  fireEvent.click(resumeWorkButton(c));
  advanceTimersByTime((1 * 60) * 1000);
  fireEvent.click(returnToWorkButton(c));
  expect(c.getAllByText(`Break ${MOCK_START_TIME + 32 * 60 * 1000} ${MOCK_START_TIME + 33 * 60 * 1000}`).length).toBe(1);
});

test('saves and restores event state in storage', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = {};
  let c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((2 * 60) * 1000);
  cleanup();
  c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((3 * 60) * 1000);
  expect(c.getAllByText(`Break ${MOCK_START_TIME + 25 * 60 * 1000} ${MOCK_START_TIME + 30 * 60 * 1000}`).length).toBe(1);
});

test('correctly creates events when restoring app after delay', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = {};
  let c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((2 * 60) * 1000);
  cleanup();
  c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  advanceTimersByTime((10 * 60) * 1000);
  expect(c.getAllByText(`Break ${MOCK_START_TIME + 25 * 60 * 1000} ${MOCK_START_TIME + 30 * 60 * 1000}`).length).toBe(1);
});

test('squashes neighbouring events of the same type', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  tickContinousWork(c, true);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 50 * 60 * 1000}`).length).toBe(1);
  fireEvent.click(c.getByText(Constants.HOLD_WORK_BUTTON_TEXT));
  advanceTimersByTime((10 * 60) * 1000);
  fireEvent.click(c.getByText(Constants.RESUME_WORK_BUTTON_TEXT));
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME + 60 * 60 * 1000} ${MOCK_START_TIME + 85 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME + 60 * 60 * 1000} ${MOCK_START_TIME + 110 * 60 * 1000}`).length).toBe(1);
});

const TEST_TASK_NAME = 'petting the dog';
test('when task is selected, saves calendar work events with task name', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  createTask(c, TEST_TASK_NAME);
  selectTask(c, TEST_TASK_NAME);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  verifyEventCreatedForWorkWithTask(c, TEST_TASK_NAME, MOCK_START_TIME, MOCK_START_TIME + 25 * 60 * 1000);
});

const TEST_TASK_NAME2 = 'eating cake';
test('when selected task changes, finish current event and start new one', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  createTask(c, TEST_TASK_NAME);
  createTask(c, TEST_TASK_NAME2);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((3 * 60) * 1000);
  selectTask(c, TEST_TASK_NAME);
  advanceTimersByTime((12 * 60) * 1000);
  selectTask(c, TEST_TASK_NAME2);
  verifyEventCreatedForWorkWithoutTask(c, MOCK_START_TIME, MOCK_START_TIME + 3 * 60 * 1000);
  verifyEventCreatedForWorkWithTask(c, TEST_TASK_NAME, MOCK_START_TIME + 3 * 60 * 1000, MOCK_START_TIME + 15 * 60 * 1000);
  advanceTimersByTime((10 * 60) * 1000);
  verifyEventCreatedForWorkWithTask(c, TEST_TASK_NAME2, MOCK_START_TIME + 15 * 60 * 1000, MOCK_START_TIME + 25 * 60 * 1000);
  expect(c.queryByText('Break 0 -1500000')).not.toBeInTheDocument();
});

test('does not create zero length events', () => {
  const c = render(<App defaultSettings={ getTestSettings() }/>);
  tickContinousWork(c, true);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((10 * 60) * 1000);
  fireEvent.click(holdWorkButton(c));
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 35 * 60 * 1000}`).length).toBe(1);
  fireEvent.click(goOnABreakButton(c));
  fireEvent.click(returnToWorkButton(c))
  expect(c.queryByText(`Break ${MOCK_START_TIME + 35 * 60 * 1000} ${MOCK_START_TIME + 35 * 60 * 1000}`)).not.toBeInTheDocument();
});

test('stores task info in storage and restores it', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = {};
  let c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  createTask(c, TEST_TASK_NAME);
  createTask(c, TEST_TASK_NAME2);
  selectTask(c, TEST_TASK_NAME);
  cleanup();
  c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  expect(c.getByTestId('button-' + TEST_TASK_NAME).classList.contains('active')).toBe(true);
  expect(getTaskElement(c, TEST_TASK_NAME)).toBeInTheDocument();
  expect(getTaskElement(c, TEST_TASK_NAME2)).toBeInTheDocument();
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  verifyEventCreatedForWorkWithTask(c, TEST_TASK_NAME, MOCK_START_TIME, MOCK_START_TIME + 25 * 60 * 1000);
});

test('shows total time worked per task today', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = {};
  let c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  createTask(c, TEST_TASK_NAME);
  createTask(c, TEST_TASK_NAME2);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((15 * 60) * 1000);
  selectTask(c, TEST_TASK_NAME);
  advanceTimersByTime((6 * 60) * 1000);
  selectTask(c, TEST_TASK_NAME2);
  advanceTimersByTime((4 * 60) * 1000);
  selectTask(c, TEST_TASK_NAME);
  advanceTimersByTime((5 * 60) * 1000);
  advanceTimersByTime((3 * 60) * 1000);
  selectTask(c, TEST_TASK_NAME2);
  verifyTotalTimeWorkedTodayForTask(c, Constants.NO_TASK_TEXT, 15 * 60);
  verifyTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME, 9 * 60);
  verifyTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME2, 4 * 60);
  verifyTotalTimeWorkedTodayForAllTasks(c, 28 * 60);
  cleanup();
  c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  verifyTotalTimeWorkedTodayForTask(c, Constants.NO_TASK_TEXT, 15 * 60);
  verifyTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME, 9 * 60);
  verifyTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME2, 4 * 60);
  verifyTotalTimeWorkedTodayForAllTasks(c, 28 * 60);
});

test('shows today, yesterday and week summaries for task times', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = {};
  let c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  createTask(c, TEST_TASK_NAME);
  selectTask(c, TEST_TASK_NAME);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  verifyTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME, 25 * 60);
  verifyTotalTimeWorkedYesterdayForTask(c, TEST_TASK_NAME, 0);
  verifyTotalTimeWorkedThisWeekForTask(c, TEST_TASK_NAME, 25 * 60);
  fireEvent.click(holdWorkButton(c));
  cleanup();
  jest.clearAllTimers();
  // jest.useFakeTimers();
  advanceTimersByTime(24 * 60 * 60 * 1000);
  c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  // advanceTimersByTime((1 * 60) * 1000);
  verifyTotalTimeWorkedYesterdayForTask(c, TEST_TASK_NAME, 25 * 60);
  verifyTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME, 0);
  verifyTotalTimeWorkedThisWeekForTask(c, TEST_TASK_NAME, 25 * 60);
  cleanup();
  jest.clearAllTimers();
  advanceTimersByTime(24 * 60 * 60 * 1000);
  c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  verifyTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME, 0);
  verifyTotalTimeWorkedYesterdayForTask(c, TEST_TASK_NAME, 0);
  verifyTotalTimeWorkedThisWeekForTask(c, TEST_TASK_NAME, 25 * 60);
  cleanup();
  jest.clearAllTimers();
  advanceTimersByTime(7 * 24 * 60 * 60 * 1000);
  c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  verifyNonexistenceOfTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME);
  verifyNonexistenceOfTotalTimeWorkedYesterdayForTask(c, TEST_TASK_NAME);
  verifyNonexistenceOfTotalTimeWorkedThisWeekForTask(c, TEST_TASK_NAME);
});

test('show percentages of time per task', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = {};
  let c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  createTask(c, TEST_TASK_NAME);
  createTask(c, TEST_TASK_NAME2);
  selectTask(c, TEST_TASK_NAME);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((5 * 60) * 1000);
  selectTask(c, TEST_TASK_NAME2);
  verifyPercentageOfTimeTodayForTask(c, TEST_TASK_NAME, '100%');
  advanceTimersByTime((5 * 60) * 1000);
  selectTask(c, TEST_TASK_NAME);
  verifyPercentageOfTimeTodayForTask(c, TEST_TASK_NAME, '50%');
  verifyPercentageOfTimeTodayForTask(c, TEST_TASK_NAME2, '50%');
  advanceTimersByTime((10 * 60) * 1000);
  selectTask(c, TEST_TASK_NAME2);
  verifyPercentageOfTimeTodayForTask(c, TEST_TASK_NAME, '75%');
  verifyPercentageOfTimeTodayForTask(c, TEST_TASK_NAME2, '25%');
});

test('updates total time worked per task even if no new event is created', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = {};
  let c = render(<App defaultSettings={ getTestSettings() } storage={ mockStorage }/>);
  createTask(c, TEST_TASK_NAME);
  selectTask(c, TEST_TASK_NAME);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((5 * 60) * 1000);
  fireEvent.click(holdWorkButton(c));
  verifyTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME, 5 * 60);
  fireEvent.click(resumeWorkButton(c));
  advanceTimersByTime((10 * 60) * 1000);
  fireEvent.click(holdWorkButton(c));
  verifyTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME, 15 * 60);
});

function getTestSettings() {
  return new Settings(25, 5, 10, 4, false);
}

function startWorkingButton(container) {
  return container.getByTestId("start-working-btn");
}

function returnToWorkButton(container) {
  return container.getByText(Constants.RETURN_TO_WORK_BUTTON_TEXT);
}

function resetButton(container) {
  return container.getByTestId("reset-btn");
}

function resumeWorkButton(container) {
  return container.getByTestId("resume-work-btn");
}

function holdWorkButton(c) {
  return c.getByText(Constants.HOLD_WORK_BUTTON_TEXT);
}

function goOnABreakButton(c) {
  return c.getByText(Constants.GO_ON_A_BREAT_BUTTON_TEXT);
}

function startTimersAutomaticallyCheckbox(container) {
  return container.getByTestId("auto-start-timers");
}

function verifyTimer(container, expected) {
  return expect(container.getByTestId("timer").textContent).toBe(expected);
}

function verifyTotalWorkedTime(container, expected) {
  return expect(container.getByTestId("totalWorkedTime").textContent).toBe(expected);
}

function verifyTotalCombinedTime(container, expected) {
  return expect(container.getByTestId("totalCombinedTime").textContent).toBe(expected);
}

function verifyAvailableBreakTime(container, expected) {
  return expect(container.getByTestId("availableBreakTime").textContent).toBe(expected);
}

function verifyEventCreatedForWorkWithTask(c, taskName, start, end) {
  expect(c.getAllByText(`Work (${taskName}) ${start} ${end}`).length).toBe(1);
}

function verifyEventCreatedForWorkWithoutTask(c, start, end) {
  expect(c.getAllByText(`Work ${start} ${end}`).length).toBe(1);
}

function verifyTotalTimeWorkedTodayForTask(c, taskName, expectedSeconds) {
  expect(getTimeWorkedToday(c, taskName).textContent).toBe(formatSeconds(expectedSeconds));
}

function verifyTotalTimeWorkedTodayForAllTasks(c, expectedSeconds) {
  expect(c.queryByTestId('today-total').textContent).toBe(formatSeconds(expectedSeconds));
}

function verifyTotalTimeWorkedYesterdayForTask(c, taskName, expectedSeconds) {
  expect(getTimeWorkedYesterday(c, taskName).textContent).toBe(formatSeconds(expectedSeconds));
}

function verifyTotalTimeWorkedThisWeekForTask(c, taskName, expectedSeconds) {
  expect(getTimeWorkedThisWeek(c, taskName).textContent).toBe(formatSeconds(expectedSeconds));
}

function verifyNonexistenceOfTotalTimeWorkedTodayForTask(c, taskName) {
  expect(getTimeWorkedToday(c, taskName)).not.toBeInTheDocument();
}

function verifyNonexistenceOfTotalTimeWorkedYesterdayForTask(c, taskName) {
  expect(getTimeWorkedYesterday(c, taskName)).not.toBeInTheDocument();
}

function verifyNonexistenceOfTotalTimeWorkedThisWeekForTask(c, taskName) {
  expect(getTimeWorkedThisWeek(c, taskName)).not.toBeInTheDocument();
}

function verifyPercentageOfTimeTodayForTask(c, taskName, percentageText) {
  expect(c.getByTestId('todayp-' + taskName.charAt(0) + taskName.length).textContent).toBe(percentageText);
}

function getTimeWorkedToday(c, taskName) {
  return c.queryByTestId('today-' + taskName.charAt(0) + taskName.length);
}

function getTimeWorkedYesterday(c, taskName) {
  return c.queryByTestId('yesterday-' + taskName.charAt(0) + taskName.length);
}

function getTimeWorkedThisWeek(c, taskName) {
  return c.queryByTestId('week-' + taskName.charAt(0) + taskName.length);
}

function formatSeconds(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let secs = seconds % 60;
  return `${hours}h${minutes}m`;
}

function createTask(c, taskName) {
  Simulate.change(getNewTaskInput(c), {target: {value: taskName}});
  fireEvent.click(getSaveNewTaskButton(c));
}

function selectTask(c, taskName) {
  fireEvent.click(getTaskElement(c, taskName));
}

function getNewTaskInput(c) {
  return c.getByPlaceholderText(Constants.CREATE_TASK_PLACEHOLDER_TEXT);
}

function getSaveNewTaskButton(c) {
  return c.getByText(Constants.SAVE_NEW_TASK_BUTTON_TEXT);
}

function getTaskElement(c, taskName) {
  return c.getByLabelText(taskName);
}

class TestSettings extends Settings {
  constructor(workMinutes, shortBreakMinutes, longBreakMinutes, longBreakFreq) {
    super(workMinutes, shortBreakMinutes, longBreakMinutes, longBreakFreq);
  }
}

class MockNotifications {
  constructor(responseForRequestPermission) {
    this.permissionRequested = false;
    this.responseForRequestPermission = responseForRequestPermission;
    this.createdNotifications = [];
  }

  requestPermission() {
    this.permissionRequested = true;
    return {
      then: (callback) => {
        callback(this.responseForRequestPermission);
      }
    };
  }

  createNotification(title, params) {
    this.createdNotifications.push({
      title: title,
      params: params
    });
  }
}

class MockStorage {
  constructor() {
    this._state = '{}';
  }

  get state() {
    return JSON.parse(this._state);
  }

  set state(state) {
    this._state = JSON.stringify(state);
  }
}

function tickContinousWork(container, checked) {
  Simulate.change(container.getByTestId("cont-work"), {target: {checked: checked}});
}