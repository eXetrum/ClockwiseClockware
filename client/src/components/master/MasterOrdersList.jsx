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
import { useDispatch } from 'react-redux';

import { completeOrder } from '../../store/thunks';

import { formatDate, formatDecimal } from '../../utils';
import { ORDER_STATUS } from '../../constants';

const MasterOrdersList = ({ orders }) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

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
    { field: 'client.name', headerName: 'Client Name', width: 240, valueGetter: params => params.row.client.name },
    { field: 'watch', headerName: 'Service', valueGetter: params => params.row.watch.name },
    { field: 'city', headerName: 'City', width: 200, valueGetter: params => params.row.city.name },
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
      getActions: params => {
        const actions = [
          <GridActionsCellItem
            icon={<TaskAltIcon />}
            label="Complete"
            onClick={() => onComplete(params.row)}
            disabled={params.row.isCompleting || params.row.status !== ORDER_STATUS.CONFIRMED}
            showInMenu
          />,
        ];

        if (params.row.images.length) {
          actions.unshift(
            <GridActionsCellItem
              icon={<ImageIcon />}
              label="Show Images"
              onClick={async () => onImagePreviewOpen(params.row)}
              showInMenu
            />,
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
