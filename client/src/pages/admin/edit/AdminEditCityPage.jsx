import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Header, ErrorContainer, CityForm } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCity, updateCity } from '../../../store/reducers/ActionCreators';
import { citySlice } from '../../../store/reducers';

import { ERROR_TYPE } from '../../../constants';

const AdminEditCityPage = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { clearNotification } = citySlice.actions;
  const { newCity, error, notification, isInitialLoading } = useSelector((state) => state.cityReducer);

  useEffect(() => {
    dispatch(fetchCity(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (notification.text && notification.variant) {
      enqueueSnackbar(notification.text, { variant: notification.variant });
      dispatch(clearNotification());
    }
  }, [notification, enqueueSnackbar, dispatch, clearNotification]);

  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  const onFormSubmit = (event) => {
    event.preventDefault();
    dispatch(updateCity(newCity));
  };

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Edit city</h1>
          <Link to={'/admin/cities'}>
            <ArrowLeftIcon />
            Back
          </Link>
        </center>
        <hr />

        {isInitialLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}

        <ErrorContainer error={error} />

        {isComponentReady ? <CityForm onSubmit={onFormSubmit} /> : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditCityPage;
