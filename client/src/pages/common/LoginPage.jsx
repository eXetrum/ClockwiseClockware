import React, { useCallback, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer } from '../../components/common';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { loginAuth } from '../../store/thunks';
import { changeNewUserField } from '../../store/actions/AuthActions';

import { validateEmail, parseToken } from '../../utils';
import { USER_ROLES } from '../../constants';

const LoginPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const location = useLocation();
  const navigate = useNavigate();

  const { newUser, error, isPending } = useSelector(state => state.authReducer);

  const isFormValid = useMemo(() => validateEmail(newUser?.email) && newUser?.password, [newUser]);

  const onFormFieldChange = useCallback(({ target: { name, value } }) => dispatch(changeNewUserField({ name, value })), [dispatch]);

  const onFormSubmit = useCallback(
    async event => {
      event.preventDefault();
      const action = await dispatch(loginAuth(newUser));
      if (isFulfilled(action)) {
        const user = parseToken(action.payload);

        enqueueSnackbar('Success', { variant: 'success' });

        const fromPage = location.state?.from?.pathname || '/';
        if (user.role === USER_ROLES.MASTER) return navigate('/master/orders');
        else if (user.role === USER_ROLES.CLIENT && fromPage !== '/order') return navigate('/client/orders');

        // is order exists and client email/name differs
        const order = location?.state?.order;
        if (order && user && (order.client?.email !== user.email || order.client?.name !== user.name)) {
          const result = await confirm(
            'Authenticated user data is different from prepared order details. Do you want to replace with current user data ?',
            {
              title: 'User mismatch',
              okText: 'Update',
              cancelText: 'Do not update',
              okButtonStyle: 'success',
            },
          );
          if (result) return navigate(fromPage, { state: { ...location.state, email: user.email, name: user.name } });
        }

        return navigate(fromPage, { state: location.state });
      } else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
      }
    },
    [newUser, dispatch, enqueueSnackbar, location, navigate],
  );

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
                  value={newUser.email}
                  disabled={isPending}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={onFormFieldChange}
                  value={newUser.password}
                  disabled={isPending}
                />
              </Form.Group>

              <Form.Group>
                <Row>
                  <Col sm={4}>&nbsp;</Col>
                  <Col className="d-flex justify-content-md-end">
                    <Button variant="primary" type="submit" disabled={isPending || !isFormValid}>
                      {isPending && <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
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
