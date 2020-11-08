class Settings {
    constructor(workMinutes, shortBreakMinutes, longBreakMinutes, longBreakFreq) {
        this._workMinutes = workMinutes;
        this._shortBreakMinutes = shortBreakMinutes;
        this._longBreakMinutes = longBreakMinutes;
        this._longBreakFreq = longBreakFreq;
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
}

export default Settings;