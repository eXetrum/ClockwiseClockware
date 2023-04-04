import React, { useState, useCallback } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import ImageIcon from '@mui/icons-material/Image';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';

import { OrderImageList } from '../../components';

import { formatDecimal, formatDate } from '../../utils';
import { MAX_RATING_VALUE, ORDER_STATUS, RATING_FORMAT_DECIMAL } from '../../constants';

const ClientOrdersList = ({ orders, onReview }) => {
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

  const columns = [
    { field: 'master.name', headerName: 'Master Name', width: 240, valueGetter: params => params.row.master.name },
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
      field: 'rating',
      headerName: 'Rating',
      headerAlign: 'center',
      width: 120,
      align: 'center',
      valueGetter: params => {
        if (params.row.rating === null) return '-';
        return `${formatDecimal(params.row.rating, RATING_FORMAT_DECIMAL)}/${formatDecimal(MAX_RATING_VALUE, RATING_FORMAT_DECIMAL)}`;
      },
    },
    {
      field: 'actions',
      headerName: 'actions',
      type: 'actions',
      getActions: params => {
        const actions = [];
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

        if (params.row.status === ORDER_STATUS.COMPLETED && params.row.rating === null) {
          actions.unshift(
            <GridActionsCellItem
              icon={<ThumbUpOutlinedIcon />}
              label="Rate"
              onClick={() => onReview(params.row)}
              disabled={params.row.isEvaluating}
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

export default ClientOrdersList;
