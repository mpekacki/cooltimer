import React from 'react';

class UserSettings extends React.Component {
    onChangeWorkMinutes = (event) => {
        this.props.onchange({
            workMinutes: event.target.value
        });
    }

    onChangeShortBreakMinutes = (event) => {
        this.props.onchange({
            shortBreakMinutes: event.target.value
        });
    }

    onChangeLongBreakMinutes = (event) => {
        this.props.onchange({
            longBreakMinutes: event.target.value
        });
    }

    onChangeLongBreakFreq = (event) => {
        this.props.onchange({
            longBreakFreq: event.target.value
        });
    }

    render() {
        return (
            <div>
                <div class="d-flex flex-row form-group">
                    <label htmlFor="work-minutes" class="p-2 col-form-label">Work cycle minutes</label>
                    <div class="p-2">
                        <input class="form-control" type="number" value={this.props.workMinutes} onChange={this.onChangeWorkMinutes} id="work-minutes" />
                    </div>
                </div>
                <div class="d-flex flex-row form-group">
                    <label htmlFor="short-break-minutes" class="p-2 col-form-label">Short break minutes</label>
                    <div class="p-2">
                        <input class="form-control" type="number" value={this.props.shortBreakMinutes} onChange={this.onChangeShortBreakMinutes} id="short-break-minutes" />
                    </div>
                </div>
                <div class="d-flex flex-row form-group">
                    <label htmlFor="long-break-minutes" class="p-2 col-form-label">Long break minutes</label>
                    <div class="p-2">
                        <input class="form-control" type="number" value={this.props.longBreakMinutes} onChange={this.onChangeLongBreakMinutes} id="long-break-minutes" />
                    </div>
                </div>
                <div class="d-flex flex-row form-group">
                    <label htmlFor="long-break-freq" class="p-2 col-form-label">Long break after n cycles</label>
                    <div class="p-2">
                        <input class="form-control" type="number" value={this.props.longBreakFreq} onChange={this.onChangeLongBreakFreq} id="long-break-freq" />
                    </div>
                </div>
            </div>
        );
    }
}

export default UserSettings;