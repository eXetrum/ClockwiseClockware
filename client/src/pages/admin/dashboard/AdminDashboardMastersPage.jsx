import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, FormGroup, FormControl, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Multiselect from 'multiselect-react-dropdown';
import StarRating from '../../../components/common/StarRating';
import Header from '../../../components/common/Header';
import AdminMastersList from '../../../components/admin/AdminMastersList';
import ModalForm from '../../../components/common/ModalForm';
import ErrorContainer from '../../../components/common/ErrorContainer';
import { getMasters, createMaster, deleteMasterById } from '../../../api/masters';
import { getCities } from '../../../api/cities';

const AdminDashboardMastersPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [cities, setCities] = useState(null);
  const [pendingCities, setPendingCities] = useState(true);
  const [masters, setMasters] = useState(null);
  const [pendingMasters, setPendingMasters] = useState(true);
  const [newMaster, setNewMaster] = useState({
    name: '',
    email: '',
    rating: 0,
    cities: [],
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const isCitiesLoading = useMemo(() => cities === null && pendingCities, [cities, pendingCities]);
  const isMastersLoading = useMemo(() => masters === null && pendingMasters, [masters, pendingMasters]);
  const isError = useMemo(() => error !== null, [error]);
  const isAddFormReady = useMemo(() => cities !== null, [cities]);
  const isMasterListReady = useMemo(() => masters !== null, [masters]);

  const isFormValid = useCallback(
    () => newMaster && newMaster.name && newMaster.email && /\w{1,}@\w{1,}\.\w{2,}/gi.test(newMaster.email),
    [newMaster],
  );

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
      setPendingCities(false);
    }
  };

  const fetchMasters = async (abortController) => {
    try {
      const response = await getMasters({ abortController });
      if (response?.data?.masters) {
        const { masters } = response.data;
        setMasters(masters);
      }
    } catch (e) {
      setError(e);
    } finally {
      setPendingMasters(false);
    }
  };

  const doCreateMaster = async (master) => {
    try {
      const response = await createMaster({ master });
      if (response?.data?.master) {
        const { master } = response.data;
        setMasters([master, ...masters]);
        setNewMaster({ name: '', email: '', rating: 0, cities: [] });
        setShowAddForm(false);
        enqueueSnackbar(`Master "${master.name}" created`, {
          variant: 'success',
        });
      }
    } catch (e) {
      setError(e);
      enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  const doDeleteMasterById = async (id) => {
    try {
      const response = await deleteMasterById({ id });
      if ([200, 204].includes(response?.status)) {
        const removedMaster = masters.find((item) => item.id === id);
        setMasters(masters.filter((item) => item.id !== id));
        enqueueSnackbar(`Master "${removedMaster.email}" removed`, {
          variant: 'success',
        });
      }
    } catch (e) {
      setError(e);
      if (e?.response?.status === 404) {
        setMasters(masters.filter((item) => item.id !== id));
      }
      enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchCities(abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [closeSnackbar]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchMasters(abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [closeSnackbar]);

  const onFormHide = () => {
    setNewMaster({ name: '', email: '', rating: 0, cities: [] });
    setError(null);
    setShowAddForm(false);
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
    resetBeforeApiCall();
    doCreateMaster(newMaster);
  };

  const onMasterEmailChange = (event) => setNewMaster((prev) => ({ ...prev, email: event.target.value }));
  const onMasterNameChange = (event) => setNewMaster((prev) => ({ ...prev, name: event.target.value }));
  const onMasterRatingChange = (value) => setNewMaster((prev) => ({ ...prev, rating: value }));
  const onMasterCitySelect = (selectedList, selectedItem) => setNewMaster((prevState) => ({ ...prevState, cities: selectedList }));
  const onMasterCityRemove = (selectedList, removedItem) => setNewMaster((prevState) => ({ ...prevState, cities: selectedList }));

  const onMasterRemove = async (masterId) => {
    const master = masters.find((item) => item.id === masterId);

    const result = await confirm(`Do you want to delete "${master.email}" master ?`, {
      title: 'Confirm',
      okText: 'Delete',
      okButtonStyle: 'danger',
    });
    if (!result) return;

    resetBeforeApiCall();
    doDeleteMasterById(masterId);
  };

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Masters Dashboard</h1>
        </center>
        <hr />

        {isCitiesLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}
        {isError && <ErrorContainer error={error} />}

        {isAddFormReady && (
          <>
            <Row className="justify-content-md-center">
              <Col md="auto">
                <Link to="#">
                  <AddCircleOutlineOutlinedIcon onClick={() => setShowAddForm(true)} />
                </Link>
              </Col>
            </Row>
          </>
        )}

        {isMastersLoading && (
          <>
            <hr />
            <center>
              <Spinner animation="grow" />
            </center>
          </>
        )}
        {isMasterListReady && (
          <>
            <hr />
            <AdminMastersList masters={masters} onRemove={onMasterRemove} />
          </>
        )}

        <hr />

        <ModalForm
          size="sm"
          show={showAddForm}
          title={'Add New Master'}
          okText={'Create'}
          onHide={onFormHide}
          onSubmit={onFormSubmit}
          isFormValid={isFormValid}
          pending={pending}
          formContent={
            <>
              <FormGroup>
                <Form.Label>Master email:</Form.Label>
                <FormControl
                  type="email"
                  name="masterEmail"
                  autoFocus
                  required
                  onChange={onMasterEmailChange}
                  value={newMaster.email}
                  disabled={pending}
                />
              </FormGroup>
              <FormGroup>
                <Form.Label>Master name:</Form.Label>
                <FormControl
                  type="text"
                  name="masterName"
                  required
                  onChange={onMasterNameChange}
                  value={newMaster.name}
                  disabled={pending}
                />
              </FormGroup>
              <FormGroup className="ms-3">
                <Form.Label>Rating:</Form.Label>
                <StarRating
                  onRatingChange={onMasterRatingChange}
                  onRatingReset={onMasterRatingChange}
                  value={newMaster.rating}
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
                  selectedValues={newMaster.cities}
                  displayValue="name"
                  disable={pending}
                />
              </FormGroup>
            </>
          }
        />
      </Container>
    </Container>
  );
};

export default AdminDashboardMastersPage;
