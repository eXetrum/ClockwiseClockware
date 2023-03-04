import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Header from './Header';
import { logout } from '../api/auth';

const LogOut = () => {
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    logout();
    setRedirect(true);
  }, []);

  if (redirect) return <Navigate to='/' />;

  return (
    <Container>
      <Header />
      <p>Logout...</p>
    </Container>
  );
};

export default LogOut;
