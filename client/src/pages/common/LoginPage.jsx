import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer } from '../../components/common';
import { isLoggedIn, login, setToken } from '../../api';

const LoginPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const location = useLocation();
  const fromPage = location.state?.from?.pathname || '/';

  const [user, setUser] = useState({ email: '', password: '' });
  const [pending, setPending] = useState(false);
  const [redirect, setRedirect] = useState(isLoggedIn());
  const [error, setError] = useState(null);

  const isFormValid = useCallback(() => /\w{1,}@\w{1,}\.\w{2,}/gi.test(user?.email) && user.password, [user]);

  let abortController = null;

  const doLogin = async (email, password, abortController) => {
    setPending(true);
    setError(null);
    try {
      const response = await login(email, password, abortController);
      if (response?.data?.accessToken) {
        const { accessToken } = response.data;
        setToken(accessToken);
        enqueueSnackbar('Success', { variant: 'success' });
        setRedirect(true);
      }
    } catch (e) {
      setError(e);
      if (e?.response?.data?.detail) {
        enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
      }
    } finally {
      setPending(false);
    }
  };

  const onFormFieldChange = (event) => {
    const inputField = event.target.name;
    const inputValue = event.target.value;
    setUser((prev) => ({ ...prev, [inputField]: inputValue }));
    setError(null);
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
    abortController = new AbortController();
    doLogin({ ...user, abortController });
  };

  useEffect(() => {
    return () => {
      abortController?.abort();
      closeSnackbar();
    };
  }, [abortController, closeSnackbar]);

  if (redirect) return <Navigate to={fromPage} />;

  return (
    <Container>
      <Header />
      <Container>
        <hr />
        <Row className="justify-content-md-center">
          <Col xs lg="4" md="auto">
            <h1>Login page</h1>
            <Form onSubmit={onFormSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  autoFocus
                  onChange={onFormFieldChange}
                  value={user.email}
                  disabled={pending}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={onFormFieldChange}
                  value={user.password}
                  disabled={pending}
                />
              </Form.Group>
              <Button variant="primary" type="submit" disabled={!isFormValid() || pending}>
                {pending && <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                Login
              </Button>
            </Form>
          </Col>
        </Row>

        <hr />
        <ErrorContainer error={error} />
      </Container>
    </Container>
  );
};

export default LoginPage;
