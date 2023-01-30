import React, {Component} from 'react';
import AccountBalance from './AccountBalance';
import {Link} from 'react-router-dom';
//import {TextLinkExample } from './Navbar';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Header from './Header';
import AuthService from "../services/auth.service";

class Home extends Component {
  render() {
    return (
      <Container>
        <Header />
        <Container>
          <Row className="justify-content-md-center">
            <Col md="auto">
              <h1>Home page</h1>
            </Col>
          </Row>
        </Container>
      </Container>
    );
  }
}

export default Home;