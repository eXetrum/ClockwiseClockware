import React, { useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { Header, ErrorContainer, AdminMastersList, MasterForm } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCities, fetchMasters, addMaster } from '../../../store/thunks';
import { changeVisibilityAddMasterForm } from '../../../store/actions';
import {
  selectNewMaster,
  selectMasterError,
  selectMasterInitialLoading,
  selectCityError,
  selectCityInitialLoading,
} from '../../../store/selectors';

import { isUnknownOrNoErrorType } from '../../../utils';

const AdminDashboardMasters = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const newMaster = useSelector(selectNewMaster);
  const isInitialLoadingMasters = useSelector(selectMasterInitialLoading);
  const errorMaster = useSelector(selectMasterError);
  const isInitialLoadingCities = useSelector(selectCityInitialLoading);
  const errorCity = useSelector(selectCityError);

  const error = !isUnknownOrNoErrorType(errorCity) ? errorCity : errorMaster;

  useEffect(() => {
    dispatch(fetchCities());
    dispatch(fetchMasters());
  }, [dispatch]);

  const isInitialLoading = useMemo(
    () => isInitialLoadingCities || isInitialLoadingMasters,
    [isInitialLoadingCities, isInitialLoadingMasters],
  );

  const isComponentReady = useMemo(() => !isInitialLoading && isUnknownOrNoErrorType(error), [isInitialLoading, error]);

  const onFormSubmit = useCallback(
    async event => {
      event.preventDefault();
      const action = await dispatch(addMaster(newMaster));
      if (isFulfilled(action)) enqueueSnackbar(`Master "${action.payload.email}" created`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newMaster],
  );

  const onFormShow = useCallback(() => dispatch(changeVisibilityAddMasterForm(true)), [dispatch]);

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
              <Col className="d-flex justify-content-center">
                <Link to="#">
                  <AddCircleOutlineOutlinedIcon onClick={onFormShow} />
                </Link>
              </Col>
            </Row>
            <hr />
            <AdminMastersList />

            <MasterForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New Master'} isModal={true} />
          </>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminDashboardMasters;
