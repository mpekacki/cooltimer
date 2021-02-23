import React from 'react';
import Constants from './Constants';

class SimpleTaskManager extends React.Component {
  handleTextInputChange = (event) => {
    this.setState({ taskInput: event.target.value });
  }

  handleSaveClick = () => {
    this.props.onTaskCreate(this.state.taskInput);
  }

  handleTaskSelected = (event) => {
    this.props.onTaskSelected(event.target.value);
  }

  render() {
    return (
      <div>
        <input type="text" onChange={this.handleTextInputChange} placeholder={Constants.CREATE_TASK_PLACEHOLDER_TEXT} />
        <button onClick={this.handleSaveClick}>{Constants.SAVE_NEW_TASK_BUTTON_TEXT}</button>
        {this.props && this.props.tasks && this.props.tasks.map(
          task => {
            return (
              <div>
                <input type="radio" id={task} name="task" value={task} onChange={this.handleTaskSelected}></input>
                <label htmlFor={task}>{task}</label>
              </div>
            )
          }
        )}
      </div>
    );
  }
}

export default SimpleTaskManager;