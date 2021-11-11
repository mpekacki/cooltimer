import Settings from "./Settings";

class DefaultSettings extends Settings {
  constructor() {
    const workMinutes = 25;
    const shortBreakMinutes = 5;
    const longBreakMinutes = 10;
    const longBreakFreq = 4;
    const continousWork = true;

    super(
      workMinutes,
      shortBreakMinutes,
      longBreakMinutes,
      longBreakFreq,
      continousWork,
      {
        timerSeconds: workMinutes * 60,
        lastWorkTimerSeconds: workMinutes * 60,
        totalWorkedSeconds: 0,
        isWork: null,
        availableBreakSeconds: 0,
        hiddenAvailableBreakSeconds: 0,
        totalCombinedTime: 0,
        cycle: 0,
        notificationsGranted: false,
        timerRunning: null,
        continousWork: continousWork,
        timerLastUpdatedAt: Date.now(),
        autoStartTimers: true,
        alwaysStartFullWork: true,
        workMinutes: workMinutes,
        shortBreakMinutes: shortBreakMinutes,
        longBreakMinutes: longBreakMinutes,
        longBreakFreq: longBreakFreq,
        settingsVisible: false,
        calendarVisible: false,
        events: [],
        timerStartedAt: null,
        timerStartedWithSeconds: null,
        tasks: [],
        selectedTask: "",
        showHoldModal: false
      }
    );
  }
}

export default DefaultSettings;
