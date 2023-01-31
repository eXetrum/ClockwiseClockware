import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Container from 'react-bootstrap/Container';
import Header from './Header';
import AuthService from "../services/auth.service";


class LogOut extends Component {
  constructor () {
    super();
    this.state = { redirect: false };
  }

  componentDidMount() {
    AuthService.logout();
    this.setState({ redirect: true });
  }

  render () {
    if (this.state.redirect) {
      return (<Redirect to="/"/>)
    }
    return (
      <Container>
        <Header />
        <p>Logout...</p>
      </Container>
    )
  }
}

export default LogOut;