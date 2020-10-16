class Settings {
    constructor(workMinutes, shortBreakMinutes, longBreakMinutes, longBreakFreq, workDayMinutes) {
        this._workMinutes = workMinutes;
        this._shortBreakMinutes = shortBreakMinutes;
        this._longBreakMinutes = longBreakMinutes;
        this._longBreakFreq = longBreakFreq;
        this._workDayMinutes = workDayMinutes;
    }

    get workMinutes() {
        return this._workMinutes;
    }

    get shortBreakMinutes() {
        return this._shortBreakMinutes;
    }

    get longBreakMinutes() {
        return this._longBreakMinutes;
    }

    get longBreakFreq() {
        return this._longBreakFreq;
    }

    get workDayMinutes() {
        return this._workDayMinutes;
    }
}

export default Settings;