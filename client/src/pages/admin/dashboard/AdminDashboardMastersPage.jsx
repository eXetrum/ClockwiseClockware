import React, { useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Multiselect from 'multiselect-react-dropdown';
import { Header, ErrorContainer, StarRating, AdminMastersList, ModalForm } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCities, fetchMasters, addMaster, deleteMaster } from '../../../store/reducers/ActionCreators';
import { masterSlice } from '../../../store/reducers';

import { validateEmail } from '../../../utils';
import { ERROR_TYPE } from '../../../constants';

const AdminDashboardMasters = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { changeVisibilityAddForm, changeNewMasterField, clearNotification } = masterSlice.actions;
  const {
    masters,
    newMaster,
    error,
    notification,
    isInitialLoading: isInitialLoadingMasters,
    isShowAddForm,
    isPending,
  } = useSelector((state) => state.masterReducer);

  const { cities, isInitialLoading: isInitialLoadingCities } = useSelector((state) => state.cityReducer);

  useEffect(() => {
    dispatch(fetchCities());
    dispatch(fetchMasters());
  }, [dispatch]);

  useEffect(() => {
    if (notification.text && notification.variant) {
      enqueueSnackbar(notification.text, { variant: notification.variant });
      dispatch(clearNotification());
    }
  }, [notification, enqueueSnackbar, dispatch, clearNotification]);

  const isInitialLoading = useMemo(
    () => isInitialLoadingCities || isInitialLoadingMasters,
    [isInitialLoadingCities, isInitialLoadingMasters],
  );

  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  const isFormValid = useCallback(
    () => newMaster.email && validateEmail(newMaster.email) && newMaster.password && newMaster.name && newMaster.cities.length > 0,
    [newMaster],
  );

  const onMasterRemove = async (masterId) => {
    const master = masters.find((item) => item.id === masterId);

    const result = await confirm(`Do you want to delete "${master.email}" master ?`, {
      title: 'Confirm',
      okText: 'Delete',
      okButtonStyle: 'danger',
    });

    if (result) dispatch(deleteMaster(masterId));
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
                  <AddCircleOutlineOutlinedIcon onClick={() => dispatch(changeVisibilityAddForm(true))} />
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
          show={isShowAddForm}
          title={'Add New Master'}
          okText={'Create'}
          onHide={() => dispatch(changeVisibilityAddForm(false))}
          onSubmit={(event) => {
            event.preventDefault();
            dispatch(addMaster(newMaster));
          }}
          isFormValid={isFormValid}
          pending={isPending}
          formContent={
            <>
              <Form.Group className="mb-3">
                <Form.Label>Email:</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  autoFocus
                  required
                  onChange={({ target: { name, value } }) => dispatch(changeNewMasterField({ name, value }))}
                  value={newMaster.email}
                  disabled={isPending}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Password:</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  required
                  onChange={({ target: { name, value } }) => dispatch(changeNewMasterField({ name, value }))}
                  value={newMaster.password}
                  disabled={isPending}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Name:</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  required
                  onChange={({ target: { name, value } }) => dispatch(changeNewMasterField({ name, value }))}
                  value={newMaster.name}
                  disabled={isPending}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Rating:</Form.Label>
                <StarRating
                  onRatingChange={(value) => dispatch(changeNewMasterField({ name: 'rating', value }))}
                  onRatingReset={(value) => dispatch(changeNewMasterField({ name: 'rating', value }))}
                  value={newMaster.rating}
                  total={5}
                  readonly={isPending}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Master cities:</Form.Label>
                <Multiselect
                  onSelect={(selectedList, selectedItem) => dispatch(changeNewMasterField({ name: 'cities', value: selectedList }))}
                  onRemove={(selectedList, removedItem) => dispatch(changeNewMasterField({ name: 'cities', value: selectedList }))}
                  options={cities}
                  selectedValues={newMaster.cities}
                  displayValue="name"
                  disable={isPending}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="isApprovedByAdmin"
                  checked={newMaster.isApprovedByAdmin}
                  onChange={({ target: { name, checked: value } }) => dispatch(changeNewMasterField({ name, value }))}
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
