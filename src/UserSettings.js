import React from 'react';

class UserSettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            workMinutes: props.workMinutes,
            shortBreakMinutes: props.shortBreakMinutes,
            longBreakMinutes: props.longBreakMinutes,
            longBreakFreq: props.longBreakFreq
        }
        this.onchange = props.onchange;
    }

    componentWillReceiveProps = (props) => {
        this.setState(props);
    }

    onChangeWorkMinutes = (event) => {
        this.onchange({
            workMinutes: event.target.value
        });
    }

    onChangeShortBreakMinutes = (event) => {
        this.onchange({
            shortBreakMinutes: event.target.value
        });
    }

    onChangeLongBreakMinutes = (event) => {
        this.onchange({
            longBreakMinutes: event.target.value
        });
    }

    onChangeLongBreakFreq = (event) => {
        this.onchange({
            longBreakFreq: event.target.value
        });
    }

    render() {
        return (
            <div>
                <div class="d-flex flex-row form-group">
                    <label htmlFor="work-minutes" class="p-2 col-form-label">Work cycle minutes</label>
                    <div class="p-2">
                        <input class="form-control" type="number" value={this.state.workMinutes} onChange={this.onChangeWorkMinutes} id="work-minutes" />
                    </div>
                </div>
                <div class="d-flex flex-row form-group">
                    <label htmlFor="short-break-minutes" class="p-2 col-form-label">Short break minutes</label>
                    <div class="p-2">
                        <input class="form-control" type="number" value={this.state.shortBreakMinutes} onChange={this.onChangeShortBreakMinutes} id="short-break-minutes" />
                    </div>
                </div>
                <div class="d-flex flex-row form-group">
                    <label htmlFor="long-break-minutes" class="p-2 col-form-label">Long break minutes</label>
                    <div class="p-2">
                        <input class="form-control" type="number" value={this.state.longBreakMinutes} onChange={this.onChangeLongBreakMinutes} id="long-break-minutes" />
                    </div>
                </div>
                <div class="d-flex flex-row form-group">
                    <label htmlFor="long-break-freq" class="p-2 col-form-label">Long break after n cycles</label>
                    <div class="p-2">
                        <input class="form-control" type="number" value={this.state.longBreakFreq} onChange={this.onChangeLongBreakFreq} id="long-break-freq" />
                    </div>
                </div>
            </div>
        );
    }
}

export default UserSettings;