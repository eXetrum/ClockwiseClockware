import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { Header, OrderForm, ErrorContainer } from '../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWatches, fetchCities, addOrder } from '../../store/thunks';
import { resetNewOrder } from '../../store/actions/orderActions';

import { ACCESS_SCOPE, ERROR_TYPE } from '../../constants';
import { formatDate, addHours, formatDecimal } from '../../utils';

const OrderPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { authUser: auth } = useSelector(state => state.authReducer);

  const { error: errorWatches, watches, isInitialLoading: isInitialLoadingWatches } = useSelector(state => state.watchReducer);
  const { error: errorCities, cities, isInitialLoading: isInitialLoadingCities } = useSelector(state => state.cityReducer);

  const { newOrder, isPending } = useSelector(state => state.orderReducer);

  const error = errorWatches || errorCities;

  const [isOrderPlaced, setOrderPlaced] = useState(false);
  const [isOrderSummary, setOrderSummary] = useState(false);

  const isClientAuth = useMemo(() => ACCESS_SCOPE.ClientOnly.includes(auth.user.role), [auth]);
  const isOrderExists = useMemo(() => location?.state?.order, [location]);

  const setUpOrder = useCallback(() => {
    if (isClientAuth && isOrderExists) {
      dispatch(resetNewOrder({ ...location?.state?.order, client: { name: auth.user.name, email: auth.user.email } }));
      delete location?.state?.order;
    } else if (isClientAuth) {
      dispatch(resetNewOrder({ client: { name: auth.user.name, email: auth.user.email } }));
    } else {
      dispatch(resetNewOrder(location?.state?.order));
    }
  }, [dispatch, location, auth, isClientAuth, isOrderExists]);

  useEffect(() => {
    dispatch(fetchWatches());
    dispatch(fetchCities());
    setUpOrder();
  }, [dispatch, setUpOrder]);

  const isInitialLoading = useMemo(
    () => isInitialLoadingWatches || isInitialLoadingCities,
    [isInitialLoadingWatches, isInitialLoadingCities],
  );
  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  const onSubmit = useCallback(async () => {
    const order = {
      client: newOrder.client,
      watchId: newOrder.watch.id,
      cityId: newOrder.city.id,
      masterId: newOrder.master.id,
      startDate: new Date(newOrder.startDate).getTime(),
      timezone: new Date(newOrder.startDate).getTimezoneOffset(),
    };

    const action = await dispatch(addOrder(order));
    if (isFulfilled(action)) {
      enqueueSnackbar('Order placed', { variant: 'success' });
      if (action.payload.autoRegistration) {
        enqueueSnackbar('Account was created! Check your email for credentials', { variant: 'success' });
      }
      setOrderPlaced(true);
    } else if (isRejected(action)) {
      if (action.payload.type === ERROR_TYPE.ACCESS_DENIED) {
        const result = await confirm(
          `User with specified email already exists. To continue you need to login with ${newOrder.client.email} first. Proceed ?`,
          {
            title: 'User already exists',
            okText: 'Yes',
            cancelText: 'No',
            okButtonStyle: 'success',
          },
        );
        if (result) navigate('/login', { state: { from: location, order: newOrder } });
      }
    } else {
      enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    }
  }, [dispatch, enqueueSnackbar, newOrder, navigate, location]);

  const onNext = useCallback(async event => {
    event.preventDefault();
    setOrderSummary(true);
  }, []);

  const onBack = useCallback(async event => {
    event.preventDefault();
    setOrderSummary(false);
  }, []);

  const onReset = useCallback(async () => {
    setUpOrder();
    setOrderSummary(false);
    setOrderPlaced(false);
  }, [setUpOrder]);

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Order page</h1>
        </center>
        <hr />

        {isInitialLoading ? (
          <center>
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? (
          <>
            {isOrderPlaced ? (
              <>
                <Row className="justify-content-md-center">
                  <Col md="auto">
                    <Alert variant="info">
                      <h5 className="text-center mb-4 p-1">
                        Thank you !<br />
                        Order confirmation message was sent to your email.
                      </h5>
                    </Alert>
                  </Col>
                </Row>

                <Row className="justify-content-md-center">
                  <Col md="auto">
                    <Button variant="primary" onClick={onReset}>
                      Create new order
                    </Button>
                  </Col>
                </Row>
              </>
            ) : (
              <>
                {isOrderSummary ? (
                  <>
                    <Row className="justify-content-md-center">
                      <center>
                        <h4>Order summary:</h4>
                      </center>
                      <Col xs lg="6">
                        <hr />
                        <Row>
                          <Col sm={4}>
                            <Form.Label>
                              <b>Client:</b>
                            </Form.Label>
                          </Col>
                          <Col className="d-flex justify-content-end">
                            {newOrder.client ? (
                              <>
                                {newOrder.client?.name}, {newOrder.client?.email}
                              </>
                            ) : null}
                          </Col>
                        </Row>

                        <hr />
                        <Row>
                          <Col sm={4}>
                            <Form.Label>
                              <b>Master:</b>
                            </Form.Label>
                          </Col>
                          <Col className="d-flex justify-content-end">
                            {newOrder.master ? (
                              <>
                                {newOrder.master?.name}, {newOrder.master?.email}
                              </>
                            ) : null}
                          </Col>
                        </Row>

                        <hr />
                        <Row>
                          <Col sm={4}>
                            <Form.Label>
                              <b>City:</b>
                            </Form.Label>
                          </Col>
                          <Col className="d-flex justify-content-end">{newOrder?.city?.name}</Col>
                        </Row>

                        <hr />
                        <Row>
                          <Col sm={4}>
                            <Form.Label>
                              <b>Watch type:</b>
                            </Form.Label>
                          </Col>
                          <Col className="d-flex justify-content-end">{newOrder?.watch?.name}</Col>
                        </Row>

                        <hr />
                        <Row>
                          <Col sm={4}>
                            <Form.Label>
                              <b>Start date:</b>
                            </Form.Label>
                          </Col>
                          <Col className="d-flex justify-content-end">{formatDate(newOrder?.startDate)}</Col>
                        </Row>

                        <hr />
                        <Row>
                          <Col sm={4}>
                            <Form.Label>
                              <b>End date:</b>
                            </Form.Label>
                          </Col>
                          <Col className="d-flex justify-content-end">
                            {formatDate(addHours(newOrder?.startDate, newOrder?.watch?.repairTime))}
                          </Col>
                        </Row>

                        <hr />
                        <Row>
                          <Col sm={4}>
                            <Form.Label>
                              <b>Total Cost:</b>
                            </Form.Label>
                          </Col>
                          <Col className="d-flex justify-content-end">{formatDecimal(newOrder?.city?.pricePerHour)}</Col>
                        </Row>

                        <hr />
                        <Row className="justify-content-center mt-4">
                          <Col className="d-flex justify-content-start">
                            <Button className="mb-3 col-sm-5" onClick={onBack} disabled={isPending}>
                              Edit
                            </Button>
                          </Col>
                          <Col className="d-flex justify-content-end">
                            <Button className="mb-3 col-sm-5" type="submit" onClick={onSubmit} variant="success" disabled={isPending}>
                              {isPending && (
                                <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                              )}
                              <span>Create</span>
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </>
                ) : (
                  <OrderForm {...{ watches, cities, onSubmit: onNext, onReset, isEditForm: isClientAuth, successButtonText: 'Next' }} />
                )}
              </>
            )}
          </>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default OrderPage;
