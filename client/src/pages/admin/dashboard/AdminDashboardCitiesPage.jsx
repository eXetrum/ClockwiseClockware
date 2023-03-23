import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer, AdminCitiesList, CityForm } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCities, addCity, deleteCity } from '../../../store/reducers/ActionCreators';
import { citySlice } from '../../../store/reducers';

import { ERROR_TYPE } from '../../../constants';

const AdminDashboardCitiesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { changeVisibilityAddForm, clearNotification } = citySlice.actions;
  const { cities, newCity, error, notification, isInitialLoading } = useSelector((state) => state.cityReducer);

  useEffect(() => {
    dispatch(fetchCities());
  }, [dispatch]);

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
    dispatch(addCity(newCity));
  };

  const onCityRemove = async (cityId) => {
    const city = cities.find((item) => item.id === cityId);

    const result = await confirm(`Do you want to delete "${city.name}" city ?`, {
      title: 'Confirm',
      okText: 'Delete',
      okButtonStyle: 'danger',
    });

    if (result) dispatch(deleteCity(cityId));
  };

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Cities Dashboard</h1>
        </center>
        <hr />

        {isInitialLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}

        <ErrorContainer error={error} />

        {isComponentReady && (
          <>
            <Row className="justify-content-md-center">
              <Col md="auto">
                <Link to="#">
                  <AddCircleOutlineOutlinedIcon onClick={() => dispatch(changeVisibilityAddForm(true))} />
                </Link>
              </Col>
            </Row>
            <hr />
            <AdminCitiesList cities={cities} onRemove={onCityRemove} />

            <CityForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New City'} isModal={true} />
          </>
        )}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminDashboardCitiesPage;
