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

import { Header, MasterForm, LoadingOverlay, NoRowsOverlay } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchMasters, addMaster, deleteMaster, resetPasswordMaster, resendEmailConfirmationMaster } from '../../../store/thunks';
import { changeVisibilityAddMasterForm } from '../../../store/actions';
import {
  selectAllMasters,
  selectNewMaster,
  selectMasterError,
  selectMasterInitialLoading,
  selectMasterTotalItems,
} from '../../../store/selectors';

import { formatDecimal } from '../../../utils';
import { ERROR_TYPE, PAGINATION_PAGE_SIZE_OPTIONS, MAX_RATING_VALUE, RATING_FORMAT_DECIMAL } from '../../../constants';

const AdminDashboardMasters = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const masters = useSelector(selectAllMasters);
  const newMaster = useSelector(selectNewMaster);
  const error = useSelector(selectMasterError);
  const loading = useSelector(selectMasterInitialLoading);
  const totalItems = useSelector(selectMasterTotalItems);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION_PAGE_SIZE_OPTIONS[0]);

  const fetchPage = useCallback(
    () => dispatch(fetchMasters({ offset: page * rowsPerPage, limit: rowsPerPage })),
    [dispatch, page, rowsPerPage],
  );

  useEffect(() => fetchPage(), [dispatch, fetchPage]);

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
      else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) fetchPage();
      }
    },
    [dispatch, enqueueSnackbar, fetchPage],
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
      else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) fetchPage();
      }
    },
    [dispatch, enqueueSnackbar, fetchPage],
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
      const action = await dispatch(addMaster(newMaster));
      if (isFulfilled(action)) {
        enqueueSnackbar(`Master "${action.payload.email}" created`, { variant: 'success' });
        fetchPage();
      } else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newMaster, fetchPage],
  );

  const onFormShow = useCallback(() => dispatch(changeVisibilityAddMasterForm(true)), [dispatch]);

  const onPaginationModelChange = useCallback(
    params => {
      setPage(params.page);
      setRowsPerPage(params.pageSize);
    },
    [setPage, setRowsPerPage],
  );

  const columns = [
    { field: 'email', headerName: 'Email', flex: 1, width: 300 },
    { field: 'name', headerName: 'Name', flex: 1, width: 300 },
    {
      field: 'cities',
      headerName: 'Cities',
      width: 240,
      flex: 1,
      sortable: false,
      valueFormatter: ({ value }) => value.map(city => city.name).join(', '),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      type: 'number',
      flex: 1,
      valueFormatter: ({ value }) =>
        `${formatDecimal(value, RATING_FORMAT_DECIMAL)}/${formatDecimal(MAX_RATING_VALUE, RATING_FORMAT_DECIMAL)}`,
    },
    {
      field: 'isEmailVerified',
      headerName: 'Email Verified',
      type: 'boolean',
      flex: 1,
    },
    {
      field: 'isApprovedByAdmin',
      headerName: 'Approved',
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

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Masters Dashboard</h1>
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
            rows={masters}
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

          <MasterForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New Master'} isModal={true} />
        </>
      </Container>
    </Container>
  );
};

export default AdminDashboardMasters;
