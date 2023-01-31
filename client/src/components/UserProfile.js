import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Header from './Header';
import AuthService from "../services/auth.service";


class UserProfile extends Component {
  constructor() {
    super();
    this.state = {
      user: AuthService.getCurrentUser(),
    };
  }

  render() {
    const { user } = this.state;
    const isLoggedIn = user != null;
    if(!isLoggedIn) { return (<Redirect to="/"/>); }

    return (
        <Container>
          <Header />
          <Container>
            <Row className="justify-content-md-center">
              <Col md="auto">
                <h1>User Profile</h1>
                <div>Email: {user.email}</div>
                <div>Password: {user.password}</div>
              </Col>
            </Row>
          </Container>
        </Container>
    );
  }
}

export default UserProfile;