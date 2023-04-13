import React, { useState, useCallback } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import ImageIcon from '@mui/icons-material/Image';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { OrderImageList } from '../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useSelector, useDispatch } from 'react-redux';

import { completeOrder } from '../../store/thunks';
import { selectAllOrders } from '../../store/selectors';

import { formatDate, formatDecimal } from '../../utils';
import { ORDER_STATUS } from '../../constants';

const MasterOrdersList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

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

  const columns = [
    { field: 'client.name', headerName: 'Client Name', width: 240, valueGetter: ({ row }) => row.client.name },
    { field: 'watch', headerName: 'Service', valueGetter: ({ row }) => row.watch.name },
    { field: 'city', headerName: 'City', width: 200, valueGetter: ({ row }) => row.city.name },
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
      getActions: ({ row }) => {
        const actions = [
          <GridActionsCellItem
            icon={<TaskAltIcon />}
            label="Complete"
            onClick={() => onComplete(row)}
            disabled={row.isCompleting || row.status !== ORDER_STATUS.CONFIRMED}
            showInMenu
          />,
        ];

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

export default MasterOrdersList;
