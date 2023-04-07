import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';

import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import LockResetIcon from '@mui/icons-material/LockReset';

import { Header, ClientForm, LoadingOverlay, NoRowsOverlay } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchClients, addClient, deleteClient, resetPasswordClient, resendEmailConfirmationClient } from '../../../store/thunks';
import { changeVisibilityAddClientForm } from '../../../store/actions';
import {
  selectAllClients,
  selectNewClient,
  selectClientError,
  selectClientInitialLoading,
  selectClientTotalItems,
} from '../../../store/selectors';

import { ERROR_TYPE, PAGINATION_PAGE_SIZE_OPTIONS } from '../../../constants';

const AdminDashboardClientsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const clients = useSelector(selectAllClients);
  const newClient = useSelector(selectNewClient);
  const error = useSelector(selectClientError);
  const loading = useSelector(selectClientInitialLoading);
  const totalItems = useSelector(selectClientTotalItems);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION_PAGE_SIZE_OPTIONS[0]);

  const fetchPage = useCallback(
    () => dispatch(fetchClients({ offset: page * rowsPerPage, limit: rowsPerPage })),
    [dispatch, page, rowsPerPage],
  );

  useEffect(() => fetchPage(), [fetchPage]);

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
      else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) fetchPage();
      }
    },
    [dispatch, enqueueSnackbar, fetchPage],
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
      else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) fetchPage();
      }
    },
    [dispatch, enqueueSnackbar, fetchPage],
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
      else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) fetchPage();
      }
    },
    [dispatch, enqueueSnackbar, fetchPage],
  );

  const onFormSubmit = useCallback(
    async event => {
      event.preventDefault();
      const action = await dispatch(addClient(newClient));
      if (isFulfilled(action)) {
        enqueueSnackbar(`Client "${action.payload.email}" created`, { variant: 'success' });
        fetchPage();
      } else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newClient, fetchPage],
  );

  const onFormShow = useCallback(() => dispatch(changeVisibilityAddClientForm(true)), [dispatch]);

  const onPaginationModelChange = useCallback(
    params => {
      setPage(params.page);
      setRowsPerPage(params.pageSize);
    },
    [setPage, setRowsPerPage],
  );

  const columns = [
    { field: 'email', headerName: 'Email', width: 300, flex: 1 },
    { field: 'name', headerName: 'Name', width: 300, flex: 1 },
    {
      field: 'isEmailVerified',
      headerName: 'Email Verified',
      type: 'boolean',
      flex: 1,
    },
    {
      field: 'actions',
      headerName: 'actions',
      type: 'actions',
      width: 100,
      flex: 1,
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
          <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => navigate(`/admin/clients/${row.id}`)} showInMenu />,
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

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Clients Dashboard</h1>
        </center>
        <hr />

        <>
          <Row className="justify-content-md-center">
            <Col className="d-flex justify-content-center">
              <Link to="#">
                <AddCircleOutlineOutlinedIcon onClick={onFormShow} />
              </Link>
            </Col>
          </Row>
          <hr />

          <DataGrid
            autoHeight={true}
            disableRowSelectionOnClick={true}
            rows={clients}
            columns={columns}
            loading={loading}
            hideFooterPagination={loading}
            initialState={{ pagination: { paginationModel: { pageSize: rowsPerPage, page } } }}
            onPaginationModelChange={onPaginationModelChange}
            rowCount={totalItems}
            paginationMode="server"
            pageSizeOptions={PAGINATION_PAGE_SIZE_OPTIONS}
            components={{ LoadingOverlay, NoRowsOverlay: () => NoRowsOverlay({ error }), Toolbar: GridToolbar }}
          />

          <ClientForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New Client'} isModal={true} />
        </>
      </Container>
    </Container>
  );
};

export default AdminDashboardClientsPage;
