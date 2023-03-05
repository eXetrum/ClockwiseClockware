import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, FormGroup, FormControl, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Multiselect from 'multiselect-react-dropdown';
import StarRating from '../StarRating';
import Header from '../Header';
import ErrorContainer from '../ErrorContainer';
import { getCities } from '../../api/cities';
import { getMasterById, updateMasterById } from '../../api/masters';

const AdminEditMaster = () => {
  const { id } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [cities, setCities] = useState(null);
  const [originalMaster, setOriginalMaster] = useState(null);
  const [master, setMaster] = useState(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);

  const isLoading = useMemo(() => (cities === null || master === null) && error === null, [cities, master, error]);
  const isError = useMemo(() => error !== null, [error]);
  const isComponentReady = useMemo(() => cities !== null && master !== null, [cities, master]);

  const isFormValid = useCallback(() => master && master.name && /\w{1,}@\w{1,}\.\w{2,}/gi.test(master.email), [master]);

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

  const fetchMasterById = async (id, abortController) => {
    try {
      const response = await getMasterById({ id, abortController });
      if (response?.data?.master) {
        const { master } = response.data;
        setMaster(master);
        setOriginalMaster(master);
      }
    } catch (e) {
      setError(e);
    } finally {
      setPending(false);
    }
  };

  const doUpdateMasterById = async (id, master) => {
    try {
      const response = await updateMasterById({ id, master });
      if ([200, 204].includes(response?.status)) {
        setMaster(master);
        setOriginalMaster(master);
        enqueueSnackbar('Master updated', { variant: 'success' });
      }
    } catch (e) {
      setError(e);
      if (e?.response?.status === 404) {
        setMaster(null);
        setOriginalMaster(null);
      } else {
        setMaster(originalMaster);
      }
      enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    setPending(true);
    fetchCities(abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [id, closeSnackbar]);

  useEffect(() => {
    const abortController = new AbortController();
    setPending(true);
    fetchMasterById(id, abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [id, closeSnackbar]);

  const onFormSubmit = (event) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    doUpdateMasterById(id, master);
  };

  const onMasterEmailChange = (event) => setMaster((prevState) => ({ ...prevState, email: event.target.value }));
  const onMasterNameChange = (event) => setMaster((prevState) => ({ ...prevState, name: event.target.value }));
  const onMasterRatingChange = (value) => setMaster((prevState) => ({ ...prevState, rating: value }));
  const onMasterCitySelect = (selectedList, selectedItem) => setMaster((prevState) => ({ ...prevState, cities: selectedList }));
  const onMasterCityRemove = (selectedList, removedItem) => setMaster((prevState) => ({ ...prevState, cities: selectedList }));

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Edit Master</h1>
          <Link to={'/admin/masters'}>
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
            <Col xs>
              <Form inline="true" className="d-flex align-items-end" onSubmit={onFormSubmit}>
                <FormGroup>
                  <Form.Label>Master email:</Form.Label>
                  <FormControl type="email" name="masterEmail" onChange={onMasterEmailChange} value={master.email} disabled={pending} />
                </FormGroup>
                <FormGroup>
                  <Form.Label>Master name:</Form.Label>
                  <FormControl type="text" name="masterName" onChange={onMasterNameChange} value={master.name} disabled={pending} />
                </FormGroup>
                <FormGroup className="ms-3">
                  <Form.Label>Rating:</Form.Label>
                  <StarRating
                    onRatingChange={onMasterRatingChange}
                    onRatingReset={onMasterRatingChange}
                    value={master.rating}
                    total={5}
                    readonly={pending}
                  />
                </FormGroup>
                <FormGroup className="ms-3">
                  <Form.Label>Master work cities:</Form.Label>
                  <Multiselect
                    onSelect={onMasterCitySelect}
                    onRemove={onMasterCityRemove}
                    options={cities}
                    selectedValues={master.cities}
                    displayValue="name"
                    disable={pending}
                  />
                </FormGroup>

                <Button type="submit" className="ms-2 btn btn-success" disabled={!isFormValid()}>
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

export default AdminEditMaster;
