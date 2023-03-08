import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from '../../components/common/Header';
import Clock from '../../components/common/Clock';

const HomePage = () => {
  return (
    <Container>
      <Header />
      <Container>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <center>
              <h1>Welcome to Clockwise Clockware</h1>
            </center>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <Clock />
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default HomePage;
