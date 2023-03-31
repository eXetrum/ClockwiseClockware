import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { PuffLoader } from 'react-spinners';
import { Header } from '../../components/common';

import { useDispatch } from 'react-redux';
import { destroyAuth } from '../../store/actions/destroyAuthAction';

const LogOutPage = () => {
  const dispatch = useDispatch();

  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    dispatch(destroyAuth());
    setRedirect(true);
  }, [dispatch]);

  if (redirect) return <Navigate to="/" />;

  return (
    <Container>
      <Header />
      <center>
        <PuffLoader color="#36d7b7" />
      </center>
    </Container>
  );
};

export default LogOutPage;
