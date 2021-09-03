import React from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

class UserSettings extends React.Component {
  onChangeWorkMinutes = (event) => {
    this.props.onchange({
      workMinutes: +event.target.value,
    });
  };

  onChangeShortBreakMinutes = (event) => {
    this.props.onchange({
      shortBreakMinutes: +event.target.value,
    });
  };

  onChangeLongBreakMinutes = (event) => {
    this.props.onchange({
      longBreakMinutes: +event.target.value,
    });
  };

  onChangeLongBreakFreq = (event) => {
    this.props.onchange({
      longBreakFreq: +event.target.value,
    });
  };

  render() {
    return (
      <Form>
        <Row>
          <Col sm={6}>
            <Form.Group as={Row}>
              <Form.Label column xs={8}>
                Work cycle minutes
              </Form.Label>
              <Col xs={4}>
                <Form.Control
                  type="number"
                  value={this.props.workMinutes}
                  onChange={this.onChangeWorkMinutes}
                />
              </Col>
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group as={Row}>
              <Form.Label column xs={8}>
                Short break minutes
              </Form.Label>
              <Col xs={4}>
                <Form.Control
                  type="number"
                  value={this.props.shortBreakMinutes}
                  onChange={this.onChangeShortBreakMinutes}
                />
              </Col>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <Form.Group as={Row}>
              <Form.Label column xs={8}>
                Long break minutes
              </Form.Label>
              <Col xs={4}>
                <Form.Control
                  type="number"
                  value={this.props.longBreakMinutes}
                  onChange={this.onChangeLongBreakMinutes}
                />
              </Col>
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group as={Row}>
              <Form.Label column xs={8}>
                Long break after n cycles
              </Form.Label>
              <Col xs={4}>
                <Form.Control
                  type="number"
                  value={this.props.longBreakFreq}
                  onChange={this.onChangeLongBreakFreq}
                />
              </Col>
            </Form.Group>
          </Col>
        </Row>
      </Form>
    );
  }
}

export default UserSettings;
