import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, FormGroup, FormControl, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { useSnackbar } from 'notistack';
import Header from '../../../components/common/Header';
import ErrorContainer from '../../../components/common/ErrorContainer';
import { getCityById, updateCityById } from '../../../api/cities';

const AdminEditCity = () => {
  const { id } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [city, setCity] = useState(null);
  const [originalCity, setOriginalCity] = useState(null);
  const [newCityName, setNewCityName] = useState('');
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);

  const isLoading = useMemo(() => city === null && pending, [city, pending]);
  const isError = useMemo(() => error !== null, [error]);
  const isComponentReady = useMemo(() => city !== null, [city]);

  const resetBeforeApiCall = () => {
    setPending(true);
    setError(null);
  };

  const fetchCityById = async (id, abortController) => {
    try {
      const response = await getCityById({ id, abortController });
      if (response?.data?.city) {
        const { city } = response.data;
        setCity(city);
        setOriginalCity(city);
        setNewCityName(city.name);
      }
    } catch (e) {
      setError(e);
    } finally {
      setPending(false);
    }
  };

  const doUpdateCityById = async (id, cityName) => {
    try {
      const response = await updateCityById({ id, cityName });
      if ([200, 204].includes(response?.status)) {
        setCity({ ...city, name: cityName });
        setOriginalCity({ ...city, name: cityName });
        enqueueSnackbar('City updated', { variant: 'success' });
      }
    } catch (e) {
      setError(e);
      if (e?.response?.status === 404) {
        setCity(null);
        setOriginalCity(null);
      } else {
        setCity(originalCity);
        setNewCityName(originalCity.name);
      }
      enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    resetBeforeApiCall();
    fetchCityById(id, abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [id, closeSnackbar]);

  const onCityNameChange = (event) => {
    setNewCityName(event.target.value);
    setError(null);
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
    resetBeforeApiCall();
    doUpdateCityById(id, newCityName);
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

        {isLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}

        {isError && <ErrorContainer error={error} />}

        {isComponentReady && (
          <Row className="justify-content-md-center">
            <Col md="auto">
              <Form inline="true" className="d-flex align-items-end" onSubmit={onFormSubmit}>
                <FormGroup>
                  <Form.Label>City:</Form.Label>
                  <FormControl type="text" name="city" disabled={pending} value={newCityName} onChange={onCityNameChange} />
                </FormGroup>
                <Button className="ms-2" type="submit" variant="success" disabled={!newCityName || pending}>
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

export default AdminEditCity;
