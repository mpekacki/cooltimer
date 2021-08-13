import React from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { Simulate } from "react-dom/test-utils";
import UserSettings from "./UserSettings";
import Settings from "./Settings";

let container;

beforeEach(() => {
  container = document.createElement("div");
});

afterEach(() => {
  cleanup();
});

test("displays values passed in props", () => {
  const { getByDisplayValue } = render(
    <UserSettings
      workMinutes={13}
      shortBreakMinutes={3}
      longBreakMinutes={7}
      longBreakFreq={2}
    />
  );
  expect(getByDisplayValue("13")).toBeInTheDocument();
  expect(getByDisplayValue("3")).toBeInTheDocument();
  expect(getByDisplayValue("7")).toBeInTheDocument();
  expect(getByDisplayValue("2")).toBeInTheDocument();
});

test("calls callback after changing value 1", () => {
  let callbackCalled = false;
  let callbackParam;
  const callback = (settings) => {
    callbackCalled = true;
    callbackParam = settings;
  };
  const { getByDisplayValue } = render(
    <UserSettings
      workMinutes={13}
      shortBreakMinutes={3}
      longBreakMinutes={7}
      longBreakFreq={2}
      onchange={callback}
    />
  );
  Simulate.change(getByDisplayValue("13"), { target: { value: 19 } });
  expect(callbackCalled).toBeTruthy();
  expect(callbackParam).toStrictEqual({
    workMinutes: 19,
    shortBreakMinutes: 3,
    longBreakMinutes: 7,
    longBreakFreq: 2,
  });
});

test("calls callback after changing value 2", () => {
  let callbackCalled = false;
  let callbackParam;
  const callback = (settings) => {
    callbackCalled = true;
    callbackParam = settings;
  };
  const { getByDisplayValue } = render(
    <UserSettings
      workMinutes={13}
      shortBreakMinutes={3}
      longBreakMinutes={7}
      longBreakFreq={2}
      onchange={callback}
    />
  );
  Simulate.change(getByDisplayValue("3"), { target: { value: 19 } });
  expect(callbackCalled).toBeTruthy();
  expect(callbackParam).toStrictEqual({
    workMinutes: 13,
    shortBreakMinutes: 19,
    longBreakMinutes: 7,
    longBreakFreq: 2,
  });
});

test("calls callback after changing value 3", () => {
  let callbackCalled = false;
  let callbackParam;
  const callback = (settings) => {
    callbackCalled = true;
    callbackParam = settings;
  };
  const { getByDisplayValue } = render(
    <UserSettings
      workMinutes={13}
      shortBreakMinutes={3}
      longBreakMinutes={7}
      longBreakFreq={2}
      onchange={callback}
    />
  );
  Simulate.change(getByDisplayValue("7"), { target: { value: 19 } });
  expect(callbackCalled).toBeTruthy();
  expect(callbackParam).toStrictEqual({
    workMinutes: 13,
    shortBreakMinutes: 3,
    longBreakMinutes: 19,
    longBreakFreq: 2,
  });
});

test("calls callback after changing value 4", () => {
  let callbackCalled = false;
  let callbackParam;
  const callback = (settings) => {
    callbackCalled = true;
    callbackParam = settings;
  };
  const { getByDisplayValue } = render(
    <UserSettings
      workMinutes={13}
      shortBreakMinutes={3}
      longBreakMinutes={7}
      longBreakFreq={2}
      onchange={callback}
    />
  );
  Simulate.change(getByDisplayValue("2"), { target: { value: 19 } });
  expect(callbackCalled).toBeTruthy();
  expect(callbackParam).toStrictEqual({
    workMinutes: 13,
    shortBreakMinutes: 3,
    longBreakMinutes: 7,
    longBreakFreq: 19,
  });
});
