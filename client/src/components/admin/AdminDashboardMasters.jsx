import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, FormGroup, FormControl, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Multiselect from 'multiselect-react-dropdown';
import StarRating from '../StarRating';
import Header from '../Header';
import AdminMastersList from './AdminMastersList';
import ModalForm from '../ModalForm';
import ErrorContainer from '../ErrorContainer';
import { getMasters, createMaster, deleteMasterById } from '../../api/masters';
import { getCities } from '../../api/cities';
import { getErrorText } from '../../utils/error';

const AdminDashboardMasters = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const initEmptyMaster = () => ({ name: '', email: '', rating: 0, cities: [] });

  const [cities, setCities] = useState([]);
  const [masters, setMasters] = useState([]);
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newMaster, setNewMaster] = useState(initEmptyMaster());
  const [pending, setPending] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);
  const isFormValid = useCallback(
    () => newMaster && newMaster.name && newMaster.email && /\w{1,}@\w{1,}\.\w{2,}/gi.test(newMaster.email),
    [newMaster],
  );

  const fetchInitialData = async (abortController) => {
    setInitialLoading(true);
    try {
      let response = await getCities({ abortController });
      if (response?.data?.cities) {
        const { cities } = response.data;
        setCities(cities);
      }
      response = await getMasters({ abortController });
      if (response?.data?.masters) {
        const { masters } = response.data;
        setMasters(masters);
      }
    } catch (e) {
      setError(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const doCreateMaster = async (master) => {
    setPending(true);
    try {
      const response = await createMaster({ master });
      if (response?.data?.master) {
        const { master } = response.data;
        setMasters([master, ...masters]);
        setNewMaster(initEmptyMaster());
        setShowAddForm(false);
        enqueueSnackbar(`Master "${master.name}" created`, { variant: 'success' });
      }
    } catch (e) {
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  const doDeleteMasterById = async (id) => {
    setPending(true);
    try {
      const response = await deleteMasterById({ id });
      if ([200, 204].includes(response?.status)) {
        const removedMaster = masters.find((item) => item.id === id);
        setMasters(masters.filter((item) => item.id !== id));
        enqueueSnackbar(`Master "${removedMaster.email}" removed`, { variant: 'success' });
      }
    } catch (e) {
      if (e?.response?.status === 404) setMasters(masters.filter((item) => item.id !== id));
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
    setNewMaster(initEmptyMaster());
    setShowAddForm(false);
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
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

    if (result) doDeleteMasterById(masterId);
  };

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Masters Dashboard</h1>
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
                  <AddCircleOutlineOutlinedIcon onClick={() => setShowAddForm(true)} />
                </Link>
              </Col>
            </Row>
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

export default AdminDashboardMasters;
