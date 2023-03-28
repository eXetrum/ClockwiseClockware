import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { Header, OrderForm, ErrorContainer } from '../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWatches, fetchCities, addOrder } from '../../store/thunks';
import { resetNewOrder } from '../../store/reducers/OrderSlice';

import { ERROR_TYPE } from '../../constants';

const OrderPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { error: errorWatches, watches, isInitialLoading: isInitialLoadingWatches } = useSelector(state => state.watchReducer);
  const { error: errorCities, cities, isInitialLoading: isInitialLoadingCities } = useSelector(state => state.cityReducer);

  const { newOrder } = useSelector(state => state.orderReducer);

  const error = errorWatches || errorCities;

  const [isOrderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    dispatch(fetchWatches());
    dispatch(fetchCities());
    dispatch(resetNewOrder(location?.state?.order));
  }, [dispatch, location]);

  const isInitialLoading = useMemo(
    () => isInitialLoadingWatches || isInitialLoadingCities,
    [isInitialLoadingWatches, isInitialLoadingCities],
  );
  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  const onFormSubmit = useCallback(
    async event => {
      event.preventDefault();

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
          enqueueSnackbar('Account created, check your email for credentials', { variant: 'success' });
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
    },
    [dispatch, enqueueSnackbar, newOrder, navigate, location],
  );

  const resetForm = useCallback(async () => {
    dispatch(resetNewOrder());
    setOrderPlaced(false);
  }, [dispatch]);

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
                    <Alert variant={'info'}>
                      <Container>
                        <h5 className="text-center mb-4">Thank you ! Order confirmation message was sent to your email. </h5>
                      </Container>
                    </Alert>
                  </Col>
                </Row>
                <hr />
                <Row className="justify-content-md-center">
                  <Col md="auto">
                    <Button variant="primary" onClick={() => resetForm()}>
                      Create new order
                    </Button>
                  </Col>
                </Row>
              </>
            ) : (
              <OrderForm {...{ watches, cities, onSubmit: onFormSubmit, isEditForm: false, successButtonText: 'Create' }} />
            )}
          </>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default OrderPage;
