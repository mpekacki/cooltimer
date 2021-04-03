import React from 'react';
import { isToday, isYesterday, isThisWeek } from 'date-fns';
import Constants from './Constants';

class TaskTimes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            events: props.events
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.events && prevProps.events && this.props.events.length !== prevProps.events.length) {
            this.setState({
                events: this.props.events
            });
        }
    }

    formatSeconds = (seconds) => {
        seconds /= 1000;
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h${minutes}m`;
    }

    render() {
        const timesMap = {};
        this.state.events.forEach(event => {
            if (!event.isWork) {
                return;
            }
            let isForToday = isToday(event.start);;
            let isForYesterday = isYesterday(event.start);
            let isForThisWeek = isThisWeek(event.start);
            // TODO add test
            if (!isForToday && !isForYesterday && !isForThisWeek) {
                return;
            }
            let taskName = event.task;
            if (taskName === null || taskName === undefined || taskName === '' || taskName === 'null') {
                taskName = Constants.NO_TASK_TEXT;
            }
            if (!(taskName in timesMap)) {
                timesMap[taskName] = {
                    today: 0,
                    yesterday: 0,
                    week: 0
                };
            }
            if (event.end !== undefined) {
                let len = event.end.getTime() - event.start.getTime();
                if (isForToday) {
                    timesMap[taskName].today += len;
                } else if (isForYesterday) {
                    timesMap[taskName].yesterday += len;
                }
                if (isForThisWeek) {
                    timesMap[taskName].week += len;
                }
            }
        });
        return (
            <table class="table-sm">
                <thead>
                <tr>
                    <th>Task</th>
                    <th>Today</th>
                    <th>Yesterday</th>
                    <th>Week</th>
                </tr>
                </thead>
                <tbody>
                    {Object.entries(timesMap).map((entry) => (
                    <tr key={entry[0]}>
                        <td>{entry[0]}</td>
                        <td data-testid={'today-' + entry[0].charAt(0) + entry[0].length}>{this.formatSeconds(entry[1].today)}</td>
                        <td data-testid={'yesterday-' + entry[0].charAt(0) + entry[0].length}>{this.formatSeconds(entry[1].yesterday)}</td>
                        <td data-testid={'week-' + entry[0].charAt(0) + entry[0].length}>{this.formatSeconds(entry[1].week)}</td>
                    </tr>))}
                </tbody>
            </table>
        );
    }
}

export default TaskTimes;