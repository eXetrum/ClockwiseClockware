import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Multiselect from 'multiselect-react-dropdown';
import { Header, ErrorContainer, StarRating, AdminMastersList, ModalForm } from '../../../components';
import { getCities, getMasters, createMaster, deleteMasterById } from '../../../api';
import { getErrorText, validateEmail } from '../../../utils';

const AdminDashboardMasters = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const initEmptyMaster = () => ({
    name: '',
    email: '',
    password: '',
    rating: 0,
    isApprovedByAdmin: false,
    cities: [],
  });

  const [cities, setCities] = useState([]);
  const [masters, setMasters] = useState([]);
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newMaster, setNewMaster] = useState(initEmptyMaster());
  const [isPending, setPending] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);
  const isFormValid = useCallback(
    () => newMaster.name && newMaster.email && validateEmail(newMaster.email) && newMaster.password,
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
  const onMasterPasswordChange = (event) => setNewMaster((prev) => ({ ...prev, password: event.target.value }));
  const onMasterRatingChange = (value) => setNewMaster((prev) => ({ ...prev, rating: value }));
  const onMasterIsApprovedByAdminChange = (event) => setNewMaster((prev) => ({ ...prev, isApprovedByAdmin: event.target.checked }));

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
          pending={isPending}
          formContent={
            <>
              <Form.Group className="mb-3">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  type="email"
                  name="masterEmail"
                  autoFocus
                  required
                  onChange={onMasterEmailChange}
                  value={newMaster.email}
                  disabled={isPending}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Name:</Form.Label>
                <Form.Control
                  type="text"
                  name="masterName"
                  required
                  onChange={onMasterNameChange}
                  value={newMaster.name}
                  disabled={isPending}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password:</Form.Label>
                <Form.Control
                  type="password"
                  name="masterPassword"
                  required
                  onChange={onMasterPasswordChange}
                  value={newMaster.password}
                  disabled={isPending}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Rating:</Form.Label>
                <StarRating
                  onRatingChange={onMasterRatingChange}
                  onRatingReset={onMasterRatingChange}
                  value={newMaster.rating}
                  total={5}
                  readonly={isPending}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Master cities:</Form.Label>
                <Multiselect
                  onSelect={onMasterCitySelect}
                  onRemove={onMasterCityRemove}
                  options={cities}
                  selectedValues={newMaster.cities}
                  displayValue="name"
                  disable={isPending}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="clientIsApprovedByAdmin"
                  checked={newMaster.isApprovedByAdmin}
                  onChange={onMasterIsApprovedByAdminChange}
                  disabled={isPending}
                  label="approved"
                />
              </Form.Group>
            </>
          }
        />
      </Container>
    </Container>
  );
};

export default AdminDashboardMasters;
