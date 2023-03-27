import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Header, ErrorContainer, CityForm } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCity, updateCity } from '../../../store/reducers/ActionCreators';

import { ERROR_TYPE } from '../../../constants';

const AdminEditCityPage = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { newCity, error, isInitialLoading } = useSelector((state) => state.cityReducer);

  useEffect(() => dispatch(fetchCity(id)), [id, dispatch]);

  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  const onFormSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const action = await dispatch(updateCity(newCity));
      if (isFulfilled(action)) enqueueSnackbar('City updated', { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newCity],
  );

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

        {isInitialLoading ? (
          <center>
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? <CityForm onSubmit={onFormSubmit} /> : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditCityPage;
