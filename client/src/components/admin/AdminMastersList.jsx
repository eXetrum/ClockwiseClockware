import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Alert } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import LockResetIcon from '@mui/icons-material/LockReset';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { deleteMaster, resetPasswordMaster, resendEmailConfirmationMaster } from '../../store/thunks';
import { selectAllMasters } from '../../store/selectors';

import { formatDecimal } from '../../utils';
import { MAX_RATING_VALUE, RATING_FORMAT_DECIMAL } from '../../constants';

const AdminMastersList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const masters = useSelector(selectAllMasters);

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

  const columns = [
    { field: 'email', headerName: 'Email', width: 300 },
    { field: 'name', headerName: 'Name', width: 300 },
    {
      field: 'cities',
      headerName: 'Cities',
      width: 240,
      valueFormatter: ({ value }) => value.map(city => city.name).join(', '),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      type: 'number',
      valueFormatter: ({ value }) =>
        `${formatDecimal(value, RATING_FORMAT_DECIMAL)}/${formatDecimal(MAX_RATING_VALUE, RATING_FORMAT_DECIMAL)}`,
    },
    {
      field: 'isEmailVerified',
      headerName: 'Email Verified',
      type: 'boolean',
    },
    {
      field: 'isApprovedByAdmin',
      headerName: 'Approved',
      type: 'boolean',
    },
    {
      field: 'actions',
      headerName: 'actions',
      type: 'actions',
      width: 100,
      disableReorder: true,
      getActions: ({ row }) => {
        const actions = [
          <GridActionsCellItem
            icon={<LockResetIcon />}
            label="Reset password"
            onClick={() => onResetPassword(row)}
            disabled={row.isPendingResetPassword}
            showInMenu
          />,
          <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => navigate(`/admin/masters/${row.id}`)} showInMenu />,
          <GridActionsCellItem icon={<DeleteForeverIcon />} label="Delete" onClick={() => onRemove(row)} showInMenu />,
        ];
        if (!row.isEmailVerified) {
          actions.unshift(
            <GridActionsCellItem
              icon={<ForwardToInboxIcon />}
              label="Resend email confirmation"
              onClick={() => onResendEmailConfirmation(row)}
              disabled={row.isPendingResendEmailConfirmation}
              showInMenu
            />,
          );
        }

        return actions;
      },
    },
  ];

  if (!masters.length) {
    return (
      <Row className="justify-content-md-center mt-3">
        <Col md="auto">
          <Alert variant="warning" className="text-center">
            No records yet
          </Alert>
        </Col>
      </Row>
    );
  }

  return <DataGrid rows={masters} columns={columns} rowsPerPageOptions={[]} hideFooter={true} autoHeight />;
};

export default AdminMastersList;
