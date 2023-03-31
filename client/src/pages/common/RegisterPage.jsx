import React, { useEffect, useMemo, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import Multiselect from 'multiselect-react-dropdown';
import { useSnackbar } from 'notistack';
import { Header, SpinnerButton, ErrorContainer } from '../../components/common';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { registerAuth, fetchCities } from '../../store/thunks';
import { changeNewUserField } from '../../store/actions/authActions';

import { validateEmail, isUnknownOrNoErrorType } from '../../utils';
import { USER_ROLES, ACCESS_SCOPE } from '../../constants';
import { selectNewUser, selectUserPending, selectAllCities, selectCityError, selectCityInitialLoading } from '../../store/selectors';

const RegisterPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const newUser = useSelector(selectNewUser);
  const isPending = useSelector(selectUserPending);
  const cities = useSelector(selectAllCities);
  const error = useSelector(selectCityError);
  const isInitialLoading = useSelector(selectCityInitialLoading);

  useEffect(() => dispatch(fetchCities()), [dispatch]);

  const isComponentReady = useMemo(() => !isInitialLoading && isUnknownOrNoErrorType(error), [isInitialLoading, error]);
  const isFormValid = useMemo(() => {
    const { email, password, name, role, isTosAccepted, cities } = newUser;
    return (
      validateEmail(email) &&
      password &&
      ((role === USER_ROLES.MASTER && name) || name.length >= 3) &&
      isTosAccepted &&
      (role === USER_ROLES.CLIENT || cities.length > 0)
    );
  }, [newUser]);

  const onFormFieldChange = useCallback(
    ({ target: { type, name, value, checked } }) => {
      if (type === 'checkbox') value = checked;
      dispatch(changeNewUserField({ name, value }));
    },
    [dispatch],
  );

  const onFormSubmit = useCallback(
    async event => {
      event.preventDefault();
      const action = await dispatch(registerAuth(newUser));
      if (isFulfilled(action)) {
        enqueueSnackbar('Success', { variant: 'success' });
        navigate('/');
      } else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
      }
    },
    [newUser, dispatch, enqueueSnackbar, navigate],
  );

  const onFormFieldChangeCityList = useCallback(
    (selectedList, _) => dispatch(changeNewUserField({ name: 'cities', value: selectedList })),
    [dispatch],
  );

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Registration page</h1>
        </center>
        <hr />

        {isInitialLoading ? (
          <center>
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? (
          <Row className="justify-content-md-center">
            <Col xs lg="4" md="auto">
              <Form onSubmit={onFormSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    autoFocus
                    required
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
                    required
                    onChange={onFormFieldChange}
                    value={newUser.password}
                    disabled={isPending}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Name"
                    required
                    onChange={onFormFieldChange}
                    value={newUser.name}
                    disabled={isPending}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  {ACCESS_SCOPE.MasterOrClient.sort().map(roleName => (
                    <Form.Check
                      key={roleName}
                      type="radio"
                      name="role"
                      label={roleName}
                      checked={newUser.role === roleName}
                      value={roleName}
                      inline
                      required
                      onChange={onFormFieldChange}
                      disabled={isPending}
                    />
                  ))}
                </Form.Group>

                {newUser.role === USER_ROLES.MASTER ? (
                  <Form.Group className="mb-3">
                    <Form.Label>Master cities:</Form.Label>
                    <Multiselect
                      onSelect={onFormFieldChangeCityList}
                      onRemove={onFormFieldChangeCityList}
                      options={cities}
                      selectedValues={newUser.cities}
                      displayValue="name"
                      disable={isPending}
                    />
                  </Form.Group>
                ) : null}

                <Form.Group className="mb-3">
                  <Row>
                    <Col>
                      <Form.Check
                        type="checkbox"
                        name="isTosAccepted"
                        required
                        checked={newUser.isTosAccepted}
                        onChange={onFormFieldChange}
                        disabled={isPending}
                        label="accept everything"
                      />
                    </Col>
                    <Col></Col>
                  </Row>
                </Form.Group>

                <Form.Group>
                  <Row>
                    <Col sm={4}>&nbsp;</Col>
                    <Col className="d-flex justify-content-md-end">
                      <SpinnerButton
                        variant="primary"
                        type="submit"
                        disabled={isPending || !isFormValid}
                        loading={isPending}
                        text="Register"
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <hr />
                <Form.Group>
                  <Row className="justify-content-md-center">
                    <p className="text-center pt-1 m-0">Already have an account ?</p>
                    <NavLink className="text-center p-0 m-0 navbar-item" to="/login">
                      Log in
                    </NavLink>
                  </Row>
                </Form.Group>
              </Form>
            </Col>
          </Row>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default RegisterPage;
