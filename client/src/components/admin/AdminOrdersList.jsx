import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Alert } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import ImageIcon from '@mui/icons-material/Image';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';

import { OrderImageList } from '../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';
import { deleteOrder, completeOrder, cancelOrder } from '../../store/thunks';
import { selectAllOrders } from '../../store/selectors';

import { formatDate, formatDecimal } from '../../utils';
import { MAX_RATING_VALUE, RATING_FORMAT_DECIMAL, ORDER_STATUS } from '../../constants';

const AdminOrdersList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orders = useSelector(selectAllOrders);

  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const onImagePreviewOpen = useCallback(order => {
    setOpen(true);
    setSelectedOrder(order);
  }, []);

  const onImagePreviewClose = useCallback(() => {
    setOpen(false);
    setSelectedOrder(null);
  }, []);

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
      valueGetter: ({ row }) => row.client.email,
    },
    {
      field: 'client.name',
      headerName: 'Client Name',
      valueGetter: ({ row }) => row.client.name,
    },
    {
      field: 'master.email',
      headerName: 'Master Email',
      valueGetter: ({ row }) => row.master.email,
    },
    {
      field: 'master.name',
      headerName: 'Master Name',
      valueGetter: ({ row }) => row.master.name,
    },
    {
      field: 'master.rating',
      headerName: 'Master Rating',
      type: 'number',
      valueGetter: ({ row }) =>
        `${formatDecimal(row.master.rating, RATING_FORMAT_DECIMAL)}/${formatDecimal(MAX_RATING_VALUE, RATING_FORMAT_DECIMAL)}`,
    },
    {
      field: 'city',
      headerName: 'City',
      valueGetter: ({ row }) => row.city.name,
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
      getActions: ({ row }) => {
        const actions = [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => navigate(`/admin/orders/${row.id}`)}
            disabled={row.status !== ORDER_STATUS.CONFIRMED}
            showInMenu
          />,
          <GridActionsCellItem icon={<DeleteForeverIcon />} label="Delete" onClick={() => onRemove(row)} showInMenu />,
        ];
        if (row.status === ORDER_STATUS.CONFIRMED) {
          actions.unshift(
            <GridActionsCellItem
              icon={<DoNotDisturbAltIcon />}
              label="Cancel"
              onClick={() => onCancel(row)}
              disabled={row.isCompleting || row.isCanceling}
              showInMenu
            />,
          );
          actions.unshift(
            <GridActionsCellItem
              icon={<TaskAltIcon />}
              label="Complete"
              onClick={() => onComplete(row)}
              disabled={row.isCompleting || row.isCanceling}
              showInMenu
            />,
          );
        }
        if (row.images.length) {
          actions.unshift(
            <GridActionsCellItem icon={<ImageIcon />} label="Show Images" onClick={() => onImagePreviewOpen(row)} showInMenu />,
          );
        }

        return actions;
      },
    },
  ];

  if (!orders.length) {
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

  return (
    <>
      <DataGrid rows={orders} columns={columns} rowsPerPageOptions={[]} hideFooter={true} autoHeight />
      <Dialog onClose={onImagePreviewClose} open={open} maxWidth={'true'}>
        <DialogTitle>Order images</DialogTitle>
        <DialogContent>
          <OrderImageList images={selectedOrder?.images} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminOrdersList;
