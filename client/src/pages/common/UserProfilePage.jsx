import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Header } from '../../components';
import { useAuth } from '../../hooks';

const UserProfilePage = () => {
  const { user } = useAuth();

  return (
    <Container>
      <Header />
      {user && (
        <Container>
          <center>
            <h1>User Profile</h1>
          </center>
          <hr />
          <Row className="justify-content-md-center">
            <Col md="auto">
              <div>Email: {user.email}</div>
              <div>Password: {user.password}</div>
            </Col>
          </Row>
          <hr />
        </Container>
      )}
    </Container>
  );
};

export default UserProfilePage;
