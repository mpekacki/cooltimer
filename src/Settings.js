class Settings {
    constructor(workMinutes, shortBreakMinutes, longBreakMinutes, longBreakFreq, continousWork, defaultState) {
        this._workMinutes = workMinutes;
        this._shortBreakMinutes = shortBreakMinutes;
        this._longBreakMinutes = longBreakMinutes;
        this._longBreakFreq = longBreakFreq;
        this._continousWork = continousWork;
        this._defaultState = defaultState;
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

    get continousWork() {
        return this._continousWork;
    }

    get defaultState() {
        return this._defaultState;
    }
}

export default Settings;