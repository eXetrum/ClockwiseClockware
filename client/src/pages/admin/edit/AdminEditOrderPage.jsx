import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Header, ErrorContainer, OrderForm } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWatches, fetchCities, fetchOrder, updateOrder } from '../../../store/thunks';

import { ERROR_TYPE } from '../../../constants';

const AdminEditOrderPage = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { error: errorWatches, watches, isInitialLoading: isInitialLoadingWatches } = useSelector(state => state.watchReducer);
  const { error: errorCities, cities, isInitialLoading: isInitialLoadingCities } = useSelector(state => state.cityReducer);

  const { error: errorOrder, newOrder, isInitialLoading: isInitialLoadingOrder } = useSelector(state => state.orderReducer);

  const isWeakError = useCallback(error => error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN, []);

  const error = !isWeakError(errorWatches) ? errorWatches : !isWeakError(errorCities) ? errorCities : errorOrder;

  useEffect(() => {
    dispatch(fetchWatches());
    dispatch(fetchCities());
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  const isInitialLoading = useMemo(
    () => isInitialLoadingWatches || isInitialLoadingCities || isInitialLoadingOrder,
    [isInitialLoadingWatches, isInitialLoadingCities, isInitialLoadingOrder],
  );
  const isComponentReady = useMemo(() => !isInitialLoading && isWeakError(error), [isInitialLoading, error, isWeakError]);

  const onSubmit = useCallback(
    async event => {
      event.preventDefault();
      const action = await dispatch(updateOrder(newOrder));
      if (isFulfilled(action)) enqueueSnackbar('Order updated', { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newOrder],
  );

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Edit order</h1>
          <Link to={'/admin/orders'}>
            <ArrowLeftIcon />
            Back
          </Link>
        </center>
        <hr />

        {isInitialLoading ? (
          <center>
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? <OrderForm {...{ watches, cities, onSubmit }} /> : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditOrderPage;
