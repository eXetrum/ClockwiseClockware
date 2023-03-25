import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Form, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer, ClientOrdersList, StarRating, ModalForm } from '../../../components';
import { getOrders, patchOrderById } from '../../../api';
import { isGlobalError, getErrorText } from '../../../utils';
import { MAX_RATING_VALUE } from '../../../constants';

const ClientDashboardOrdersPage = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [orders, setOrders] = useState([]);
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPending, setPending] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(MAX_RATING_VALUE);

  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);

  const fetchInitialData = async (abortController) => {
    setInitialLoading(true);
    try {
      const response = await getOrders({ abortController });
      if (response?.data?.orders) {
        const { orders } = response.data;
        setOrders(orders);
      }
    } catch (e) {
      setError(e);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchInitialData(abortController);
    return () => {
      abortController.abort();
    };
  }, []);

  const onReview = async (id) => {
    setSelectedOrder(orders.find((item) => item.id === id));
    setShowRateForm(true);
  };

  const onFormHide = () => {
    setShowRateForm(false);
    setRating(MAX_RATING_VALUE);
  };

  const onFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const id = selectedOrder.id;
      setPending(true);
      await patchOrderById({
        id,
        status: orders.find((item) => item.id === id)?.status,
        rating,
      });
      const idx = orders.map((item) => item.id).indexOf(id);
      orders[idx].rating = rating;
      setOrders(orders);
      setShowRateForm(false);
    } catch (e) {
      if (isGlobalError(e) && e?.response?.status !== 400) return setError(e);
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };
  const onRatingChange = (value) => setRating(value);

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
            <Spinner animation="grow" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? <ClientOrdersList orders={orders} onReview={onReview} isPending={isPending} /> : null}
        <hr />

        <ModalForm
          size="sm"
          show={showRateForm}
          title={'Rate order'}
          okText={'Apply'}
          onHide={onFormHide}
          onSubmit={onFormSubmit}
          isFormValid={() => true}
          pending={isPending}
          formContent={
            <>
              <Form.Group className="justify-content-md-center">
                <Row md="auto" className="justify-content-md-center">
                  <StarRating
                    onRatingChange={onRatingChange}
                    onRatingReset={onRatingChange}
                    value={rating}
                    total={MAX_RATING_VALUE}
                    pending={isPending}
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
