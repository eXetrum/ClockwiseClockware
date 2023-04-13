import React, { useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer, AdminCitiesList, CityForm } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCities, addCity } from '../../../store/thunks';
import { changeVisibilityAddCityForm } from '../../../store/actions';
import { selectNewCity, selectCityError, selectCityInitialLoading } from '../../../store/selectors';

import { isUnknownOrNoErrorType } from '../../../utils';

const AdminDashboardCitiesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const newCity = useSelector(selectNewCity);
  const error = useSelector(selectCityError);
  const isInitialLoading = useSelector(selectCityInitialLoading);

  useEffect(() => dispatch(fetchCities()), [dispatch]);

  const isComponentReady = useMemo(() => !isInitialLoading && isUnknownOrNoErrorType(error), [isInitialLoading, error]);

  const onFormSubmit = useCallback(
    async event => {
      event.preventDefault();
      const action = await dispatch(addCity(newCity));
      if (isFulfilled(action)) enqueueSnackbar(`City "${action.payload.name}" created`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newCity],
  );

  const onFormShow = useCallback(() => dispatch(changeVisibilityAddCityForm(true)), [dispatch]);

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Cities Dashboard</h1>
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
            <Row className="justify-content-md-center">
              <Col className="d-flex justify-content-center">
                <Link to="#">
                  <AddCircleOutlineOutlinedIcon onClick={onFormShow} />
                </Link>
              </Col>
            </Row>
            <hr />
            <AdminCitiesList />

            <CityForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New City'} isModal={true} />
          </>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminDashboardCitiesPage;
