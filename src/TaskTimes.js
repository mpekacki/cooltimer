import React from "react";
import { isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import Constants from "./Constants";
import Table from "react-bootstrap/Table";

const TOTALS_KEY = "@@@TOTALS";

class TaskTimes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timesMap: this.calculateTimes(),
      sortBy: "name"
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.eventsTimestamp !== prevProps.eventsTimestamp) {
      this.setState({
        timesMap: this.calculateTimes(),
      });
    }
  }

  formatSeconds = (seconds) => {
    seconds /= 1000;
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h${minutes}m`;
  };

  calculateTimes() {
    const timesMap = {};
    let totalToday = 0,
      totalYesterday = 0,
      totalThisWeek = 0,
      totalThisMonth = 0;
    this.props.events.forEach((event) => {
      if (!event.isWork) {
        return;
      }
      let isForToday = isToday(event.start);
      let isForYesterday = isYesterday(event.start);
      let isForThisWeek = isThisWeek(event.start);
      let isForThisMonth = isThisMonth(event.start);
      if (!isForToday && !isForYesterday && !isForThisWeek && !isForThisMonth) {
        return;
      }
      let taskName = event.task;
      if (
        taskName === null ||
        taskName === undefined ||
        taskName === "" ||
        taskName === "null"
      ) {
        taskName = Constants.NO_TASK_TEXT;
      }
      if (!(taskName in timesMap)) {
        timesMap[taskName] = {
          today: 0,
          yesterday: 0,
          week: 0,
          month: 0,
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
        if (isForThisMonth) {
          timesMap[taskName].month += len;
          totalThisMonth += len;
        }
      }
    });
    Object.entries(timesMap).forEach((entry) => {
      entry[1].todayPercentage = this.getPercentage(entry[1].today, totalToday);
      entry[1].yesterdayPercentage = this.getPercentage(
        entry[1].yesterday,
        totalYesterday
      );
      entry[1].weekPercentage = this.getPercentage(
        entry[1].week,
        totalThisWeek
      );
      entry[1].monthPercentage = this.getPercentage(
        entry[1].month,
        totalThisMonth
      );
    });
    timesMap[TOTALS_KEY] = {
      today: totalToday,
      yesterday: totalYesterday,
      week: totalThisWeek,
      month: totalThisMonth,
    };
    return timesMap;
  }

  getPercentage(today, totalToday) {
    const percent = Math.round((today / totalToday) * 100);
    return !isNaN(percent) ? percent + "%" : "-";
  }

  sortBy = (period) => {
    this.setState({
      sortBy: period
    });
  }

  sortByName = () => {
    this.sortBy("name");
  }

  sortByToday = () => {
    this.sortBy("today");
  }

  sortByYesterday = () => {
    this.sortBy("yesterday");
  }

  sortByWeek = () => {
    this.sortBy("week");
  }

  sortByMonth = () => {
    this.sortBy("month");
  }

  render() {
    return (
      <Table size="sm" responsive>
        <thead>
          <tr>
            <th><button type="button" class="btn btn-light" onClick={this.sortByName}>Task {this.state.sortBy === "name" ? "↑" : ""}</button></th>
            <th><button type="button" class="btn btn-light" onClick={this.sortByToday}>Today {this.state.sortBy === "today" ? "↓" : ""}</button></th>
            <th>%</th>
            <th><button type="button" class="btn btn-light" onClick={this.sortByYesterday}>Yesterday {this.state.sortBy === "yesterday" ? "↓" : ""}</button></th>
            <th>%</th>
            <th><button type="button" class="btn btn-light" onClick={this.sortByWeek}>Week {this.state.sortBy === "week" ? "↓" : ""}</button></th>
            <th>%</th>
            <th><button type="button" class="btn btn-light" onClick={this.sortByMonth}>Month {this.state.sortBy === "month" ? "↓" : ""}</button></th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(this.state.timesMap).filter((entry) => entry[0] !== TOTALS_KEY).sort((a, b) => {
            if (a[0] === b[0]) {
              return 0;
            }
            if (this.state.sortBy === 'name') {
              return a[0] > b[0] ? 1 : -1;
            }
            if (this.state.sortBy === 'today') {
              return a[1].today > b[1].today ? -1 : 1;
            }
            if (this.state.sortBy === 'yesterday') {
              return a[1].yesterday > b[1].yesterday ? -1 : 1;
            }
            if (this.state.sortBy === 'week') {
              return a[1].week > b[1].week ? -1 : 1;
            }
            if (this.state.sortBy === 'month') {
              return a[1].month > b[1].month ? -1 : 1;
            }
            return 0;
          })
            .map((entry) => (
              <tr key={entry[0]}>
                <td>{entry[0]}</td>
                <td
                  data-testid={"today-" + entry[0].charAt(0) + entry[0].length}
                >
                  {this.formatSeconds(entry[1].today)}
                </td>
                <td
                  data-testid={"todayp-" + entry[0].charAt(0) + entry[0].length}
                >
                  {entry[1].todayPercentage}
                </td>
                <td
                  data-testid={
                    "yesterday-" + entry[0].charAt(0) + entry[0].length
                  }
                >
                  {this.formatSeconds(entry[1].yesterday)}
                </td>
                <td
                  data-testid={
                    "yesterdayp-" + entry[0].charAt(0) + entry[0].length
                  }
                >
                  {entry[1].yesterdayPercentage}
                </td>
                <td
                  data-testid={"week-" + entry[0].charAt(0) + entry[0].length}
                >
                  {this.formatSeconds(entry[1].week)}
                </td>
                <td
                  data-testid={"weekp-" + entry[0].charAt(0) + entry[0].length}
                >
                  {entry[1].weekPercentage}
                </td>
                <td
                  data-testid={"month-" + entry[0].charAt(0) + entry[0].length}
                >
                  {this.formatSeconds(entry[1].month)}
                </td>
                <td
                  data-testid={"monthp-" + entry[0].charAt(0) + entry[0].length}
                >
                  {entry[1].monthPercentage}
                </td>
              </tr>
            ))}
          <tr class="font-italic">
            <td>Total</td>
            <td data-testid={"today-total"}>
              {this.formatSeconds(this.state.timesMap[TOTALS_KEY].today)}
            </td>
            <td data-testid={"todayp-total"}>100%</td>
            <td data-testid={"yesterday-total"}>
              {this.formatSeconds(this.state.timesMap[TOTALS_KEY].yesterday)}
            </td>
            <td data-testid={"yesterdayp-total"}>100%</td>
            <td data-testid={"week-total"}>
              {this.formatSeconds(this.state.timesMap[TOTALS_KEY].week)}
            </td>
            <td data-testid={"weekp-total"}>100%</td>
            <td data-testid={"month-total"}>
              {this.formatSeconds(this.state.timesMap[TOTALS_KEY].month)}
            </td>
            <td data-testid={"monthp-total"}>100%</td>
          </tr>
        </tbody>
      </Table>
    );
  }
}

export default TaskTimes;
