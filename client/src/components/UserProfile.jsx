import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './Header';
import { getCurrentUser } from '../api/auth';

const UserProfile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = getCurrentUser();
    setUser(user);
  }, []);

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

export default UserProfile;
