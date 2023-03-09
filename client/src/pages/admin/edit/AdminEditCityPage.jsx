import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { useSnackbar } from 'notistack';
import Header from '../../../components/common/Header';
import ErrorContainer from '../../../components/common/ErrorContainer';
import { getCityById, updateCityById } from '../../../api/cities';
import { isGlobalError, getErrorText } from '../../../utils';

const AdminEditCityPage = () => {
  const { id } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const formatDecimal = (value) => parseFloat(value).toFixed(2);
  const initEmptyCity = () => ({ name: '', pricePerHour: 0.0 });

  const [city, setCity] = useState(initEmptyCity());
  const [originalCity, setOriginalCity] = useState(initEmptyCity());
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pending, setPending] = useState(false);
  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);
  const isFormValid = useCallback(() => city.name, [city]);

  const fetchCityById = async (id, abortController) => {
    setInitialLoading(true);
    try {
      const response = await getCityById({ id, abortController });
      if (response?.data?.city) {
        const { city } = response.data;
        setCity(city);
        setOriginalCity(city);
      }
    } catch (e) {
      setError(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const doUpdateCityById = async (id, city) => {
    setPending(true);
    try {
      const response = await updateCityById({ id, city });
      if ([200, 204].includes(response?.status)) {
        setCity(city);
        setOriginalCity(city);
        enqueueSnackbar('City updated', { variant: 'success' });
      }
    } catch (e) {
      if (isGlobalError(e) && e?.response?.status !== 400) return setError(e);
      setCity(originalCity);
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchCityById(id, abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [id, closeSnackbar]);

  const onFormSubmit = (event) => {
    event.preventDefault();
    doUpdateCityById(id, city);
  };

  const onCityNameChange = (event) => setCity((prev) => ({ ...prev, name: event.target.value }));
  const onCityPricePerHourChange = (event) => setCity((prev) => ({ ...prev, pricePerHour: event.target.value }));

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
              <Form inline="true" className="d-flex align-items-end" onSubmit={onFormSubmit}>
                <Form.Group className="me-3">
                  <Form.Label>Name:</Form.Label>
                  <Form.Control type="text" name="city" autoFocus disabled={pending} value={city.name} onChange={onCityNameChange} />
                </Form.Group>
                <Form.Group className="me-3">
                  <Form.Label>Price Per Hour (Employe rate):</Form.Label>
                  <Form.Control
                    type="number"
                    name="pricePerHour"
                    min={0}
                    step={0.25}
                    onChange={onCityPricePerHourChange}
                    value={formatDecimal(city.pricePerHour)}
                    disabled={pending}
                  />
                </Form.Group>
                <Button className="ms-2" type="submit" variant="success" disabled={pending || !isFormValid()}>
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
