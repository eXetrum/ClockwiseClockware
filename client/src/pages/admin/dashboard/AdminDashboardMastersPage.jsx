import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { Header, ErrorContainer, AdminMastersList, MasterForm } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCities, fetchMasters, addMaster } from '../../../store/reducers/ActionCreators';
import { masterSlice } from '../../../store/reducers';

import { ERROR_TYPE } from '../../../constants';

const AdminDashboardMasters = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { changeVisibilityAddForm, clearNotification } = masterSlice.actions;
  const {
    masters,
    newMaster,
    error,
    notification,
    isInitialLoading: isInitialLoadingMasters,
  } = useSelector((state) => state.masterReducer);

  const { isInitialLoading: isInitialLoadingCities } = useSelector((state) => state.cityReducer);

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

  const onFormSubmit = (event) => {
    event.preventDefault();
    dispatch(addMaster(newMaster));
  };

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Masters Dashboard</h1>
        </center>
        <hr />

        {isInitialLoading ? (
          <center>
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? (
          <>
            <Row className="justify-content-md-center">
              <Col md="auto">
                <Link to="#">
                  <AddCircleOutlineOutlinedIcon onClick={() => dispatch(changeVisibilityAddForm(true))} />
                </Link>
              </Col>
            </Row>
            <hr />
            <AdminMastersList masters={masters} />

            <MasterForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New Master'} isModal={true} />
          </>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminDashboardMasters;
