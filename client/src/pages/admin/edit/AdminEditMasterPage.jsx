import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Header, ErrorContainer, MasterForm } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMaster, updateMaster } from '../../../store/thunks';
import { selectNewMaster, selectMasterError, selectMasterInitialLoading } from '../../../store/selectors';

import { isUnknownOrNoErrorType } from '../../../utils';

const AdminEditMasterPage = () => {
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const newMaster = useSelector(selectNewMaster);
  const isInitialLoading = useSelector(selectMasterInitialLoading);
  const error = useSelector(selectMasterError);

  useEffect(() => dispatch(fetchMaster(id)), [id, dispatch]);

  const isComponentReady = useMemo(() => !isInitialLoading && isUnknownOrNoErrorType(error), [isInitialLoading, error]);

  const onFormSubmit = useCallback(
    async event => {
      event.preventDefault();
      const action = await dispatch(updateMaster(newMaster));
      if (isFulfilled(action)) enqueueSnackbar('Master updated', { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newMaster],
  );

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

        {isComponentReady ? <MasterForm onSubmit={onFormSubmit} isHidePassword={true} isHideRating={true} /> : null}

        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditMasterPage;
