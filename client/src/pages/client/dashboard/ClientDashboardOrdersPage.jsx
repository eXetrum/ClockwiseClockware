import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Form, Row } from 'react-bootstrap';
import { useSnackbar } from 'notistack';

import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Dialog, DialogContent, DialogTitle, Rating } from '@mui/material';

import { PayPalButtons } from '@paypal/react-paypal-js';

import ImageIcon from '@mui/icons-material/Image';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import PaymentIcon from '@mui/icons-material/Payment';

import { Header, ModalForm, OrderImageList, LoadingOverlay, NoRowsOverlay } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchOrders, rateOrder, checkoutOrder } from '../../../store/thunks';
import {
  selectAllOrders,
  selectOrderError,
  selectOrderInitialLoading,
  selectOrderPending,
  selectOrderShowRateForm,
  selectOrderTotalItems,
  selectOrderCurrentPage,
  selectOrderPageSize,
  selectOrderSortFielName,
  selectOrderSortOrder,
} from '../../../store/selectors';
import {
  changeVisibilityRateForm,
  changeOrderCurrentPage,
  changeOrderPageSize,
  changeOrderSortFieldName,
  changeOrderSortOrder,
} from '../../../store/actions';

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

  const [rating, setRating] = useState(MAX_RATING_VALUE);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openImages, setOpenImages] = useState(false);
  const [openCheckout, setOpenCheckout] = useState(false);

  const orders = useSelector(selectAllOrders);
  const error = useSelector(selectOrderError);
  const loading = useSelector(selectOrderInitialLoading);
  const isPending = useSelector(selectOrderPending);
  const isShowRateForm = useSelector(selectOrderShowRateForm);
  const totalItems = useSelector(selectOrderTotalItems);

  const page = useSelector(selectOrderCurrentPage);
  const pageSize = useSelector(selectOrderPageSize);

  const sortFieldName = useSelector(selectOrderSortFielName);
  const sortOrder = useSelector(selectOrderSortOrder);

  const fetchPage = useCallback(
    () => dispatch(fetchOrders({ offset: page * pageSize, limit: pageSize, orderBy: sortFieldName, order: sortOrder })),
    [dispatch, page, pageSize, sortFieldName, sortOrder],
  );

  useEffect(() => fetchPage(), [fetchPage]);

  const onImagePreviewOpen = useCallback(order => {
    setOpenImages(true);
    setSelectedOrder(order);
  }, []);

  const onImagePreviewClose = useCallback(() => {
    setOpenImages(false);
    setSelectedOrder(null);
  }, []);

  const onReviewStart = useCallback(
    async order => {
      setSelectedOrder(order);
      dispatch(changeVisibilityRateForm(true));
    },
    [dispatch],
  );

  //openCheckout
  const onCheckoutOpen = useCallback(order => {
    setSelectedOrder(order);
    setOpenCheckout(true);
  }, []);
  const onCheckoutClose = useCallback(() => {
    setSelectedOrder(null);
    setOpenCheckout(false);
  }, []);

  const onSubmit = useCallback(
    async event => {
      event.preventDefault();
      dispatch(changeVisibilityRateForm(false));
      const action = await dispatch(rateOrder({ id: selectedOrder?.id, rating }));
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
      if (params.page !== page) dispatch(changeOrderCurrentPage(params.page));
      if (params.pageSize !== pageSize) dispatch(changeOrderPageSize(params.pageSize));
    },
    [dispatch, page, pageSize],
  );
  const onSortModelChange = useCallback(
    params => {
      const { field: fieldName = '', sort: order = '' } = params.length ? params[0] : {};
      if (fieldName !== sortFieldName) dispatch(changeOrderSortFieldName(fieldName));
      if (order !== sortOrder) dispatch(changeOrderSortOrder(order));
    },
    [dispatch, sortFieldName, sortOrder],
  );

  const columns = useMemo(
    () => [
      { field: 'master.name', headerName: 'Master Name', width: 240, flex: 1, valueGetter: ({ row }) => row.master.name },
      { field: 'watch.repairTime', headerName: 'Service', type: 'number', flex: 1, valueGetter: ({ row }) => row.watch.name },
      { field: 'city.name', headerName: 'City', width: 200, flex: 1, valueGetter: ({ row }) => row.city.name },
      {
        field: 'startDate',
        headerName: 'Date Start',
        width: 140,
        type: 'dateTime',
        flex: 1,
        valueFormatter: ({ value }) => formatDate(value),
      },
      {
        field: 'endDate',
        headerName: 'End Start',
        width: 140,
        type: 'dateTime',
        flex: 1,
        valueFormatter: ({ value }) => formatDate(value),
      },
      {
        field: 'status',
        headerName: 'Status',
        type: 'enum_orders_status',
        flex: 1,
      },
      {
        field: 'totalCost',
        headerName: 'Total Cost',
        type: 'number',
        flex: 1,
        valueFormatter: ({ value }) => formatDecimal(value),
      },
      {
        field: 'rating',
        headerName: 'Rating',
        type: 'number',
        headerAlign: 'center',
        width: 120,
        align: 'center',
        flex: 1,
        valueGetter: ({ row }) => {
          if (row.rating === null) return '-';
          return `${formatDecimal(row.rating, RATING_FORMAT_DECIMAL)}/${formatDecimal(MAX_RATING_VALUE, RATING_FORMAT_DECIMAL)}`;
        },
      },
      {
        field: 'actions',
        headerName: 'actions',
        type: 'actions',
        flex: 1,
        filterable: false,
        disableReorder: true,
        getActions: ({ row }) => {
          const actions = [];
          if (row.images.length) {
            actions.unshift(
              <GridActionsCellItem icon={<ImageIcon />} label="Show Images" onClick={() => onImagePreviewOpen(row)} showInMenu />,
            );
          }

          if (row.status === ORDER_STATUS.WAITING_FOR_PAYMENT) {
            actions.unshift(
              <GridActionsCellItem
                icon={<PaymentIcon />}
                label="Pay Order"
                onClick={() => onCheckoutOpen(row)}
                disabled={row.isEvaluating}
                showInMenu
              />,
            );
          }

          if (row.status === ORDER_STATUS.COMPLETED && row.rating === null) {
            actions.unshift(
              <GridActionsCellItem
                icon={<ThumbUpOutlinedIcon />}
                label="Rate Order"
                onClick={() => onReviewStart(row)}
                disabled={row.isEvaluating}
                showInMenu
              />,
            );
          }

          return actions;
        },
      },
    ],
    [onImagePreviewOpen, onReviewStart, onCheckoutOpen],
  );

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Client: Orders Dashboard</h1>
        </center>
        <hr />

        <DataGrid
          autoHeight
          disableRowSelectionOnClick
          disableColumnFilter
          rows={orders}
          columns={columns}
          loading={loading}
          hideFooterPagination={loading}
          paginationMode="server"
          sortingMode="server"
          filterMode="server"
          initialState={{
            pagination: { paginationModel: { pageSize, page } },
            sorting: { sortModel: [{ field: sortFieldName, sort: sortOrder }] },
          }}
          onPaginationModelChange={onPaginationModelChange}
          onSortModelChange={onSortModelChange}
          rowCount={totalItems}
          pageSizeOptions={PAGINATION_PAGE_SIZE_OPTIONS}
          components={{ LoadingOverlay, NoRowsOverlay: () => NoRowsOverlay({ error }) }}
        />

        <Dialog onClose={onImagePreviewClose} open={openImages} maxWidth={'true'}>
          <DialogTitle>Order images</DialogTitle>
          <DialogContent>
            <OrderImageList images={selectedOrder?.images} />
          </DialogContent>
        </Dialog>

        <Dialog onClose={onCheckoutClose} open={openCheckout} maxWidth={'true'}>
          <DialogTitle>Order Checkout</DialogTitle>
          <DialogContent>
            <PayPalButtons
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: 'CAPTURE',
                  purchase_units: [
                    {
                      custom_id: selectedOrder.id,
                      description: `Service: ${selectedOrder.watch.name} (${selectedOrder.watch.repairTime}h)`,
                      amount: {
                        value: selectedOrder.totalCost,
                        currency_code: 'USD',
                      },
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                return actions.order.capture().then(async details => {
                  const orderId = details.purchase_units[0].custom_id;

                  const action = await dispatch(checkoutOrder({ id: orderId, transactionId: details.id }));
                  if (isFulfilled(action)) enqueueSnackbar(`Payment for order="${orderId}" completed`, { variant: 'success' });
                  else if (isRejected(action)) {
                    enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
                    if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) fetchPage();
                  }
                  onCheckoutClose();
                });
              }}
              onCancel={() => {
                enqueueSnackbar('PayPal payment cancel', { variant: 'warning' });
                onCheckoutClose();
              }}
              onError={error => {
                enqueueSnackbar(`Error: ${error}`, { variant: 'error' });
                onCheckoutClose();
              }}
            />
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
