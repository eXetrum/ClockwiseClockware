import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Form } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import { PuffLoader } from 'react-spinners';
import { Header, ErrorContainer, ClientOrdersList, StarRating, ModalForm } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, rateOrder } from '../../../store/thunks';
import { changeVisibilityRateForm, changeNewOrderField } from '../../../store/actions/orderActions';

import { ERROR_TYPE } from '../../../constants';

const ClientDashboardOrdersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { orders, newOrder, error, isInitialLoading, isPending, isShowRateForm } = useSelector(state => state.orderReducer);

  useEffect(() => dispatch(fetchOrders()), [dispatch]);

  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  const [orderId, setOrderId] = useState(null);

  const onReview = useCallback(
    async order => {
      setOrderId(order.id);
      dispatch(changeVisibilityRateForm(true));
    },
    [dispatch],
  );

  const onSubmit = useCallback(
    async event => {
      event.preventDefault();
      const rating = newOrder.rating;
      dispatch(changeVisibilityRateForm(false));
      const action = await dispatch(rateOrder({ id: orderId, rating }));
      setOrderId(null);

      if (isFulfilled(action)) enqueueSnackbar(`Order "${orderId}" rated with value=${newOrder.rating}`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, orderId, newOrder],
  );

  const onHide = useCallback(() => dispatch(changeVisibilityRateForm(false)), [dispatch]);

  const onRatingChange = useCallback(value => dispatch(changeNewOrderField({ name: 'rating', value })), [dispatch]);

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Client: Orders Dashboard</h1>
        </center>
        <hr />

        {isInitialLoading ? (
          <center>
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? <ClientOrdersList orders={orders} onReview={onReview} /> : null}
        <hr />

        <ModalForm
          size="sm"
          show={isShowRateForm}
          title={'Rate order'}
          okText={'Apply'}
          onHide={onHide}
          onSubmit={onSubmit}
          isFormValid={() => true}
          isPending={isPending}
          formContent={
            <>
              <Form.Group className="justify-content-md-center">
                <Row md="auto" className="justify-content-md-center">
                  <StarRating onRatingChange={onRatingChange} onRatingReset={onRatingChange} value={newOrder.rating} readonly={isPending} />
                </Row>
              </Form.Group>
            </>
          }
        />
      </Container>
    </Container>
  );
};

export default ClientDashboardOrdersPage;
