import React, { Component } from 'react'
import { Navigate } from 'react-router-dom'
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Header from './Header';
import AuthService from "../services/auth.service";


class LogIn extends Component {
  constructor () {
    super()
    this.state = {
      user: {
        email: '',
        password: ''
      },
      error: '',
      redirect: AuthService.getCurrentUser() != null,
    }
  }

  handleChange = (e) => {
    const updatedUser = {...this.state.user}
    const inputField = e.target.name
    const inputValue = e.target.value
    updatedUser[inputField] = inputValue

    this.setState({user: updatedUser})
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const { user } = this.state;
    this.setState({error: ''});

    AuthService.login(user.email, user.password)
    .then(response => {
      console.log('handleSubmit=>Success(then): ', response);
      if (response.data.accessToken) {
        localStorage.setItem("user", response.data.accessToken);
        this.setState({redirect: true});
      }
    },
    error => {
      console.log('handleSubmit=>Failure(error): ', error);
      if(error && error.response && error.response.status === 401) {
        this.setState({error: 'Incorrect login/password'});
      } else {
        // TODO
        this.setState({error: error?.message || 'unknown error'});
      }
    });
  }

  render () {
    if (this.state.redirect) {
      return (<Navigate to="/"/>)
    }
    const error = this.state.error;

    return (
      <Container>
        <Header />
        <Container>
          <Row className="justify-content-md-center">
            <Col xs lg="4" md="auto">
              <h1>Login page</h1>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" 
                    name="email"
                    onChange={this.handleChange} 
                    value={this.state.user.email}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" placeholder="Password" 
                    name="password"
                    onChange={this.handleChange} 
                    value={this.state.user.password}
                  />
                </Form.Group>
                <Button variant="primary" type="submit">
                  Login
                </Button>                
              </Form>
              {error}
            </Col>
          </Row>
        </Container>
      </Container>
    )
  }
}

export default LogIn;