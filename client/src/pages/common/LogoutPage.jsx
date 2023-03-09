import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { Header } from '../../components/common';
import { useAuth } from '../../hooks';

const LogOutPage = () => {
  const [redirect, setRedirect] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    setRedirect(true);
  }, [logout]);

  if (redirect) return <Navigate to="/" />;

  return (
    <Container>
      <Header />
      <p>Logout...</p>
    </Container>
  );
};

export default LogOutPage;
