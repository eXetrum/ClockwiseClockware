import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Form, Container, Row, Col, Spinner } from 'react-bootstrap';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { Header, ErrorContainer, AdminCitiesList, ModalForm } from '../../../components';
import { getCities, createCity, deleteCityById } from '../../../api';
import { getErrorText, formatDecimal } from '../../../utils';

const initEmptyCity = () => ({ name: '', pricePerHour: 0.0 });

const AdminDashboardCitiesPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [cities, setCities] = useState([]);
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newCity, setNewCity] = useState(initEmptyCity());
  const [pending, setPending] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);
  const isFormValid = useCallback(() => newCity.name, [newCity]);

  const fetchInitialData = async abortController => {
    setInitialLoading(true);
    try {
      const response = await getCities({ abortController });
      if (response?.data?.cities) {
        const { cities } = response.data;
        setCities(cities);
      }
    } catch (e) {
      setError(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const doCreateCity = async city => {
    setPending(true);
    try {
      const response = await createCity({ city });
      if (response?.data?.city) {
        const { city } = response.data;
        setCities([city, ...cities]);
        setNewCity(initEmptyCity());
        setShowAddForm(false);
        enqueueSnackbar(`City "${city.name}" created`, { variant: 'success' });
      }
    } catch (e) {
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  const doDeleteCityById = async id => {
    setPending(true);
    try {
      await deleteCityById({ id });
      const removedCity = cities.find(item => item.id === id);
      setCities(cities.filter(item => item.id !== id));
      enqueueSnackbar(`City "${removedCity.name}" removed`, { variant: 'success' });
    } catch (e) {
      if (e?.response?.status === 404) setCities(cities.filter(item => item.id !== id));
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchInitialData(abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [closeSnackbar]);

  const onFormHide = () => {
    setNewCity(initEmptyCity());
    setShowAddForm(false);
  };

  const onFormSubmit = event => {
    event.preventDefault();
    doCreateCity(newCity);
  };

  const onCityNameChange = event => setNewCity(prev => ({ ...prev, name: event.target.value }));
  const onCityPricePerHourChange = event => setNewCity(prev => ({ ...prev, pricePerHour: event.target.value }));

  const onCityRemove = async cityId => {
    const city = cities.find(item => item.id === cityId);

    const result = await confirm(`Do you want to delete "${city.name}" city ?`, {
      title: 'Confirm',
      okText: 'Delete',
      okButtonStyle: 'danger',
    });

    if (result) doDeleteCityById(cityId);
  };

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
            <Spinner animation="grow" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? (
          <>
            <Row className="justify-content-md-center">
              <Col md="auto">
                <Link to="#">
                  <AddCircleOutlineOutlinedIcon onClick={() => setShowAddForm(true)} />
                </Link>
              </Col>
            </Row>
            <hr />
            <AdminCitiesList cities={cities} onRemove={onCityRemove} />
          </>
        ) : null}
        <hr />

        <ModalForm
          size="sm"
          show={showAddForm}
          title={'Add New City'}
          okText={'Create'}
          onHide={onFormHide}
          onSubmit={onFormSubmit}
          pending={pending}
          isFormValid={isFormValid}
          formContent={
            <>
              <Form.Group className="mb-3">
                <Form.Label>Name:</Form.Label>
                <Form.Control type="text" name="city" autoFocus onChange={onCityNameChange} value={newCity.name} disabled={pending} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Price Per Hour (Employe rate):</Form.Label>
                <Form.Control
                  type="number"
                  name="pricePerHour"
                  min={0}
                  step={0.25}
                  onChange={onCityPricePerHourChange}
                  value={formatDecimal(newCity.pricePerHour)}
                  disabled={pending}
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
