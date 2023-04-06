import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Row } from 'react-bootstrap';
import { useSnackbar } from 'notistack';

import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import { Dialog, DialogContent, DialogTitle, Rating } from '@mui/material';

import ImageIcon from '@mui/icons-material/Image';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';

import { Header, ModalForm, OrderImageList, LoadingOverlay, NoRowsOverlay } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchOrders, rateOrder } from '../../../store/thunks';
import {
  selectAllOrders,
  selectOrderError,
  selectOrderInitialLoading,
  selectOrderTotalItems,
  selectOrderPending,
  selectOrderShowRateForm,
} from '../../../store/selectors';
import { changeVisibilityRateForm } from '../../../store/actions';

import { formatDate, formatDecimal } from '../../../utils';
import {
  ERROR_TYPE,
  PAGINATION_PAGE_SIZE_OPTIONS,
  RATING_PRECISION_STEP,
  MAX_RATING_VALUE,
  RATING_FORMAT_DECIMAL,
  ORDER_STATUS,
} from '../../../constants';

const ClientDashboardOrdersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const orders = useSelector(selectAllOrders);
  const error = useSelector(selectOrderError);
  const loading = useSelector(selectOrderInitialLoading);
  const totalItems = useSelector(selectOrderTotalItems);
  const isPending = useSelector(selectOrderPending);
  const isShowRateForm = useSelector(selectOrderShowRateForm);

  const [rating, setRating] = useState(MAX_RATING_VALUE);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION_PAGE_SIZE_OPTIONS[0]);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchPage = useCallback(
    () => dispatch(fetchOrders({ offset: page * rowsPerPage, limit: rowsPerPage })),
    [dispatch, page, rowsPerPage],
  );

  useEffect(() => fetchPage(), [dispatch, fetchPage]);

  const onImagePreviewOpen = useCallback(order => {
    setOpen(true);
    setSelectedOrder(order);
  }, []);

  const onImagePreviewClose = useCallback(() => {
    setOpen(false);
    setSelectedOrder(null);
  }, []);

  const onReview = useCallback(
    async order => {
      setSelectedOrder(order);
      dispatch(changeVisibilityRateForm(true));
    },
    [dispatch],
  );

  const onSubmit = useCallback(
    async event => {
      event.preventDefault();
      dispatch(changeVisibilityRateForm(false));
      const action = await dispatch(rateOrder({ id: selectedOrder?.Id, rating }));
      setSelectedOrder(null);

      if (isFulfilled(action)) enqueueSnackbar(`Order "${selectedOrder?.id}" rated with value=${rating}`, { variant: 'success' });
      else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) fetchPage();
      }
    },
    [dispatch, enqueueSnackbar, fetchPage, selectedOrder, rating],
  );

  const onHide = useCallback(() => dispatch(changeVisibilityRateForm(false)), [dispatch]);
  const onRatingChange = useCallback((event, value) => setRating(value), []);

  const onPaginationModelChange = useCallback(
    params => {
      setPage(params.page);
      setRowsPerPage(params.pageSize);
    },
    [setPage, setRowsPerPage],
  );

  const columns = [
    { field: 'master.name', headerName: 'Master Name', width: 240, valueGetter: ({ row }) => row.master.name },
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
      field: 'rating',
      headerName: 'Rating',
      headerAlign: 'center',
      width: 120,
      align: 'center',
      valueGetter: ({ row }) => {
        if (row.rating === null) return '-';
        return `${formatDecimal(row.rating, RATING_FORMAT_DECIMAL)}/${formatDecimal(MAX_RATING_VALUE, RATING_FORMAT_DECIMAL)}`;
      },
    },
    {
      field: 'actions',
      headerName: 'actions',
      type: 'actions',
      getActions: ({ row }) => {
        const actions = [];
        if (row.images.length) {
          actions.unshift(
            <GridActionsCellItem icon={<ImageIcon />} label="Show Images" onClick={() => onImagePreviewOpen(row)} showInMenu />,
          );
        }

        if (row.status === ORDER_STATUS.COMPLETED && row.rating === null) {
          actions.unshift(
            <GridActionsCellItem
              icon={<ThumbUpOutlinedIcon />}
              label="Rate"
              onClick={() => onReview(row)}
              disabled={row.isEvaluating}
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
          <h1>Client: Orders Dashboard</h1>
        </center>
        <hr />

        <DataGrid
          autoHeight={true}
          disableRowSelectionOnClick={true}
          rows={orders}
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

        <Dialog onClose={onImagePreviewClose} open={open} maxWidth={'true'}>
          <DialogTitle>Order images</DialogTitle>
          <DialogContent>
            <OrderImageList images={selectedOrder?.images} />
          </DialogContent>
        </Dialog>

        <ModalForm
          size="sm"
          show={isShowRateForm}
          title={'Rate order'}
          okText={'Apply'}
          onHide={onHide}
          onSubmit={onSubmit}
          isFormValid={() => true}
          isPending={isPending}
          formContent={
            <>
              <Form.Group className="justify-content-md-center">
                <Row md="auto" className="justify-content-md-center">
                  <Rating
                    onChange={onRatingChange}
                    value={rating}
                    disabled={isPending}
                    defaultValue={MAX_RATING_VALUE}
                    precision={RATING_PRECISION_STEP}
                  />
                </Row>
              </Form.Group>
            </>
          }
        />
      </Container>
    </Container>
  );
};

export default ClientDashboardOrdersPage;
