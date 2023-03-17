import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer } from '../../components/common';
import { getCities, register } from '../../api';
import { validateEmail, isGlobalError, getErrorText } from '../../utils';
import { USER_ROLES } from '../../constants';

const RegisterPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const navigate = useNavigate();

  const initEmptyUser = () => ({ email: '', password: '', name: '', role: USER_ROLES.CLIENT, isTosAccepted: false, cities: [] });
  const [user, setUser] = useState(initEmptyUser());
  const [cities, setCities] = useState([]);
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isPending, setPending] = useState(false);

  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);
  const isFormValid = useCallback(() => {
    const { email, password, name, role, isTosAccepted } = user;
    return validateEmail(email) && password && ((role === USER_ROLES.MASTER && name) || name.length >= 3) && isTosAccepted;
  }, [user]);

  const fetchInitialData = async (abortController) => {
    setInitialLoading(true);
    try {
      const response = await getCities({ abortController });
      if (response?.data?.cities) {
        const { cities } = response.data;
        setCities(cities);
      }
    } catch (e) {
      setError(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const doRegister = async (user) => {
    setPending(true);
    setError(null);
    try {
      const response = await register({ ...user });
      if ([200, 201, 204].includes(response?.status)) {
        enqueueSnackbar('Success', { variant: 'success' });
        setUser(initEmptyUser());
        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await delay(3000);
        navigate('/');
      }
    } catch (e) {
      if (isGlobalError(e) && e?.response?.status !== 400) return setError(e);
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
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
    doRegister({ ...user });
  };

  const onUserRoleChanged = (event, newRole) => setUser((prev) => ({ ...prev, role: newRole }));
  const onUserTosAcceptedChanged = (event) => setUser((prev) => ({ ...prev, isTosAccepted: event.target.checked }));
  const onUserCitySelect = (selectedList, selectedItem) => setUser((prev) => ({ ...prev, cities: selectedList }));
  const onUserCityRemove = (selectedList, removedItem) => setUser((prev) => ({ ...prev, cities: selectedList }));

  useEffect(() => {
    const abortController = new AbortController();
    fetchInitialData(abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [closeSnackbar]);

  return (
    <Container>
      <Header />
      <Container>
        <hr />

        {isInitialLoading ? (
          <center>
            <Spinner animation="grow" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? (
          <Row className="justify-content-md-center">
            <Col xs lg="4" md="auto">
              <h1>Registration page</h1>
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
                    value={user.password}
                    disabled={isPending}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Name"
                    onChange={onFormFieldChange}
                    value={user.name}
                    disabled={isPending}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  {Object.values(USER_ROLES)
                    .filter((item) => item !== USER_ROLES.ADMIN)
                    .sort()
                    .map((roleName) => (
                      <Form.Check
                        key={roleName}
                        type="radio"
                        name="role"
                        label={roleName}
                        checked={user.role === roleName}
                        inline
                        required
                        onChange={(event) => onUserRoleChanged(event, roleName)}
                        disabled={isPending}
                      />
                    ))}
                </Form.Group>

                {user.role === USER_ROLES.MASTER ? (
                  <Form.Group className="mb-3">
                    <Form.Label>Master cities:</Form.Label>
                    <Multiselect
                      onSelect={onUserCitySelect}
                      onRemove={onUserCityRemove}
                      options={cities}
                      selectedValues={user.cities}
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
                        checked={user.isTosAccepted}
                        onChange={onUserTosAcceptedChanged}
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
                      <Button variant="primary" type="submit" disabled={isPending || !isFormValid()}>
                        {isPending && <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                        Register
                      </Button>
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
