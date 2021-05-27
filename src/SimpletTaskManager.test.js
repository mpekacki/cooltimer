import React from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import { Simulate } from 'react-dom/test-utils';
import SimpleTaskManager from './SimpleTaskManager';
import Constants from './Constants';

const CREATE_TASK_INPUT = 'create-task-input';

let container;

beforeEach(() => {
  container = document.createElement('div');
});

afterEach(() => {
  cleanup();
});

const TEST_TASK_NAME = 'petting the dog';
const TEST_TASK_NAME2 = 'eating cake';

test('creates new task', () => {
  let createdTask = null;
  const taskCreateCallback = (task) => {
    createdTask = task;
  }
  const c = render(<SimpleTaskManager onTaskCreate={taskCreateCallback} />);
  expect(getSaveNewTaskButton(c)).not.toBeInTheDocument();
  Simulate.change(getNewTaskInput(c), { target: { value: TEST_TASK_NAME } });
  expect(getSaveNewTaskButton(c)).toBeInTheDocument();
  fireEvent.click(getSaveNewTaskButton(c));
  expect(createdTask).toBe(TEST_TASK_NAME);
  expect(getNewTaskInput(c).value).toBe('');
  expect(getSaveNewTaskButton(c)).not.toBeInTheDocument();
});

test('creates new task trimmed', () => {
  let createdTask = null;
  const taskCreateCallback = (task) => {
    createdTask = task;
  }
  const c = render(<SimpleTaskManager onTaskCreate={taskCreateCallback} />);
  expect(getSaveNewTaskButton(c)).not.toBeInTheDocument();
  Simulate.change(getNewTaskInput(c), { target: { value: '   ' + TEST_TASK_NAME + ' ' } });
  expect(getSaveNewTaskButton(c)).toBeInTheDocument();
  fireEvent.click(getSaveNewTaskButton(c));
  expect(createdTask).toBe(TEST_TASK_NAME);
  expect(getNewTaskInput(c).value).toBe('');
  expect(getSaveNewTaskButton(c)).not.toBeInTheDocument();
});

test('selects existing task', () => {
  let selectedTask = null;
  const taskSelectedCallback = (task) => {
    selectedTask = task;
  }
  const c = render(<SimpleTaskManager onTaskSelected={taskSelectedCallback} tasks={[TEST_TASK_NAME]} />);
  fireEvent.click(getTaskElement(c, TEST_TASK_NAME));
  expect(selectedTask).toBe(TEST_TASK_NAME);
});

test('displays tasks', () => {
  const tasks = [TEST_TASK_NAME, TEST_TASK_NAME2];
  const c = render(<SimpleTaskManager tasks={tasks} />);
  expect(getTaskElement(c, TEST_TASK_NAME)).toBeInTheDocument();
  expect(getTaskElement(c, TEST_TASK_NAME2)).toBeInTheDocument();
});

test('displays No Task option always', () => {
  let selectedTask = undefined;
  const taskSelectedCallback = (task) => {
    selectedTask = task;
  }
  const tasks = [TEST_TASK_NAME, TEST_TASK_NAME2];
  const c = render(<SimpleTaskManager onTaskSelected={taskSelectedCallback} tasks={tasks} />);
  expect(getTaskElement(c, Constants.NO_TASK_TEXT)).toBeInTheDocument();
  fireEvent.click(getTaskElement(c, TEST_TASK_NAME));
  fireEvent.click(getTaskElement(c, Constants.NO_TASK_TEXT));
  expect(selectedTask).toBe(null);
});

test('selects option passed in props', () => {
  const tasks = [TEST_TASK_NAME, TEST_TASK_NAME2];
  let c = render(<SimpleTaskManager tasks={tasks} selectedTask={TEST_TASK_NAME} />);
  expect(getTaskElementChecked(c, TEST_TASK_NAME)).toBeTruthy();
  c.rerender(<SimpleTaskManager tasks={tasks} selectedTask={TEST_TASK_NAME2} />);
  expect(getTaskElementChecked(c, TEST_TASK_NAME2)).toBeTruthy();
  c.rerender(<SimpleTaskManager tasks={tasks} selectedTask={null} />);
  expect(getTaskElementChecked(c, Constants.NO_TASK_TEXT)).toBeTruthy();
});

test('does not show create task button if task already exists', () => {
  const c = render(<SimpleTaskManager tasks={[TEST_TASK_NAME]}/>);
  Simulate.change(getNewTaskInput(c), { target: { value: TEST_TASK_NAME } });
  expect(getSaveNewTaskButton(c)).not.toBeInTheDocument();
  Simulate.change(getNewTaskInput(c), { target: { value: TEST_TASK_NAME.toUpperCase() } });
  expect(getSaveNewTaskButton(c)).not.toBeInTheDocument();
});

test('does not show create task button if task input is blank', () => {
  const c = render(<SimpleTaskManager tasks={[TEST_TASK_NAME]}/>);
  Simulate.change(getNewTaskInput(c), { target: { value: '' } });
  expect(getSaveNewTaskButton(c)).not.toBeInTheDocument();
  Simulate.change(getNewTaskInput(c), { target: { value: ' ' } });
  expect(getSaveNewTaskButton(c)).not.toBeInTheDocument();
  Simulate.change(getNewTaskInput(c), { target: { value: '  ' } });
  expect(getSaveNewTaskButton(c)).not.toBeInTheDocument();
});

test('searches for tasks', () => {
  const tasks = [TEST_TASK_NAME, TEST_TASK_NAME2];
  const c = render(<SimpleTaskManager tasks={tasks} />);
  expect(getTaskElement(c, TEST_TASK_NAME)).toBeInTheDocument();
  expect(getTaskElement(c, TEST_TASK_NAME2)).toBeInTheDocument();
  Simulate.change(getNewTaskInput(c), { target: { value: 'cake' } });
  expect(getTaskElement(c, TEST_TASK_NAME)).not.toBeInTheDocument();
  expect(getTaskElement(c, TEST_TASK_NAME2)).toBeInTheDocument();
  Simulate.change(getNewTaskInput(c), { target: { value: 'DOG' } });
  expect(getTaskElement(c, TEST_TASK_NAME)).toBeInTheDocument();
  expect(getTaskElement(c, TEST_TASK_NAME2)).not.toBeInTheDocument();
});

function getNewTaskInput(c) {
  return c.getByPlaceholderText(Constants.CREATE_TASK_PLACEHOLDER_TEXT);
}

function getSaveNewTaskButton(c) {
  return c.queryByText(Constants.SAVE_NEW_TASK_BUTTON_TEXT);
}

function getTaskElement(c, taskName) {
  return c.queryByLabelText(taskName);
}

function getTaskElementChecked(c, taskName) {
  return getTaskElement(c, taskName).checked;
}