import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Header from './Header';
import AuthService from "../services/auth.service";


class LogOut extends Component {
  constructor () {
    super()
    this.state = {
      user: {
        email: '',
        password: ''
      },
      error: '',
      redirect: false
    }
  }

  componentDidMount() {
    AuthService.logout();
    this.setState({redirect: true});
  }

  render () {
    if (this.state.redirect) {
      return (<Redirect to="/"/>)
    }
    return (
        <p>Logout...</p>
    )
  }
}

export default LogOut;