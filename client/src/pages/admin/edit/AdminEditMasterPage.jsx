import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, FormGroup, FormControl, Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Multiselect from 'multiselect-react-dropdown';
import StarRating from '../../../components/common/StarRating';
import Header from '../../../components/common/Header';
import ErrorContainer from '../../../components/common/ErrorContainer';
import { getCities } from '../../../api/cities';
import { getMasterById, updateMasterById } from '../../../api/masters';
import { isGlobalError, getErrorText } from '../../../utils/error';

const AdminEditMasterPage = () => {
  const { id } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const initEmptyMaster = () => ({ name: '', email: '', rating: 0, cities: [] });

  const [cities, setCities] = useState([]);
  const [master, setMaster] = useState(initEmptyMaster());
  const [originalMaster, setOriginalMaster] = useState(initEmptyMaster());
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pending, setPending] = useState(false);
  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);
  const isFormValid = useCallback(() => master.name && master.email && /\w{1,}@\w{1,}\.\w{2,}/gi.test(master.email), [master]);

  const fetchInitialData = async (id, abortController) => {
    setInitialLoading(true);
    try {
      let response = await getCities({ abortController });
      if (response?.data?.cities) {
        const { cities } = response.data;
        setCities(cities);
      }

      response = await getMasterById({ id, abortController });
      if (response?.data?.master) {
        const { master } = response.data;
        setMaster(master);
        setOriginalMaster(master);
      }
    } catch (e) {
      setError(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const doUpdateMasterById = async (id, master) => {
    setPending(true);
    try {
      const response = await updateMasterById({ id, master });
      if ([200, 204].includes(response?.status)) {
        setMaster(master);
        setOriginalMaster(master);
        enqueueSnackbar('Master updated', { variant: 'success' });
      }
    } catch (e) {
      if (isGlobalError(e) && e?.response?.status !== 400) return setError(e);
      setMaster(originalMaster);
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchInitialData(id, abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [id, closeSnackbar]);

  const onFormSubmit = (event) => {
    event.preventDefault();
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

        {isInitialLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}

        <ErrorContainer error={error} />

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

                <Button type="submit" className="ms-2 btn btn-success" disabled={pending || !isFormValid()}>
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

export default AdminEditMasterPage;
