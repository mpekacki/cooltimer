import React from "react";
import Constants from "./Constants";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Button from "react-bootstrap/Button";
import { InputGroup } from "react-bootstrap";

class SimpleTaskManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskInput: "",
      showMore: false,
    };
  }

  handleTextInputChange = (event) => {
    const value = event.target.value;
    this.setState({
      taskInput: value,
    });
  };

  handleSaveClick = () => {
    this.props.onTaskCreate(this.state.taskInput.trim());
    this.setState({
      taskInput: "",
    });
  };

  handleTaskSelected = (value) => {
    this.props.onTaskSelected(value);
  };

  getVisibleTasks() {
    let visibleTasks = this.props.tasks
      ? this.props.tasks.filter((x) =>
          x.toUpperCase().includes(this.state.taskInput.toUpperCase())
        )
      : [];
    if (this.props.totalMaxVisibleCharacters) {
      let trimmed = [];
      visibleTasks.reduce((totalCharacters, task) => {
        if (totalCharacters < this.props.totalMaxVisibleCharacters) {
          trimmed.push(task);
        }
        return totalCharacters + task.length;
      }, 0);
      return trimmed;
    } else {
      return visibleTasks;
    }
  }

  createButtonVisible = () => {
    return (
      this.state.taskInput &&
      this.state.taskInput.trim() !== "" &&
      (!this.props.tasks ||
        !this.props.tasks.some(
          (task) => task.toUpperCase() === this.state.taskInput.toUpperCase()
        ))
    );
  };

  handleRemoveClick = () => {
    if (
      window.confirm(
        Constants.getRemoveTaskConfirmationText(this.props.selectedTask)
      )
    ) {
      this.props.onTaskRemoved(this.props.selectedTask);
    }
  };

  handleMoreTasksToggleClick = () => {
    this.setState({
      showMore: !this.state.showMore,
    });
  };

  handleClearInputButtonClick = () => {
    this.setState({
      taskInput: "",
    });
  };

  render() {
    let numberOfTrimmedTasks = 0;
    let visibleTasks = this.props.tasks
      ? this.props.tasks.filter((x) =>
          x.toUpperCase().includes(this.state.taskInput.toUpperCase())
        )
      : [];
    if (this.props.totalMaxVisibleCharacters) {
      let trimmed = [];
      visibleTasks.reduce((totalCharacters, task) => {
        if (totalCharacters < this.props.totalMaxVisibleCharacters) {
          trimmed.push(task);
        }
        return totalCharacters + task.length;
      }, 0);
      numberOfTrimmedTasks = visibleTasks.length - trimmed.length;
      if (!this.state.showMore) {
        visibleTasks = trimmed;
      }
    }
    let moreTasksLabel = this.state.showMore
      ? "show less tasks"
      : "show " + numberOfTrimmedTasks + " more tasks";
    return (
      <Container>
        <Row className="mb-2">
          <Col xs={9}>
            <Form inline>
              <Form.Group controlId="taskInput" className="mr-1">
                <InputGroup>
                  <Form.Control
                    type="text"
                    onChange={this.handleTextInputChange}
                    placeholder={Constants.CREATE_TASK_PLACEHOLDER_TEXT}
                    value={this.state.taskInput}
                  ></Form.Control>
                  {this.state.taskInput !== "" && (
                    <InputGroup.Append>
                      <Button
                        as="span"
                        onClick={this.handleClearInputButtonClick}
                        variant="light"
                        data-testid="clear-input-btn"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="24"
                          viewBox="0 0 24 24"
                          width="24"
                        >
                          <path d="M0 0h24v24H0z" fill="none" />
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      </Button>
                    </InputGroup.Append>
                  )}
                </InputGroup>
                {numberOfTrimmedTasks > 0 && this.state.showMore && (
                  <Button
                    variant="light"
                    className="float-left ml-3"
                    data-testid="more-tasks-btn"
                    onClick={this.handleMoreTasksToggleClick}
                  >
                    {moreTasksLabel}
                  </Button>
                )}
              </Form.Group>
            </Form>
          </Col>
          {this.props.selectedTask && (
            <Col xs={3}>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={this.handleRemoveClick}
                className="float-right"
              >
                {Constants.REMOVE_TASK_BUTTON_TEXT}
              </Button>
            </Col>
          )}
        </Row>
        {this.createButtonVisible() ? (
          <Row>
            <Col>
              <Button
                type="primary"
                onClick={this.handleSaveClick}
                className="float-left"
              >
                {Constants.SAVE_NEW_TASK_BUTTON_TEXT} "{this.state.taskInput}"
              </Button>
            </Col>
          </Row>
        ) : null}
        <Row>
          <Col>
            <ToggleButtonGroup
              type="radio"
              name="tasks"
              style={{ flexWrap: "wrap" }}
              className="float-left"
              value={this.props.selectedTask}
              onChange={this.handleTaskSelected}
            >
              <ToggleButton id="radio-null" value="">
                {Constants.NO_TASK_TEXT}
              </ToggleButton>
              {visibleTasks.map((task) => {
                return (
                  <ToggleButton
                    id={"radio-" + task}
                    value={task}
                    data-testid={"button-" + task}
                    key={task}
                  >
                    {task}
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
            {numberOfTrimmedTasks > 0 && (
              <Button
                variant="light"
                className="float-left"
                data-testid="more-tasks-btn"
                onClick={this.handleMoreTasksToggleClick}
              >
                {moreTasksLabel}
              </Button>
            )}
          </Col>
        </Row>
      </Container>
    );
  }
}

export default SimpleTaskManager;
