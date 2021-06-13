import React from 'react';
import Constants from './Constants';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Button from 'react-bootstrap/Button';

class SimpleTaskManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskInput: '',
      selectedTask: props.selectedTask || '',
      visibleTasks: props.tasks,
      createButtonVisible: false
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.eventsTimestamp !== prevProps.eventsTimestamp || this.props.selectedTask !== prevProps.selectedTask || !!this.props.tasks !== !!prevProps.tasks || (this.props.tasks && prevProps.tasks && this.props.tasks.length !== prevProps.tasks.length)) {
      this.setState({
        selectedTask: this.props.selectedTask || '',
        visibleTasks: this.getVisibleTasks(this.state.taskInput)
      });
    }
  }

  handleTextInputChange = (event) => {
    const value = event.target.value;
    this.setState({
      taskInput: value,
      createButtonVisible: value && value.trim() !== '' && (!this.props.tasks || !this.props.tasks.some(task => task.toUpperCase() === value.toUpperCase())),
      visibleTasks: this.getVisibleTasks(value)
    });
  }

  handleSaveClick = () => {
    this.props.onTaskCreate(this.state.taskInput.trim());
    this.setState({
      taskInput: '',
      visibleTasks: this.getVisibleTasks(''),
      createButtonVisible: false
    });
  }

  handleTaskSelected = (value) => {
    if (value === "") {
      value = null;
    }
    this.props.onTaskSelected(value);
  }

  getVisibleTasks(searchText) {
    return this.props.tasks ? this.props.tasks.filter(x => x.toUpperCase().includes(searchText.toUpperCase())) : [];
  }

  handleRemoveClick = () => {
    if (window.confirm(Constants.REMOVE_TASK_CONFIRMATION_TEXT)) {
      this.props.onTaskRemoved(this.state.selectedTask);
    }
  }

  render() {
    return (
      <Container>
        <Row>
          <Col xs={9}>
            <Form inline className="mb-2">
              <Form.Group controlId="taskInput" className="mr-1">
                <Form.Control type="text" onChange={this.handleTextInputChange} placeholder={Constants.CREATE_TASK_PLACEHOLDER_TEXT} value={this.state.taskInput}></Form.Control>
              </Form.Group>
              {(this.state.createButtonVisible ?
                <Button type="primary" onClick={this.handleSaveClick}>
                  {Constants.SAVE_NEW_TASK_BUTTON_TEXT} "{this.state.taskInput}"
              </Button>
                : null)}
            </Form>
          </Col>
          {this.state.selectedTask &&
            <Col xs={2}>
              <Button variant="outline-danger" size="sm" onClick={this.handleRemoveClick} className="mr-1">{Constants.REMOVE_TASK_BUTTON_TEXT}</Button>
            </Col>
          }
        </Row>
        <Row>
          <Col>
            <ToggleButtonGroup type="radio" name="tasks" style={{ 'flexWrap': 'wrap' }} className="float-left" value={this.state.selectedTask} onChange={this.handleTaskSelected}>
              <ToggleButton id="radio-null" value="">
                {Constants.NO_TASK_TEXT}
              </ToggleButton>
              {this.state && this.state.visibleTasks && this.state.visibleTasks.map(
                task => {
                  return (
                    <ToggleButton id={'radio-' + task} value={task} data-testid={'button-' + task} key={task}>
                      {task}
                    </ToggleButton>
                  )
                }
              )}
            </ToggleButtonGroup>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default SimpleTaskManager;