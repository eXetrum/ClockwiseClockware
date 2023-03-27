import React, { useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer, AdminCitiesList, CityForm } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCities, addCity } from '../../../store/reducers/ActionCreators';
import { changeVisibilityAddForm } from '../../../store/reducers/CitySlice';

import { ERROR_TYPE } from '../../../constants';

const AdminDashboardCitiesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { cities, newCity, error, isInitialLoading } = useSelector((state) => state.cityReducer);

  useEffect(() => dispatch(fetchCities()), [dispatch]);

  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  const onFormSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const action = await dispatch(addCity(newCity));
      if (isFulfilled(action)) enqueueSnackbar(`City "${action.payload.name}" created`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newCity],
  );

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
              <Col md="auto">
                <Link to="#">
                  <AddCircleOutlineOutlinedIcon onClick={() => dispatch(changeVisibilityAddForm(true))} />
                </Link>
              </Col>
            </Row>
            <hr />
            <AdminCitiesList cities={cities} />

            <CityForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New City'} isModal={true} />
          </>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminDashboardCitiesPage;
