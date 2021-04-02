import React from 'react';
import Constants from './Constants';

class TaskTimes extends React.Component {
    formatSeconds = (seconds) => {
        seconds /= 1000;
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        let secs = seconds % 60;
        return hours + 'h' + minutes + 'm' + secs + 's';
    }

    render() {
        const timesMap = {};
        const today = new Date(Date.now());
        this.props.events.forEach(event => {
            if (!event.isWork) {
                return;
            }
            let isForToday = event.start.getFullYear() === today.getFullYear() && event.start.getMonth() === today.getMonth() && event.start.getDate() === today.getDate();
            let isForYesterday = event.start.getFullYear() === today.getFullYear() && event.start.getMonth() === today.getMonth() && event.start.getDate() === today.getDate() - 1;
            // TODO add test
            if (!isForToday && !isForYesterday) {
                return;
            }
            let taskName = event.task;
            if (taskName === null || taskName === undefined || taskName === '' || taskName === 'null') {
                taskName = Constants.NO_TASK_TEXT;
            }
            if (!(taskName in timesMap)) {
                timesMap[taskName] = {
                    today: 0,
                    yesterday: 0
                };
            }
            if (event.end !== undefined) {
                let len = event.end.getTime() - event.start.getTime();
                if (isForToday) {
                    timesMap[taskName].today += len;
                } else if (isForYesterday) {
                    timesMap[taskName].yesterday += len;
                }
            }
        });
        return (
            <table>
                <thead>
                <tr>
                    <th>Task</th>
                    <th>Today</th>
                    <th>Yesterday</th>
                </tr>
                </thead>
                <tbody>
                    {Object.entries(timesMap).map((entry) => (
                    <tr key={entry[0]}>
                        <td>{entry[0]}</td>
                        <td data-testid={'today-' + entry[0].charAt(0) + entry[0].length}>{this.formatSeconds(entry[1].today)}</td>
                        <td data-testid={'yesterday-' + entry[0].charAt(0) + entry[0].length}>{this.formatSeconds(entry[1].yesterday)}</td>
                    </tr>))}
                </tbody>
            </table>
        );
    }
}

export default TaskTimes;