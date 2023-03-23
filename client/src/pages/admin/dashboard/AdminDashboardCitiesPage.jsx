import React, { useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Form, Container, Row, Col, Spinner } from 'react-bootstrap';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer, AdminCitiesList, ModalForm } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCities, addCity, deleteCity } from '../../../store/reducers/ActionCreators';
import { citySlice } from '../../../store/reducers';

import { formatDecimal } from '../../../utils';
import { ERROR_TYPE } from '../../../constants';

const AdminDashboardCitiesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { changeVisibilityAddForm, changeNewCityField, clearNotification } = citySlice.actions;
  const { cities, newCity, error, notification, isInitialLoading, isShowAddForm, isPending } = useSelector((state) => state.cityReducer);

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

  const isFormValid = useCallback(() => newCity.name, [newCity]);

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
          </>
        )}
        <hr />

        <ModalForm
          size="sm"
          show={isShowAddForm}
          title={'Add New City'}
          okText={'Create'}
          onHide={() => dispatch(changeVisibilityAddForm(false))}
          onSubmit={(event) => {
            event.preventDefault();
            dispatch(addCity(newCity));
          }}
          pending={isPending}
          isFormValid={isFormValid}
          formContent={
            <>
              <Form.Group className="mb-3">
                <Form.Label>Name:</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  autoFocus
                  required
                  value={newCity.name}
                  disabled={isPending}
                  onChange={({ target: { name, value } }) => dispatch(changeNewCityField({ name, value }))}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Price Per Hour (Employe rate):</Form.Label>
                <Form.Control
                  type="number"
                  name="pricePerHour"
                  required
                  min={0}
                  step={0.05}
                  value={formatDecimal(newCity.pricePerHour)}
                  disabled={isPending}
                  onChange={({ target: { name, value } }) => dispatch(changeNewCityField({ name, value }))}
                />
              </Form.Group>
            </>
          }
        />
      </Container>
    </Container>
  );
};

export default AdminDashboardCitiesPage;
