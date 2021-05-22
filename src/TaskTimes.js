import React from 'react';
import { isToday, isYesterday, isThisWeek } from 'date-fns';
import Constants from './Constants';

const TOTALS_KEY = '@@@TOTALS';

class TaskTimes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timesMap: this.calculateTimes()
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.eventsTimestamp !== prevProps.eventsTimestamp) {
            this.setState({
                timesMap: this.calculateTimes()
            });
        }
    }

    formatSeconds = (seconds) => {
        seconds /= 1000;
        let hours = Math.floor(seconds / 3600);
        let minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h${minutes}m`;
    }

    calculateTimes() {
        const timesMap = {};
        let totalToday = 0, totalYesterday = 0, totalThisWeek = 0;
        this.props.events.forEach(event => {
            if (!event.isWork) {
                return;
            }
            let isForToday = isToday(event.start);;
            let isForYesterday = isYesterday(event.start);
            let isForThisWeek = isThisWeek(event.start);
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
                    totalToday += len;
                } else if (isForYesterday) {
                    timesMap[taskName].yesterday += len;
                    totalYesterday += len;
                }
                if (isForThisWeek) {
                    timesMap[taskName].week += len;
                    totalThisWeek += len;
                }
            }
        });
        Object.entries(timesMap).forEach((entry) => {
            entry[1].todayPercentage = Math.round(entry[1].today / totalToday * 100) + '%';
            entry[1].yesterdayPercentage = Math.round(entry[1].yesterday / totalYesterday * 100) + '%';
            entry[1].weekPercentage = Math.round(entry[1].week / totalThisWeek * 100) + '%';
        });
        timesMap[TOTALS_KEY] = {
            today: totalToday,
            yesterday: totalYesterday,
            week: totalThisWeek
        }
        return timesMap;
    }

    render() {
        return (
            <table class="table-sm">
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Today</th>
                        <th>%</th>
                        <th>Yesterday</th>
                        <th>%</th>
                        <th>Week</th>
                        <th>%</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(this.state.timesMap).filter(entry => entry[0] !== TOTALS_KEY).map(entry => (
                        <tr key={entry[0]}>
                            <td>{entry[0]}</td>
                            <td data-testid={'today-' + entry[0].charAt(0) + entry[0].length}>{this.formatSeconds(entry[1].today)}</td>
                            <td data-testid={'todayp-' + entry[0].charAt(0) + entry[0].length}>{entry[1].todayPercentage}</td>
                            <td data-testid={'yesterday-' + entry[0].charAt(0) + entry[0].length}>{this.formatSeconds(entry[1].yesterday)}</td>
                            <td data-testid={'yesterdayp-' + entry[0].charAt(0) + entry[0].length}>{entry[1].yesterdayPercentage}</td>
                            <td data-testid={'week-' + entry[0].charAt(0) + entry[0].length}>{this.formatSeconds(entry[1].week)}</td>
                            <td data-testid={'weekp-' + entry[0].charAt(0) + entry[0].length}>{entry[1].weekPercentage}</td>
                        </tr>
                    ))}
                    <tr>
                        <td>Total</td>
                        <td data-testid={'today-total'}>{this.formatSeconds(this.state.timesMap[TOTALS_KEY].today)}</td>
                        <td data-testid={'todayp-total'}>100%</td>
                        <td data-testid={'yesterday-total'}>{this.formatSeconds(this.state.timesMap[TOTALS_KEY].yesterday)}</td>
                        <td data-testid={'yesterdayp-total'}>100%</td>
                        <td data-testid={'week-total'}>{this.formatSeconds(this.state.timesMap[TOTALS_KEY].week)}</td>
                        <td data-testid={'weekp-total'}>100%</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default TaskTimes;