import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import App from './App';
import Settings from './Settings';
import { Simulate } from 'react-dom/test-utils';

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  cleanup();
  document.body.removeChild(container);
  container = null;
});

jest.useFakeTimers();

test('renders timer based on passed settings', () => {
  const testSettings = new TestSettings(25, 5, 10, 4, 480);
  const { getByText } = render(<App settings={ testSettings }/>);
  const mainTimer = getByText(/25:00/i);
  expect(mainTimer).toBeInTheDocument();
  const startWorkingBtn = getByText(/Start working/i);
  expect(startWorkingBtn).toBeInTheDocument();
});

test('starts timer after clicking the button', () => {
  const { getByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  fireEvent.click(getByText(/Start working/i));
  jest.advanceTimersByTime(1000);
  expect(getByText(/24:59/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 1 second/i)).toBeInTheDocument();
  // expect(document.title).toBe("24:59");
  jest.advanceTimersByTime((12 * 60 + 12) * 1000);
  expect(getByText(/12:47/i)).toBeInTheDocument();
  expect(getByText(/0 hours 12 minutes 13 seconds/i)).toBeInTheDocument();
  // expect(document.title).toBe("12:47");
  jest.advanceTimersByTime((12 * 60 + 46) * 1000);
  expect(getByText(/00:01/i)).toBeInTheDocument();
  expect(getByText(/0 hours 24 minutes 59 seconds/i)).toBeInTheDocument();
  // expect(document.title).toBe("00:01");
});

test('switches to break after work time elapses', () => {
  const { getByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  fireEvent.click(getByText(/Start working/i));
  jest.advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/05:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(1000);
  expect(getByText(/04:59/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 59 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(15 * 1000);
  expect(getByText(/04:44/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 44 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((4 * 60 + 44) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(1000);
  expect(getByText(/24:59/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 1 second/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
});

test('renders total work time correctly', () => {
  const { getByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  fireEvent.click(getByText(/Start working/i));
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(((5 + 25 + 5 + 9) * 60) * 1000);
  expect(getByText(/0 hours 59 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(60 * 1000);
  expect(getByText(/1 hour 0 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(60 * 1000);
  expect(getByText(/1 hour 1 minute 0 seconds/i)).toBeInTheDocument();
});

test('after n periods, uses long break instead of short break', () => {
  const { getByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  fireEvent.click(getByText(/Start working/i));
  jest.advanceTimersByTime(((25 + 5 + 25 + 5 + 25 + 5 + 25) * 60) * 1000);
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/1 hour 40 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 10 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(((10 + 25) * 60) * 1000);
  expect(getByText(/05:00/i)).toBeInTheDocument();
  expect(getByText(/2 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
});

test('after clicking on "Return to work" during break, resumes work', () => {
  const { getByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  fireEvent.click(getByText(/Start working/i));
  jest.advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(10 * 1000);
  expect(getByText(/04:50/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Return to work/i));
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((10 * 60) * 1000);
  expect(getByText(/15:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((15 * 60) * 1000);
  expect(getByText(/09:50/i)).toBeInTheDocument();
  expect(getByText(/0 hours 50 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 9 minutes 50 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((9 * 60 + 50) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 50 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
});

test('if during work there is break time available, clicking on "Go on a break" starts break', () => {
  const { getByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  fireEvent.click(getByText(/Start working/i));
  jest.advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(10 * 1000);
  expect(getByText(/04:50/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Return to work/i));
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((10 * 60) * 1000);
  expect(getByText(/15:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Go on a break/i));
  expect(getByText(/04:50/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 50 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(50 * 1000);
  expect(getByText(/04:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Return to work/i));
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/20:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 40 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Go on a break/i));
  expect(getByText(/04:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 40 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((4 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 40 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
});

test('after clicking on "Hold work" button, holds all timers, and after clicking on "Resume work" starts them again', () => {
  const { getByText, queryByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  expect(queryByText(/Hold work/i)).toBeNull();
  expect(queryByText(/Resume work/i)).toBeNull();
  fireEvent.click(getByText(/Start working/i));
  expect(queryByText(/Hold work/i)).toBeInTheDocument();
  expect(queryByText(/Resume work/i)).toBeNull();
  jest.advanceTimersByTime((15 * 60) * 1000);
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 15 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Hold work/i));
  expect(queryByText(/Hold work/i)).toBeNull();
  expect(queryByText(/Resume work/i)).toBeInTheDocument();
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 15 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((5 * 60) * 1000);
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
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(queryByText(/Hold work/i)).toBeInTheDocument();
  expect(queryByText(/Resume work/i)).toBeNull();
  expect(getByText(/05:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 20 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(queryByText(/Hold work/i)).toBeInTheDocument();
  expect(queryByText(/Resume work/i)).toBeNull();
  expect(getByText(/05:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((1 * 60) * 1000);
  expect(getByText(/04:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Hold work/i));
  expect(queryByText(/Hold work/i)).toBeNull();
  expect(queryByText(/Resume work/i)).toBeInTheDocument();
  expect(getByText(/04:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(1000);
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
  jest.advanceTimersByTime(1000);
  expect(queryByText(/Hold work/i)).toBeInTheDocument();
  expect(queryByText(/Resume work/i)).toBeNull();
  expect(getByText(/03:59/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 3 minutes 59 seconds/i)).toBeInTheDocument();
});

test('hides "Start working" button after it\'s clicked', () => {
  const { getByText, queryByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  fireEvent.click(getByText(/Start working/i));
  expect(queryByText(/Start working/i)).toBeNull();
});

test('displays "Return to work" button only if on a break', () => {
  const { getByText, queryByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  expect(queryByText(/Return to work/i)).toBeNull();
  fireEvent.click(getByText(/Start working/i));
  expect(queryByText(/Return to work/i)).toBeNull();
  jest.advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/Return to work/i)).toBeInTheDocument();
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(queryByText(/Return to work/i)).toBeNull();
});

test('displays "Go on a break" button only during work and when there is break time available', () => {
  const { getByText, queryByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  expect(queryByText(/Go on a break/i)).toBeNull();
  fireEvent.click(getByText(/Start working/i));
  expect(queryByText(/Go on a break/i)).toBeNull();
  jest.advanceTimersByTime((25 * 60) * 1000);
  expect(queryByText(/Go on a break/i)).toBeNull();
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(queryByText(/Go on a break/i)).toBeNull();
  jest.advanceTimersByTime((25 * 60) * 1000);
  expect(queryByText(/Go on a break/i)).toBeNull();
  jest.advanceTimersByTime((1 * 60) * 1000);
  fireEvent.click(getByText(/Return to work/i));
  expect(getByText(/Go on a break/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Go on a break/i));
  expect(queryByText(/Go on a break/i)).toBeNull();
});

test('asks for notification permission on startup', () => {
  let mockNotifications = new MockNotifications();
  render(<App settings={ new TestSettings(25, 5, 10, 4, 480) } notifications={ mockNotifications }/>);
  expect(mockNotifications.permissionRequested).toBeTruthy();
});

test('if permission for notifications is granted, displays notification after time elapses', () => {
  let mockNotifications = new MockNotifications('granted');
  const { getByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) } notifications={ mockNotifications }/>);
  fireEvent.click(getByText(/Start working/i));
  expect(mockNotifications.createdNotifications.length).toBe(0);
  jest.advanceTimersByTime((10 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(0);
  jest.advanceTimersByTime((15 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(1);
  let notification = mockNotifications.createdNotifications[0];
  expect(notification.title).toBe('Work finished');
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(2);
  let breakNotification = mockNotifications.createdNotifications[1];
  expect(breakNotification.title).toBe('Break finished');
});

test('if permission for notifications is not granted, does not attempt to create a notfication', () => {
  let mockNotifications = new MockNotifications('denied');
  const { getByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) } notifications={ mockNotifications }/>);
  fireEvent.click(getByText(/Start working/i));
  expect(mockNotifications.createdNotifications.length).toBe(0);
  jest.advanceTimersByTime((10 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(0);
  jest.advanceTimersByTime((15 * 60) * 1000);
  expect(mockNotifications.createdNotifications.length).toBe(0);
});

test('if "Continous work" is checked, should switch to next work period instead of break period', () => {
  const { getByText, getByTestId } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  expect(getByTestId("cont-work")).toBeInTheDocument();
  fireEvent.click(getByText(/Start working/i));
  expect(getByTestId("cont-work")).toBeInTheDocument();
  Simulate.change(getByTestId("cont-work"), {target: {checked: true}});
  jest.advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(1000);
  expect(getByText(/24:59/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 1 second/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  Simulate.change(getByTestId("cont-work"), {target: {checked: false}});
  jest.advanceTimersByTime((24 * 60 + 59) * 1000);
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 50 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 10 minutes 0 seconds/i)).toBeInTheDocument();
});

test('if work is continued even though there is full break available, then add incrementally to break time during work', () => {
  const { getByText, getByTestId } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  fireEvent.click(getByText(/Start working/i));
  Simulate.change(getByTestId("cont-work"), {target: {checked: true}});
  jest.advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/20:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 30 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 6 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/15:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 35 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 7 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/10:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 40 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 8 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/05:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 45 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 9 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 50 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 10 minutes 0 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime((5 * 60) * 1000);
  expect(getByText(/20:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 55 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 11 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/Go on a break/i)).toBeInTheDocument();
  fireEvent.click(getByText(/Go on a break/i));
  expect(getByText(/11:00/i)).toBeInTheDocument();
  jest.advanceTimersByTime((11 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 55 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 0 seconds/i)).toBeInTheDocument();
});

test('if there is less than short break time during work and break is started, then the awarded break is not lost and is added to next break time', () => {
  const { getByText, getByTestId } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) }/>);
  fireEvent.click(getByText(/Start working/i));
  Simulate.change(getByTestId("cont-work"), {target: {checked: true}});
  jest.advanceTimersByTime((25 * 60) * 1000);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  expect(getByText(/0 hours 25 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 5 minutes 0 seconds/i)).toBeInTheDocument();
  clickGoOnABreak(getByText);
  jest.advanceTimersByTime((1 * 60) * 1000);
  expect(getByText(/04:00/i)).toBeInTheDocument();
  clickReturnToWork(getByText);
  expect(getByText(/25:00/i)).toBeInTheDocument();
  jest.advanceTimersByTime((20 * 60) * 1000);
  expect(getByText(/0 hours 45 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 4 minutes 0 seconds/i)).toBeInTheDocument();
  clickGoOnABreak(getByText);
  jest.advanceTimersByTime((4 * 60) * 1000);
  jest.advanceTimersByTime((25 * 60) * 1000);
  clickGoOnABreak(getByText);
  expect(getByText(/09:00/i)).toBeInTheDocument();
  expect(getByText(/1 hour 10 minutes 0 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 9 minutes 0 seconds/i)).toBeInTheDocument();
});

test('saves app state to provided storage', () => {
  let mockStorage = new MockStorage();
  mockStorage.state = null;
  const { getByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) } storage={ mockStorage }/>);
  fireEvent.click(getByText(/Start working/i));
  jest.advanceTimersByTime(1000);
  expect(mockStorage.state).toBeTruthy();
  expect(mockStorage.state).toStrictEqual({
    timerSeconds: 24 * 60 + 59,
    totalWorkedSeconds: 1,
    isWork: true,
    availableBreakSeconds: 0,
    hiddenAvailableBreakSeconds: 0.2,
    cycle: 0,
    notificationsGranted: false,
    timerRunning: true,
    continousWork: false
  });
});

test('restores app state from provided storage', () => {
  let mockStorage = new MockStorage();
  let savedState = {
    timerSeconds: 21 * 60 + 37,
    totalWorkedSeconds: 8,
    isWork: true,
    availableBreakSeconds: 3,
    hiddenAvailableBreakSeconds: 0,
    cycle: 0,
    notificationsGranted: false,
    timerRunning: true,
    continousWork: true
  };
  mockStorage.state = savedState;
  const { getByText, queryByText } = render(<App settings={ new TestSettings(25, 5, 10, 4, 480) } storage={ mockStorage }/>);
  expect(getByText(/21:37/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 8 seconds/i)).toBeInTheDocument();
  expect(getByText(/0 hours 0 minutes 3 seconds/i)).toBeInTheDocument();
  jest.advanceTimersByTime(1000);
  expect(getByText(/21:36/i)).toBeInTheDocument();
});

class TestSettings extends Settings {
  constructor(workMinutes, shortBreakMinutes, longBreakMinutes, longBreakFreq, workDayMinutes) {
    super(workMinutes, shortBreakMinutes, longBreakMinutes, longBreakFreq, workDayMinutes);
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
    this._state = {};
  }

  get state() {
      return this._state;
  }

  set state(state) {
      this._state = state;
  }
}

function clickGoOnABreak(getByText) {
  fireEvent.click(getByText(/Go on a break/i));
}

function clickReturnToWork(getByText) {
  fireEvent.click(getByText(/Return to work/i));
}
