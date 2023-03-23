import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Header, ErrorContainer, MasterForm } from '../../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchCities, fetchMaster, updateMaster } from '../../../store/reducers/ActionCreators';
import { masterSlice } from '../../../store/reducers';

import { ERROR_TYPE } from '../../../constants';

const AdminEditMasterPage = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const { clearNotification } = masterSlice.actions;
  const { newMaster, error, notification, isInitialLoading: isInitialLoadingMaster } = useSelector((state) => state.masterReducer);
  const { isInitialLoading: isInitialLoadingCities } = useSelector((state) => state.cityReducer);

  useEffect(() => {
    dispatch(fetchCities());
    dispatch(fetchMaster(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (notification.text && notification.variant) {
      enqueueSnackbar(notification.text, { variant: notification.variant });
      dispatch(clearNotification());
    }
  }, [notification, enqueueSnackbar, dispatch, clearNotification]);

  const isInitialLoading = useMemo(
    () => isInitialLoadingCities || isInitialLoadingMaster,
    [isInitialLoadingCities, isInitialLoadingMaster],
  );

  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  const onFormSubmit = (event) => {
    event.preventDefault();
    dispatch(updateMaster(newMaster));
  };

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

        {isInitialLoading ? (
          <center>
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? <MasterForm onSubmit={onFormSubmit} isHidePassword={true} /> : null}

        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditMasterPage;
