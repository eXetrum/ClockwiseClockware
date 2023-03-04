import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Form, FormGroup, FormControl, Container, Row, Col, Spinner } from 'react-bootstrap';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import Header from '../Header';
import AdminCitiesList from './AdminCitiesList';
import ModalForm from '../ModalForm';
import ErrorContainer from '../ErrorContainer';
import { getCities, createCity, deleteCityById } from '../../api/cities';

const AdminDashboardCities = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [cities, setCities] = useState(null);
  const [newCityName, setNewCityName] = useState('');
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const isLoading = useMemo(() => cities === null && pending, [cities, pending]);
  const isError = useMemo(() => error !== null, [error]);
  const isComponentReady = useMemo(() => cities !== null, [cities]);

  const isFormValid = useCallback(() => newCityName, [newCityName]);

  const resetBeforeApiCall = () => {
    setPending(true);
    setError(null);
  };

  const fetchCities = async (abortController) => {
    try {
      const response = await getCities({ abortController });
      if (response?.data?.cities) {
        const { cities } = response.data;
        setCities(cities);
      }
    } catch (e) {
      setError(e);
    } finally {
      setPending(false);
    }
  };

  const doCreateCity = async (cityName) => {
    try {
      const response = await createCity({ cityName });
      if (response?.data?.city) {
        const { city } = response.data;
        setCities([city, ...cities]);
        setNewCityName('');
        setShowAddForm(false);
        enqueueSnackbar(`City "${city.name}" created`, { variant: 'success' });
      }
    } catch (e) {
      setError(e);
      enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  const doDeleteCityById = async (id) => {
    try {
      const response = await deleteCityById({ id });
      if ([200, 204].includes(response?.status)) {
        const removedCity = cities.find((item) => item.id === id);
        setCities(cities.filter((item) => item.id !== id));
        enqueueSnackbar(`City "${removedCity.name}" removed`, {
          variant: 'success',
        });
      }
    } catch (e) {
      setError(e);
      if (e?.response?.status === 404) {
        setCities(cities.filter((item) => item.id !== id));
      }
      enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    resetBeforeApiCall();
    fetchCities(abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [closeSnackbar]);

  const onFormHide = () => {
    setNewCityName('');
    setError(null);
    setShowAddForm(false);
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
    resetBeforeApiCall();
    doCreateCity(newCityName);
  };

  const onCityNameChange = (event) => {
    setNewCityName(event.target.value);
    setError(null);
  };

  const onCityRemove = async (cityId) => {
    const city = cities.find((item) => item.id === cityId);

    const result = await confirm(`Do you want to delete "${city.name}" city ?`, {
      title: 'Confirm',
      okText: 'Delete',
      okButtonStyle: 'danger',
    });
    if (!result) return;

    resetBeforeApiCall();
    doDeleteCityById(cityId);
  };

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Cities Dashboard</h1>
        </center>
        <hr />

        {isLoading && (
          <center>
            <Spinner animation='grow' />
          </center>
        )}

        {isError && <ErrorContainer error={error} />}

        {isComponentReady && (
          <>
            <Row className='justify-content-md-center'>
              <Col md='auto'>
                <Link to='#'>
                  <AddCircleOutlineOutlinedIcon onClick={() => setShowAddForm(true)} />
                </Link>
              </Col>
            </Row>
            <hr />
            <AdminCitiesList cities={cities} onRemove={onCityRemove} />
          </>
        )}
        <hr />

        <ModalForm
          size='sm'
          show={showAddForm}
          title={'Add New City'}
          okText={'Create'}
          onHide={onFormHide}
          onSubmit={onFormSubmit}
          pending={pending}
          isFormValid={isFormValid}
          formContent={
            <FormGroup>
              <Form.Label>City:</Form.Label>
              <FormControl type='text' name='city' autoFocus onChange={onCityNameChange} value={newCityName} disabled={pending} />
            </FormGroup>
          }
        />
      </Container>
    </Container>
  );
};

export default AdminDashboardCities;
