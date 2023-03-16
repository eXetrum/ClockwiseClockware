import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Navigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer } from '../../components/common';
import { validateEmail, getErrorText } from '../../utils';
import { login } from '../../api';
import { useAuth } from '../../hooks';

const LoginPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const location = useLocation();
  const fromPage = location.state?.from?.pathname || '/';

  const initEmptyUser = () => ({ email: '', password: '' });
  const [formUser, setFormUser] = useState(initEmptyUser());

  const { setAccessToken } = useAuth();

  const [pending, setPending] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState(null);

  const isFormValid = useCallback(() => validateEmail(formUser?.email) && formUser?.password, [formUser]);

  let abortController = null;

  const doLogin = async (email, password, abortController) => {
    setPending(true);
    setError(null);
    try {
      const response = await login(email, password, abortController);
      if (response?.data?.accessToken) {
        const { accessToken } = response.data;
        setAccessToken(accessToken);
        enqueueSnackbar('Success', { variant: 'success' });
        setRedirect(true);
      }
    } catch (e) {
      setError(e);
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  const onFormFieldChange = (event) => {
    const inputField = event.target.name;
    const inputValue = event.target.value;
    setFormUser((prev) => ({ ...prev, [inputField]: inputValue }));
    setError(null);
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
    abortController = new AbortController();
    doLogin({ ...formUser, abortController });
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
                  value={formUser.email}
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
                  value={formUser.password}
                  disabled={pending}
                />
              </Form.Group>

              <Form.Group>
                <Row>
                  <Col sm={4}>&nbsp;</Col>
                  <Col className="d-flex justify-content-md-end">
                    <Button variant="primary" type="submit" disabled={!isFormValid() || pending}>
                      {pending && <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                      Login
                    </Button>
                  </Col>
                </Row>
              </Form.Group>

              <hr />
              <Form.Group>
                <Row className="justify-content-md-center">
                  <p className="text-center pt-1 m-0">Dont have an account ?</p>
                  <NavLink className="text-center p-0 m-0 navbar-item" to="/register">
                    Register
                  </NavLink>
                </Row>
              </Form.Group>
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
