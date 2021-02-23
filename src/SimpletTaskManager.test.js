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
test('creates new task', () => {
  let createdTask = null;
  const taskCreateCallback = (task) => {
    createdTask = task;
  }
  const c = render(<SimpleTaskManager onTaskCreate={taskCreateCallback} />);
  Simulate.change(getNewTaskInput(c), { target: { value: TEST_TASK_NAME } });
  fireEvent.click(getSaveNewTaskButton(c));
  expect(createdTask).toBe(TEST_TASK_NAME);
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

const TEST_TASK_NAME2 = 'eating cake';
test('displays tasks', () => {
  const tasks = [TEST_TASK_NAME, TEST_TASK_NAME2];
  const c = render(<SimpleTaskManager tasks={tasks} />);
  expect(getTaskElement(c, TEST_TASK_NAME)).toBeInTheDocument();
  expect(getTaskElement(c, TEST_TASK_NAME2)).toBeInTheDocument();
});

function getNewTaskInput(c) {
  return c.getByPlaceholderText(Constants.CREATE_TASK_PLACEHOLDER_TEXT);
}

function getSaveNewTaskButton(c) {
  return c.getByText(Constants.SAVE_NEW_TASK_BUTTON_TEXT);
}

function getTaskElement(c, taskName) {
  return c.getByLabelText(taskName);
}