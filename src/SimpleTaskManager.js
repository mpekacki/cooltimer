import React from 'react';
import Constants from './Constants';

class SimpleTaskManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskInput: '',
      selectedTask: props.selectedTask
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedTask !== prevProps.selectedTask) {
      this.setState({
        selectedTask: this.props.selectedTask
      });
    }
  }

  handleTextInputChange = (event) => {
    this.setState({ taskInput: event.target.value });
  }

  handleSaveClick = () => {
    this.props.onTaskCreate(this.state.taskInput);
  }

  handleTaskSelected = (event) => {
    let value = event.target.value;
    if (value === "") {
      value = null;
    }
    this.setState({
      selectedTask: value
    })
    this.props.onTaskSelected(value);
  }

  render() {
    return (
      <div>
        <input type="text" onChange={this.handleTextInputChange} placeholder={Constants.CREATE_TASK_PLACEHOLDER_TEXT} />
        <button onClick={this.handleSaveClick}>{Constants.SAVE_NEW_TASK_BUTTON_TEXT}</button>
        <div className="btn-group btn-group-toggle" data-toggle="buttons">
          <>
            <label className={'btn btn-secondary' + (this.state.selectedTask == null ? ' active' : '')} htmlFor="no-task">{Constants.NO_TASK_TEXT}
              <input type="radio" id="no-task" name="task" value="" autocomplete="off" onChange={this.handleTaskSelected} checked={this.state.selectedTask == null}></input>
            </label>
          </>
          {this.props && this.props.tasks && this.props.tasks.map(
            task => {
              return (
                <>
                  <label className={'btn btn-secondary' + (task === this.state.selectedTask ? ' active' : '')} htmlFor={task}>{task}
                    <input type="radio" id={task} name="task" value={task} autocomplete="off" onChange={this.handleTaskSelected} checked={task === this.state.selectedTask}></input>
                  </label>
                </>
              )
            }
          )}
        </div>
      </div>
    );
  }
}

export default SimpleTaskManager;