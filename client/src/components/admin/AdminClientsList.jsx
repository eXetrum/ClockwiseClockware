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
import { useDispatch } from 'react-redux';
import { deleteClient, resetPasswordClient, resendEmailConfirmationClient } from '../../store/thunks';

const AdminClientsList = ({ clients }) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onRemove = useCallback(
    async client => {
      const result = await confirm(`Do you want to delete "${client.email}" client ?`, {
        title: 'Confirm',
        okText: 'Delete',
        okButtonStyle: 'danger',
      });
      if (!result) return;

      const action = await dispatch(deleteClient(client.id));
      if (isFulfilled(action)) enqueueSnackbar(`Client "${client.email}" removed`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar],
  );

  const onResetPassword = useCallback(
    async client => {
      const result = await confirm(`Do you want to reset password for "${client.email}" client ?`, {
        title: 'Confirm',
        okText: 'Yes',
        okButtonStyle: 'danger',
      });
      if (!result) return;

      const action = await dispatch(resetPasswordClient(client.id));
      if (isFulfilled(action)) enqueueSnackbar(`Password for client ${client.email} has been successfully reset`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar],
  );

  const onResendEmailConfirmation = useCallback(
    async client => {
      const result = await confirm(`Do you want to resend email confirmation for "${client.email}" client ?`, {
        title: 'Confirm',
        okText: 'Yes',
        okButtonStyle: 'danger',
      });
      if (!result) return;

      const action = await dispatch(resendEmailConfirmationClient(client.id));
      if (isFulfilled(action)) enqueueSnackbar(`Email confirmation for client ${client.email} has been sent`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar],
  );

  const columns = [
    { field: 'email', headerName: 'Email', width: 300 },
    { field: 'name', headerName: 'Name', width: 300 },
    {
      field: 'isEmailVerified',
      headerName: 'Email Verified',
      type: 'boolean',
    },
    {
      field: 'actions',
      headerName: 'actions',
      type: 'actions',
      width: 100,
      disableReorder: true,
      getActions: params => {
        const actions = [
          <GridActionsCellItem
            icon={<LockResetIcon />}
            label="Reset password"
            onClick={() => onResetPassword(params.row)}
            disabled={params.row.isPendingResetPassword}
            showInMenu
          />,
          <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => navigate(`/admin/clients/${params.row.id}`)} showInMenu />,
          <GridActionsCellItem icon={<DeleteForeverIcon />} label="Delete" onClick={async () => onRemove(params.row)} showInMenu />,
        ];
        if (!params.row.isEmailVerified) {
          actions.unshift(
            <GridActionsCellItem
              icon={<ForwardToInboxIcon />}
              label="Resend email confirmation"
              onClick={() => onResendEmailConfirmation(params.row)}
              disabled={params.row.isPendingResendEmailConfirmation}
              showInMenu
            />,
          );
        }

        return actions;
      },
    },
  ];

  if (clients.length === 0) {
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

  return <DataGrid rows={clients} columns={columns} rowsPerPageOptions={[]} hideFooter={true} autoHeight />;
};

export default AdminClientsList;
