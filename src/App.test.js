import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import App from './App';
import Settings from './Settings';
import { Simulate } from 'react-dom/test-utils';
import Constants from './Constants';

const MOCK_START_TIME = 1603829345000;

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
      return <ul>{props && props.events && props.events.map((event) => <li>{event.title + ' ' + event.start.getTime() + ' ' + event.end.getTime()}</li>)}</ul>;
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
  const testSettings = new Settings(25, 5, 10, 4);
  const { getByText } = render(<App defaultSettings={testSettings} />);
  const mainTimer = getByText(/25:00/i);
  expect(mainTimer).toBeInTheDocument();
  const startWorkingBtn = getByText(/Start working/i);
  expect(startWorkingBtn).toBeInTheDocument();
});

test('starts timer after clicking the button', () => {
  const { getByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  fireEvent.click(getByText(/Start working/i));
  advanceTimersByTime(1000);
  expect(getByText(/24:59/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 1 second/i)).toBeInTheDocument();
  // expect(document.title).toBe("24:59");
  advanceTimersByTime((12 * 60 + 12) * 1000);
  expect(getByText(/12:47/i)).toBeInTheDocument();
  expect(getByText(/0 hours 12 minutes 13 seconds/i)).toBeInTheDocument();
  // expect(document.title).toBe("12:47");
  advanceTimersByTime((12 * 60 + 46) * 1000);
  expect(getByText(/00:01/i)).toBeInTheDocument();
  expect(getByText(/0 hours 24 minutes 59 seconds/i)).toBeInTheDocument();
  // expect(document.title).toBe("00:01");
});

test('switches to break after work time elapses', () => {
  const { getByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  fireEvent.click(getByText(/Start working/i));
  advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/05:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime(1000);
  expect(getByText(/04:59/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 59 seconds/i)).toBeInTheDocument();
  advanceTimersByTime(15 * 1000);
  expect(getByText(/04:44/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 44 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((4 * 60 + 44) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime(1000);
  expect(getByText(/24:59/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 1 second/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
});

test('renders total work time correctly', () => {
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
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

test('after n periods, uses long break instead of short break', () => {
  const { getByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  fireEvent.click(getByText(/Start working/i));
  advanceTimersByTime(((25 + 5 + 25 + 5 + 25 + 5 + 25) * 60) * 1000);
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/1 hour 40 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 10 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime(((10 + 25) * 60) * 1000);
  expect(getByText(/05:00/i)).toBeInTheDocument();
  expect(getByText(/2 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
});

test('after clicking on "Return to work" during break, resumes work', () => {
  const { getByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  fireEvent.click(getByText(/Start working/i));
  advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime(10 * 1000);
  expect(getByText(/04:50/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Return to work/i));
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((10 * 60) * 1000);
  expect(getByText(/15:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((15 * 60) * 1000);
  expect(getByText(/09:50/i)).toBeInTheDocument();
  expect(getByText(/0 hours 50 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 9 minutes 50 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((9 * 60 + 50) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 50 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
});

test('if during work there is break time available, clicking on "Go on a break" starts break', () => {
  const { getByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  fireEvent.click(getByText(/Start working/i));
  advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime(10 * 1000);
  expect(getByText(/04:50/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Return to work/i));
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((10 * 60) * 1000);
  expect(getByText(/15:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Go on a break/i));
  expect(getByText(/04:50/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  advanceTimersByTime(50 * 1000);
  expect(getByText(/04:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Return to work/i));
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/20:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 40 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Go on a break/i));
  expect(getByText(/04:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 40 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((4 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 40 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
});

test('after clicking on "Hold work" button, holds all timers, and after clicking on "Resume work" starts them again', () => {
  const { getByText, queryByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  expect(queryByText(/Hold work/i)).toBeNull();
  expect(queryByText(/Resume work/i)).toBeNull();
  fireEvent.click(getByText(/Start working/i));
  expect(queryByText(/Hold work/i)).toBeInTheDocument();
  expect(queryByText(/Resume work/i)).toBeNull();
  advanceTimersByTime((15 * 60) * 1000);
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 15 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Hold work/i));
  expect(queryByText(/Hold work/i)).toBeNull();
  expect(queryByText(/Resume work/i)).toBeInTheDocument();
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 15 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(queryByText(/Hold work/i)).toBeNull();
  expect(queryByText(/Resume work/i)).toBeInTheDocument();
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 15 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Resume work/i));
  expect(queryByText(/Hold work/i)).toBeInTheDocument();
  expect(queryByText(/Resume work/i)).toBeNull();
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 15 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(queryByText(/Hold work/i)).toBeInTheDocument();
  expect(queryByText(/Resume work/i)).toBeNull();
  expect(getByText(/05:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 20 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(queryByText(/Hold work/i)).toBeInTheDocument();
  expect(queryByText(/Resume work/i)).toBeNull();
  expect(getByText(/05:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((1 * 60) * 1000);
  expect(getByText(/04:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Hold work/i));
  expect(queryByText(/Hold work/i)).toBeNull();
  expect(queryByText(/Resume work/i)).toBeInTheDocument();
  expect(getByText(/04:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime(1000);
  expect(queryByText(/Hold work/i)).toBeNull();
  expect(queryByText(/Resume work/i)).toBeInTheDocument();
  expect(getByText(/04:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Resume work/i));
  expect(queryByText(/Hold work/i)).toBeInTheDocument();
  expect(queryByText(/Resume work/i)).toBeNull();
  expect(getByText(/04:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime(1000);
  expect(queryByText(/Hold work/i)).toBeInTheDocument();
  expect(queryByText(/Resume work/i)).toBeNull();
  expect(getByText(/03:59/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 3 minutes 59 seconds/i)).toBeInTheDocument();
});

test('hides "Start working" button after it\'s clicked', () => {
  const { getByText, queryByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  fireEvent.click(getByText(/Start working/i));
  expect(queryByText(/Start working/i)).toBeNull();
});

test('displays "Return to work" button only if on a break', () => {
  const { getByText, queryByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  expect(queryByText(/Return to work/i)).toBeNull();
  fireEvent.click(getByText(/Start working/i));
  expect(queryByText(/Return to work/i)).toBeNull();
  advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/Return to work/i)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(queryByText(/Return to work/i)).toBeNull();
});

test('displays "Go on a break" button only during work and when there is break time available', () => {
  const { getByText, queryByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  expect(queryByText(/Go on a break/i)).toBeNull();
  fireEvent.click(getByText(/Start working/i));
  expect(queryByText(/Go on a break/i)).toBeNull();
  advanceTimersByTime((25 * 60) * 1000);
  expect(queryByText(/Go on a break/i)).toBeNull();
  advanceTimersByTime((5 * 60) * 1000);
  expect(queryByText(/Go on a break/i)).toBeNull();
  advanceTimersByTime((25 * 60) * 1000);
  expect(queryByText(/Go on a break/i)).toBeNull();
  advanceTimersByTime((1 * 60) * 1000);
  fireEvent.click(getByText(/Return to work/i));
  expect(getByText(/Go on a break/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Go on a break/i));
  expect(queryByText(/Go on a break/i)).toBeNull();
});

test('asks for notification permission on startup', () => {
  let mockNotifications = new MockNotifications();
  render(<App defaultSettings={ new Settings(25, 5, 10, 4) } notifications={ mockNotifications }/>);
  expect(mockNotifications.permissionRequested).toBeTruthy();
});

test('if permission for notifications is granted, displays notification after time elapses', () => {
  let mockNotifications = new MockNotifications('granted');
  const { getByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } notifications={ mockNotifications }/>);
  fireEvent.click(getByText(/Start working/i));
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
  const { getByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } notifications={ mockNotifications }/>);
  fireEvent.click(getByText(/Start working/i));
  expect(mockNotifications.createdNotifications.length).toBe(0);
  advanceTimersByTime((10 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(0);
  advanceTimersByTime((15 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(0);
});

test('if "Continous work" is checked, should switch to next work period instead of break period', () => {
  const { getByText, getByTestId } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  expect(getByTestId("cont-work")).toBeInTheDocument();
  fireEvent.click(getByText(/Start working/i));
  expect(getByTestId("cont-work")).toBeInTheDocument();
  Simulate.change(getByTestId("cont-work"), {target: {checked: true}});
  advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime(1000);
  expect(getByText(/24:59/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 1 second/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  Simulate.change(getByTestId("cont-work"), {target: {checked: false}});
  advanceTimersByTime((24 * 60 + 59) * 1000);
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 50 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 10 minutes 0 seconds/i)).toBeInTheDocument();
});

test('if work is continued even though there is full break available, then add incrementally to break time during work', () => {
  const { getByText, getByTestId } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  fireEvent.click(getByText(/Start working/i));
  Simulate.change(getByTestId("cont-work"), {target: {checked: true}});
  advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/20:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 30 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 6 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/15:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 7 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 40 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 8 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/05:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 45 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 9 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 50 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 10 minutes 0 seconds/i)).toBeInTheDocument();
  advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/20:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 55 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 11 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/Go on a break/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Go on a break/i));
  expect(getByText(/11:00/i)).toBeInTheDocument();
  advanceTimersByTime((11 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 55 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
});

test('if there is less than short break time during work and break is started, then the awarded break is not lost and is added to next break time', () => {
  const { getByText, getByTestId } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  fireEvent.click(getByText(/Start working/i));
  Simulate.change(getByTestId("cont-work"), {target: {checked: true}});
  advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  clickGoOnABreak(getByText);
  advanceTimersByTime((1 * 60) * 1000);
  expect(getByText(/04:00/i)).toBeInTheDocument();
  clickReturnToWork(getByText);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  advanceTimersByTime((20 * 60) * 1000);
  expect(getByText(/0 hours 45 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  clickGoOnABreak(getByText);
  advanceTimersByTime((4 * 60) * 1000);
  advanceTimersByTime((25 * 60) * 1000);
  clickGoOnABreak(getByText);
  expect(getByText(/09:00/i)).toBeInTheDocument();
  expect(getByText(/1 hour 10 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 9 minutes 0 seconds/i)).toBeInTheDocument();
});

test('saves app state to provided storage', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = null;
  const { getByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  fireEvent.click(getByText(/Start working/i));
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
  const { getByText, queryByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  expect(getByText(/21:35/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 10 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 3 seconds/i)).toBeInTheDocument();
  advanceTimersByTime(1000);
  expect(getByText(/21:34/i)).toBeInTheDocument();
});

test('restores app state from incomplete storage', () => {
  let mockStorage = new MockStorage();
  let savedState = {
    foof: "suus",
    shortBreakMinutes: 3
  };
  mockStorage.state = savedState;
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  verifyTimer(c, "25:00");
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime(25 * 60 * 1000);
  verifyTimer(c, "03:00");
});

test('saves app state with timer stopped if timer is stopped', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = null;
  const { getByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  fireEvent.click(getByText(/Start working/i));
  advanceTimersByTime(1000);
  fireEvent.click(getByText(/Hold work/i));
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
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
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
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
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
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
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
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
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
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  verifyTimer(c, "13:00");
  advanceTimersByTime(13 * 60 * 1000);
  verifyTimer(c, "03:00");
  advanceTimersByTime(3 * 60 * 1000);
  verifyTimer(c, "13:00");
  advanceTimersByTime(13 * 60 * 1000);
  verifyTimer(c, "07:00");
});

test('displays values passed in props', () => {
  const { getByDisplayValue } = render(<App defaultSettings={ new Settings(13, 3, 7, 2) }/>);
  expect(getByDisplayValue("13")).toBeInTheDocument();
  expect(getByDisplayValue("3")).toBeInTheDocument();
  expect(getByDisplayValue("7")).toBeInTheDocument();
  expect(getByDisplayValue("2")).toBeInTheDocument();
});

test('updates settings after changing settings values', () => {
  const c = render(<App defaultSettings={ new Settings(13, 3, 7, 2) }/>);
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
  const c = render(<App defaultSettings={ new Settings(13, 3, 7, 2) }/>);
  Simulate.change(c.getByDisplayValue("13"), { target: { value: 19 } });
  expect(c.getByDisplayValue("19")).toBeInTheDocument();
  verifyTimer(c, "13:00");
  fireEvent.click(resetButton(c));
  verifyTimer(c, "19:00");
});

test('resets without events or tasks', () => {
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  createTask(c, TEST_TASK_NAME);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  fireEvent.click(resetButton(c));
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  expect(getTaskElement(c, TEST_TASK_NAME)).toBeInTheDocument();
});

test('displays event in calendar', () => {
  const { getByText, getAllByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  fireEvent.click(getByText(/Start working/i));
  advanceTimersByTime((25 * 60) * 1000);
  expect(getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((5 * 60) * 1000);
  expect(getAllByText(`Break ${MOCK_START_TIME + 25 * 60 * 1000} ${MOCK_START_TIME + 30 * 60 * 1000}`).length).toBe(1);
});

test('displays events in calendar correctly when manually switching timer', () => {
  const { getByText, getAllByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  fireEvent.click(getByText(/Start working/i));
  advanceTimersByTime((25 * 60) * 1000);
  expect(getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((1 * 60) * 1000);
  clickReturnToWork(getByText);
  expect(getAllByText(`Break ${MOCK_START_TIME + 25 * 60 * 1000} ${MOCK_START_TIME + 26 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((4 * 60) * 1000);
  clickGoOnABreak(getByText);
  expect(getAllByText(`Work ${MOCK_START_TIME + 26 * 60 * 1000} ${MOCK_START_TIME + 30 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((1 * 60) * 1000);
  fireEvent.click(getByText(/Hold work/i));
  expect(getAllByText(`Break ${MOCK_START_TIME + 30 * 60 * 1000} ${MOCK_START_TIME + 31 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((1 * 60) * 1000);
  fireEvent.click(getByText(/Resume work/i));
  advanceTimersByTime((1 * 60) * 1000);
  clickReturnToWork(getByText);
  expect(getAllByText(`Break ${MOCK_START_TIME + 32 * 60 * 1000} ${MOCK_START_TIME + 33 * 60 * 1000}`).length).toBe(1);
});

test('saves and restores event state in storage', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = {};
  const { getByText, getAllByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  fireEvent.click(getByText(/Start working/i));
  advanceTimersByTime((25 * 60) * 1000);
  expect(getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((2 * 60) * 1000);
  cleanup();
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((3 * 60) * 1000);
  expect(c.getAllByText(`Break ${MOCK_START_TIME + 25 * 60 * 1000} ${MOCK_START_TIME + 30 * 60 * 1000}`).length).toBe(1);
});

test('correctly creates events when restoring app after delay', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = {};
  const { getByText, getAllByText } = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  fireEvent.click(getByText(/Start working/i));
  advanceTimersByTime((25 * 60) * 1000);
  expect(getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((2 * 60) * 1000);
  cleanup();
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  advanceTimersByTime((10 * 60) * 1000);
  expect(c.getAllByText(`Break ${MOCK_START_TIME + 25 * 60 * 1000} ${MOCK_START_TIME + 30 * 60 * 1000}`).length).toBe(1);
});

test('squashes neighbouring events of the same type', () => {
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  tickContinousWork(c, true);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 50 * 60 * 1000}`).length).toBe(1);
  fireEvent.click(c.getByText(/Hold work/i));
  advanceTimersByTime((10 * 60) * 1000);
  fireEvent.click(c.getByText(/Resume work/i));
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME + 60 * 60 * 1000} ${MOCK_START_TIME + 85 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME + 60 * 60 * 1000} ${MOCK_START_TIME + 110 * 60 * 1000}`).length).toBe(1);
});

const TEST_TASK_NAME = 'petting the dog';
test('when task is selected, saves calendar work events with task name', () => {
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  createTask(c, TEST_TASK_NAME);
  selectTask(c, TEST_TASK_NAME);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  verifyEventCreatedForWorkWithTask(c, TEST_TASK_NAME, MOCK_START_TIME, MOCK_START_TIME + 25 * 60 * 1000);
});

const TEST_TASK_NAME2 = 'eating cake';
test('when selected task changes, finish current event and start new one', () => {
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
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
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
  tickContinousWork(c, true);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 25 * 60 * 1000}`).length).toBe(1);
  advanceTimersByTime((10 * 60) * 1000);
  fireEvent.click(holdWorkButton(c));
  expect(c.getAllByText(`Work ${MOCK_START_TIME} ${MOCK_START_TIME + 35 * 60 * 1000}`).length).toBe(1);
  fireEvent.click(goOnABreakButton(c));
  clickReturnToWork(c.getByText);
  expect(c.queryByText(`Break ${MOCK_START_TIME + 35 * 60 * 1000} ${MOCK_START_TIME + 35 * 60 * 1000}`)).not.toBeInTheDocument();
});

test('stores task info in storage and restores it', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = {};
  let c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  createTask(c, TEST_TASK_NAME);
  createTask(c, TEST_TASK_NAME2);
  selectTask(c, TEST_TASK_NAME);
  cleanup();
  c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  expect(getTaskElement(c, TEST_TASK_NAME)).toBeInTheDocument();
  expect(getTaskElement(c, TEST_TASK_NAME2)).toBeInTheDocument();
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  verifyEventCreatedForWorkWithTask(c, TEST_TASK_NAME, MOCK_START_TIME, MOCK_START_TIME + 25 * 60 * 1000);
});

test('shows total time worked per task today', () => {
  const c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) }/>);
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
});

test('does not show yesterday\'s task total time worked in today column', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = {};
  let c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  createTask(c, TEST_TASK_NAME);
  fireEvent.click(startWorkingButton(c));
  advanceTimersByTime((25 * 60) * 1000);
  verifyTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME, 25 * 60);
  cleanup();
  advanceDateMock(24 * 60 * 60 * 1000);
  c = render(<App defaultSettings={ new Settings(25, 5, 10, 4) } storage={ mockStorage }/>);
  verifyNoTotalTimeWorkedTodayForTask(c, TEST_TASK_NAME, 25 * 60);
});

function startWorkingButton(container) {
  return container.getByTestId("start-working-btn");
}

function resetButton(container) {
  return container.getByTestId("reset-btn");
}

function resumeWorkButton(container) {
  return container.getByTestId("resume-work-btn");
}

function holdWorkButton(c) {
  return c.getByText(/Hold work/i);
}

function goOnABreakButton(c) {
  return c.getByText(/Go on a break/i);
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
  expect(c.getByText(formatSeconds(expectedSeconds))).toBeInTheDocument();
}

function verifyNoTotalTimeWorkedTodayForTask(c, taskName, expectedSeconds) {
  expect(c.queryByText(formatSeconds(expectedSeconds))).not.toBeInTheDocument();
}

function formatSeconds(seconds) {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds % 3600) / 60);
  let secs = seconds % 60;
  return hours + 'h' + minutes + 'm' + secs + 's';
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

function clickGoOnABreak(getByText) {
  fireEvent.click(getByText(/Go on a break/i));
}

function clickReturnToWork(getByText) {
  fireEvent.click(getByText(/Return to work/i));
}

function tickContinousWork(container, checked) {
  Simulate.change(container.getByTestId("cont-work"), {target: {checked: checked}});
}