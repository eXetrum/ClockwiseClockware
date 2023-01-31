import React, {Component} from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Header from './Header';
import AuthService from "../services/auth.service";

class Home extends Component {
  constructor() {
    super();
    const user = AuthService.getCurrentUser();
    this.state = {
      user: {
        email: user?.email || '',
        password: user?.password || '',
      },
    };
  }

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