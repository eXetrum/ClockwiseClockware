import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Badge } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { StarRating, SpinnerButton } from '../common';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { deleteMaster, resetPasswordMaster, resendEmailConfirmationMaster } from '../../store/thunks';

import { formatDecimal } from '../../utils';
import { MAX_RATING_VALUE } from '../../constants';

const AdminMastersList = ({ masters }) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const onRemove = useCallback(
    async master => {
      const result = await confirm(`Do you want to delete "${master.email}" master ?`, {
        title: 'Confirm',
        okText: 'Delete',
        okButtonStyle: 'danger',
      });
      if (!result) return;

      const action = await dispatch(deleteMaster(master.id));
      if (isFulfilled(action)) enqueueSnackbar(`Master "${master.email}" removed`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar],
  );

  const onResetPassword = useCallback(
    async master => {
      const result = await confirm(`Do you want to reset password for "${master.email}" master ?`, {
        title: 'Confirm',
        okText: 'Yes',
        okButtonStyle: 'danger',
      });
      if (!result) return;

      const action = await dispatch(resetPasswordMaster(master.id));
      if (isFulfilled(action)) enqueueSnackbar(`Password for master ${master.email} has been successfully reset`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar],
  );

  const onResendEmailConfirmation = useCallback(
    async master => {
      const result = await confirm(`Do you want to resend email confirmation for "${master.email}" master ?`, {
        title: 'Confirm',
        okText: 'Yes',
        okButtonStyle: 'danger',
      });
      if (!result) return;

      const action = await dispatch(resendEmailConfirmationMaster(master.id));
      if (isFulfilled(action)) enqueueSnackbar(`Email confirmation for master ${master.email} has been sent`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar],
  );

  return (
    <Container>
      <Table striped bordered responsive size="sm" className="mt-3">
        <thead>
          <tr>
            <th className="text-center p-3 m-0">id</th>
            <th className="text-center p-3 m-0">email</th>
            <th className="text-center p-3 m-0">name</th>
            <th className="text-center p-3 m-0">cities</th>
            <th className="text-center p-3 m-0">rating</th>
            <th className="text-center p-3 m-0">approved</th>
            <th colSpan="3" className="text-center p-2 m-0"></th>
          </tr>
        </thead>
        <tbody>
          {masters.map(master => (
            <tr key={master.id}>
              <td className="text-center p-3 m-0 col-2">{master.id}</td>
              <td className="p-3 m-0">
                <Stack direction="row" alignItems="center" gap={1}>
                  {master.isEmailVerified ? <CheckIcon fontSize="small" /> : <QuestionMarkIcon fontSize="small" />}
                  <Typography variant="body1">{master.email}</Typography>
                </Stack>
              </td>
              <td className="p-3 m-0">{master.name}</td>
              <td className="text-center  pt-2 m-0">
                {master.cities.map(city => (
                  <Badge bg="info" className="p-2 m-1" key={city.id}>
                    {city.name}
                  </Badge>
                ))}
              </td>
              <td className="text-center p-2 m-0">
                <StarRating total={5} value={master.rating} readonly={true} />
                <b>
                  {formatDecimal(master.rating, 1)}/{formatDecimal(MAX_RATING_VALUE, 1)}
                </b>
              </td>
              <td className="text-center p-2 m-0">
                {master.isApprovedByAdmin ? <Badge bg="success">Yes</Badge> : <Badge bg="secondary">No</Badge>}
              </td>
              <td className="text-center p-2 m-0 col-2">
                <Stack spacing={1}>
                  <SpinnerButton
                    size="sm"
                    variant="outline-warning"
                    disabled={master.isPendingResetPassword}
                    loading={master.isPendingResetPassword}
                    onClick={() => onResetPassword(master)}
                    text={'Reset password'}
                  />
                  {!master.isEmailVerified ? (
                    <SpinnerButton
                      size="sm"
                      variant="outline-primary"
                      disabled={master.isPendingResendEmailConfirmation}
                      loading={master.isPendingResendEmailConfirmation}
                      onClick={() => onResendEmailConfirmation(master)}
                      text={'Resend email confirmation'}
                    />
                  ) : null}
                </Stack>
              </td>
              <>
                <td className="text-center p-3 m-0">
                  <Link to={'/admin/masters/' + master.id}>
                    <EditIcon />
                  </Link>
                </td>
                <td className="text-center p-3 m-0">
                  <Link to="#">
                    <DeleteForeverIcon onClick={() => onRemove(master)} />
                  </Link>
                </td>
              </>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminMastersList;
