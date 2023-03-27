import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Form } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer, ClientOrdersList, StarRating, ModalForm } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, rateOrder } from '../../../store/reducers/ActionCreators';
import { changeVisibilityRateForm, changeNewOrderField } from '../../../store/OrderSlice';
changeVisibilityRateForm, changeNewOrderField, resetNewOrder

import { ERROR_TYPE } from '../../../constants';

const ClientDashboardOrdersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { ,  } = orderSlice.actions;
  const { orders, newOrder, error, isInitialLoading, isPending, isShowRateForm } = useSelector((state) => state.orderReducer);

  useEffect(() => dispatch(fetchOrders()), [dispatch]);

  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  const [orderId, setOrderId] = useState(null);

  const onReview = async (id) => {
    setOrderId(id);
    dispatch(changeVisibilityRateForm(true));
  };

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
          onHide={() => dispatch(changeVisibilityRateForm(false))}
          onSubmit={(event) => {
            event.preventDefault();
            dispatch(rateOrder({ id: orderId, rating: newOrder.rating }));
          }}
          isFormValid={() => true}
          isPending={isPending}
          formContent={
            <>
              <Form.Group className="justify-content-md-center">
                <Row md="auto" className="justify-content-md-center">
                  <StarRating
                    onRatingChange={(value) => dispatch(changeNewOrderField({ name: 'rating', value }))}
                    onRatingReset={(value) => dispatch(changeNewOrderField({ name: 'rating', value }))}
                    value={newOrder.rating}
                    readonly={isPending}
                  />
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
