import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer } from '../../components/common';
import { register } from '../../api';

const RegisterPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const initEmptyUser = () => ({ email: '', password: '', name: '', role: 'client', cities: [] });
  const [user, setUser] = useState(initEmptyUser());

  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const isFormValid = useCallback(() => {
    const { email, password, name, role } = user;
    return /\w{1,}@\w{1,}\.\w{2,}/gi.test(email) && password;
  }, [user]);

  let abortController = null;

  const doRegister = async (email, password, abortController) => {
    setPending(true);
    setError(null);
    try {
      const response = await register(email, password, abortController);
      if (response?.data?.accessToken) {
        const { accessToken } = response.data;
        //setAccessToken(accessToken);
        enqueueSnackbar('Success', { variant: 'success' });
        //setRedirect(true);
      }
    } catch (e) {
      setError(e);
      enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
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
    doRegister({ ...user, abortController });
  };

  useEffect(() => {
    return () => {
      abortController?.abort();
      closeSnackbar();
    };
  }, [abortController, closeSnackbar]);

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
                Register
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

export default RegisterPage;
