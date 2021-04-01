import React from 'react';

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
            if (!event.isWork 
                // TODO: add test
                || !(event.start.getFullYear() === today.getFullYear() && event.start.getMonth() === today.getMonth() && event.start.getDate() === today.getDate() )) {
                return;
            }
            let taskName = event.task;
            if (taskName === null || taskName === undefined || taskName === '' || taskName === 'null') {
                taskName = '(no task)';
            }
            if (!(taskName in timesMap)) {
                timesMap[taskName] = 0;
            }
            if (event.end !== undefined) {
                timesMap[taskName] += event.end.getTime() - event.start.getTime();
            }
        });
        return (
            <table>
                <tr>
                    <th>Task</th>
                    <th>Today</th>
                </tr>
                {Object.entries(timesMap).map((entry) => (<tr><td>{entry[0]}</td><td>{this.formatSeconds(entry[1])}</td></tr>))}
            </table>
        );
    }
}

export default TaskTimes;