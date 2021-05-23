import React from 'react';
import Constants from './Constants';

class SimpleTaskManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskInput: '',
      selectedTask: props.selectedTask,
      visibleTasks: props.tasks,
      createButtonVisible: true
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.selectedTask !== prevProps.selectedTask || !!this.props.tasks !== !!prevProps.tasks || (this.props.tasks && prevProps.tasks && this.props.tasks.length !== prevProps.tasks.length)) {
      this.setState({
        selectedTask: this.props.selectedTask,
        visibleTasks: this.getVisibleTasks(this.state.taskInput)
      });
    }
  }

  handleTextInputChange = (event) => {
    this.setState({
      taskInput: event.target.value,
      createButtonVisible: !this.props.tasks || !this.props.tasks.includes(event.target.value),
      visibleTasks: this.getVisibleTasks(event.target.value)
    });
  }

  handleSaveClick = () => {
    this.props.onTaskCreate(this.state.taskInput);
    this.setState({
      taskInput: '',
      visibleTasks: this.getVisibleTasks('')
    });
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

  getVisibleTasks(searchText) {
    return this.props.tasks ? this.props.tasks.filter(x => x.toUpperCase().includes(searchText.toUpperCase())) : [];
  }

  render() {
    return (
      <div>
        <div class="form-inline">
          <input type="text" class="form-control" onChange={this.handleTextInputChange} placeholder={Constants.CREATE_TASK_PLACEHOLDER_TEXT} value={this.state.taskInput} />
          {(this.state.createButtonVisible ? <button class="btn btn-primary" onClick={this.handleSaveClick}>{Constants.SAVE_NEW_TASK_BUTTON_TEXT}</button> : null)}
        </div>
        <div className="btn-group btn-group-toggle" data-toggle="buttons" style={{ 'flex-wrap': 'wrap' }}>
          <>
            <label className={'btn btn-secondary' + (this.state.selectedTask == null ? ' active' : '')} htmlFor="no-task">{Constants.NO_TASK_TEXT}
              <input type="radio" id="no-task" name="task" value="" autocomplete="off" onChange={this.handleTaskSelected} checked={this.state.selectedTask == null}></input>
            </label>
          </>
          {this.state && this.state.visibleTasks && this.state.visibleTasks.map(
            task => {
              return (
                <>
                  <label className={'btn btn-secondary' + (task === this.state.selectedTask ? ' active' : '')} htmlFor={task} data-testid={'button-' + task}>{task}
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