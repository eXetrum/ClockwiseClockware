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
import { resetNewOrder } from '../../../store/actions';
import {
  selectAllWatches,
  selectAllCities,
  selectNewOrder,
  selectWatchError,
  selectCityError,
  selectOrderError,
  selectWatchInitialLoading,
  selectCityInitialLoading,
  selectOrderInitialLoading,
} from '../../../store/selectors';

import { isUnknownOrNoErrorType } from '../../../utils';

const AdminEditOrderPage = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const watches = useSelector(selectAllWatches);
  const cities = useSelector(selectAllCities);
  const newOrder = useSelector(selectNewOrder);

  const errorWatch = useSelector(selectWatchError);
  const errorCity = useSelector(selectCityError);
  const errorOrder = useSelector(selectOrderError);

  const isInitialLoadingWatches = useSelector(selectWatchInitialLoading);
  const isInitialLoadingCities = useSelector(selectCityInitialLoading);
  const isInitialLoadingOrder = useSelector(selectOrderInitialLoading);

  const error = !isUnknownOrNoErrorType(errorWatch) ? errorWatch : !isUnknownOrNoErrorType(errorCity) ? errorCity : errorOrder;
  console.log(newOrder);
  useEffect(() => {
    dispatch(fetchWatches());
    dispatch(fetchCities());
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  const isInitialLoading = useMemo(
    () => isInitialLoadingWatches || isInitialLoadingCities || isInitialLoadingOrder,
    [isInitialLoadingWatches, isInitialLoadingCities, isInitialLoadingOrder],
  );
  const isComponentReady = useMemo(() => !isInitialLoading && isUnknownOrNoErrorType(error), [isInitialLoading, error]);

  const onSubmit = useCallback(
    async event => {
      event.preventDefault();

      const order = {
        watchId: newOrder?.watch?.id,
        cityId: newOrder?.city.id,
        masterId: newOrder?.master.id,
        startDate: newOrder?.startDate,
        images: newOrder?.images,
      };

      const action = await dispatch(updateOrder(order));
      if (isFulfilled(action)) enqueueSnackbar('Order updated', { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newOrder],
  );

  const onReset = useCallback(
    async event => {
      dispatch(resetNewOrder());
    },
    [dispatch],
  );

  return (
    <Container fluid>
      <Header />
      <>
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

        {isComponentReady ? <OrderForm {...{ watches, cities, onSubmit, onReset }} /> : null}
        <hr />
      </>
    </Container>
  );
};

export default AdminEditOrderPage;
