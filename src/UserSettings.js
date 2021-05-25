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
                <div className="d-flex flex-row form-group">
                    <label htmlFor="work-minutes" className="p-2 col-form-label">Work cycle minutes</label>
                    <div className="p-2">
                        <input className="form-control" type="number" value={this.props.workMinutes} onChange={this.onChangeWorkMinutes} id="work-minutes" />
                    </div>
                </div>
                <div className="d-flex flex-row form-group">
                    <label htmlFor="short-break-minutes" className="p-2 col-form-label">Short break minutes</label>
                    <div className="p-2">
                        <input className="form-control" type="number" value={this.props.shortBreakMinutes} onChange={this.onChangeShortBreakMinutes} id="short-break-minutes" />
                    </div>
                </div>
                <div className="d-flex flex-row form-group">
                    <label htmlFor="long-break-minutes" className="p-2 col-form-label">Long break minutes</label>
                    <div className="p-2">
                        <input className="form-control" type="number" value={this.props.longBreakMinutes} onChange={this.onChangeLongBreakMinutes} id="long-break-minutes" />
                    </div>
                </div>
                <div className="d-flex flex-row form-group">
                    <label htmlFor="long-break-freq" className="p-2 col-form-label">Long break after n cycles</label>
                    <div className="p-2">
                        <input className="form-control" type="number" value={this.props.longBreakFreq} onChange={this.onChangeLongBreakFreq} id="long-break-freq" />
                    </div>
                </div>
            </div>
        );
    }
}

export default UserSettings;