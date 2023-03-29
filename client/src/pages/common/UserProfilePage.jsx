import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Header } from '../../components';
import { useSelector } from 'react-redux';

const UserProfilePage = () => {
  const { authUser: auth } = useSelector(state => state.authReducer);

  return (
    <Container>
      <Header />
      {auth.user ? (
        <Container>
          <center>
            <h1>User Profile</h1>
          </center>
          <hr />
          <Row className="justify-content-md-center">
            <Col md="auto">
              <div>Email: {auth.user.email}</div>
              <div>Role: {auth.user.role}</div>
            </Col>
          </Row>
          <hr />
        </Container>
      ) : null}
    </Container>
  );
};

export default UserProfilePage;
