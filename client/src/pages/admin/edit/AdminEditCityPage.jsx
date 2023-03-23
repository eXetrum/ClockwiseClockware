import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer } from '../../../components/common';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCity, updateCity } from '../../../store/reducers/ActionCreators';
import { citySlice } from '../../../store/reducers';

import { formatDecimal } from '../../../utils';
import { ERROR_TYPE } from '../../../constants';

const AdminEditCityPage = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();
  const { changeNewCityField, clearNotification } = citySlice.actions;
  const { newCity, error, notification, isInitialLoading, isPending } = useSelector((state) => state.cityReducer);

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
  const isFormValid = useCallback(() => newCity.name, [newCity]);

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

        {isComponentReady && (
          <Row className="justify-content-md-center">
            <Col md="auto">
              <Form
                inline="true"
                className="d-flex align-items-end"
                onSubmit={(event) => {
                  event.preventDefault();
                  dispatch(updateCity(newCity));
                }}
              >
                <Form.Group className="me-3">
                  <Form.Label>Name:</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    autoFocus
                    value={newCity.name}
                    disabled={isPending}
                    onChange={({ target: { name, value } }) => dispatch(changeNewCityField({ name, value }))}
                  />
                </Form.Group>
                <Form.Group className="me-3">
                  <Form.Label>Price Per Hour (Employe rate):</Form.Label>
                  <Form.Control
                    type="number"
                    name="pricePerHour"
                    min={0}
                    step={0.05}
                    value={formatDecimal(newCity.pricePerHour, 2)}
                    disabled={isPending}
                    onChange={({ target: { name, value } }) => dispatch(changeNewCityField({ name, value }))}
                  />
                </Form.Group>
                <Button className="ms-2" type="submit" variant="success" disabled={isPending || !isFormValid()}>
                  Save
                </Button>
              </Form>
            </Col>
          </Row>
        )}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditCityPage;
