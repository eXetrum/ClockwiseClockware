import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Alert } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import { deleteOrder, completeOrder, cancelOrder } from '../../store/thunks';

import { formatDate, formatDecimal } from '../../utils';
import { MAX_RATING_VALUE, ORDER_STATUS } from '../../constants';

const AdminOrdersList = ({ orders }) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onRemove = useCallback(
    async order => {
      const result = await confirm(`Do you want to delete ${order.id} order ?`, {
        title: 'Confirm',
        okText: 'Delete',
        okButtonStyle: 'danger',
      });
      if (!result) return;

      const action = await dispatch(deleteOrder(order.id));
      if (isFulfilled(action)) enqueueSnackbar(`Order "${order.id}" removed`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar],
  );

  const onComplete = useCallback(
    async order => {
      const result = await confirm(`Do you want to mark order with id=${order.id} as completed ?`, {
        title: 'Confirm',
        okText: 'Completed',
        okButtonStyle: 'success',
      });
      if (!result) return;

      const action = await dispatch(completeOrder(order.id));
      if (isFulfilled(action)) enqueueSnackbar(`Order "${order.id}" maked as completed`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar],
  );

  const onCancel = useCallback(
    async order => {
      const result = await confirm(`Do you want to mark order with id=${order.id} as canceled ?`, {
        title: 'Confirm',
        okText: 'Canceled',
        okButtonStyle: 'success',
      });
      if (!result) return;

      const action = await dispatch(cancelOrder(order.id));
      if (isFulfilled(action)) enqueueSnackbar(`Order "${order.id}" maked as canceled`, { variant: 'success' });
      else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar],
  );

  const columns = [
    {
      field: 'client.email',
      headerName: 'Client Email',
      valueGetter: params => params.row.client.email,
    },
    {
      field: 'client.name',
      headerName: 'Client Name',
      valueGetter: params => params.row.client.name,
    },
    {
      field: 'master.email',
      headerName: 'Master Email',
      valueGetter: params => params.row.master.email,
    },
    {
      field: 'master.name',
      headerName: 'Master Name',
      valueGetter: params => params.row.master.name,
    },
    {
      field: 'master.rating',
      headerName: 'Master Rating',
      type: 'number',
      valueGetter: params => `${formatDecimal(params.row.master.rating, 1)}/${formatDecimal(MAX_RATING_VALUE, 1)}`,
    },
    {
      field: 'city',
      headerName: 'City',
      valueGetter: params => params.row.city.name,
    },
    {
      field: 'watch',
      headerName: 'Clock',
      valueFormatter: ({ value }) => `${value.name} (${value.repairTime}h)`,
    },
    {
      field: 'startDate',
      headerName: 'Date Start',
      width: 140,
      type: 'dateTime',
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      field: 'endDate',
      headerName: 'End Start',
      width: 140,
      type: 'dateTime',
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      field: 'status',
      headerName: 'Status',
    },
    {
      field: 'totalCost',
      headerName: 'Total Cost',
      type: 'number',
      valueFormatter: ({ value }) => formatDecimal(value),
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
            icon={<EditIcon />}
            label="Edit"
            onClick={() => navigate(`/admin/orders/${params.row.id}`)}
            disabled={params.row.status !== ORDER_STATUS.CONFIRMED}
            showInMenu
          />,
          <GridActionsCellItem icon={<DeleteForeverIcon />} label="Delete" onClick={async () => onRemove(params.row)} showInMenu />,
        ];
        if (params.row.status === ORDER_STATUS.CONFIRMED) {
          actions.unshift(
            <GridActionsCellItem
              icon={<DoNotDisturbAltIcon />}
              label="Cancel"
              onClick={async () => onCancel(params.row)}
              disabled={params.row.isCompleting || params.row.isCanceling}
              showInMenu
            />,
          );
          actions.unshift(
            <GridActionsCellItem
              icon={<TaskAltIcon />}
              label="Complete"
              onClick={async () => onComplete(params.row)}
              disabled={params.row.isCompleting || params.row.isCanceling}
              showInMenu
            />,
          );
        }

        return actions;
      },
    },
  ];

  if (orders.length === 0) {
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

  return <DataGrid rows={orders} columns={columns} rowsPerPageOptions={[]} hideFooter={true} autoHeight />;
};

export default AdminOrdersList;
