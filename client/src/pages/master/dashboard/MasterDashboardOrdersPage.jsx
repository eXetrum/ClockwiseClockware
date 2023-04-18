import React, { useState, useEffect, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';

import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import TaskAltIcon from '@mui/icons-material/TaskAltOutlined';
import ImageIcon from '@mui/icons-material/Image';

import { Header, OrderImageList, LoadingOverlay, NoRowsOverlay } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchOrders, completeOrder } from '../../../store/thunks';
import {
  selectAllOrders,
  selectOrderError,
  selectOrderInitialLoading,
  selectOrderTotalItems,
  selectOrderCurrentPage,
  selectOrderPageSize,
  selectOrderSortFielName,
  selectOrderSortOrder,
} from '../../../store/selectors';
import { changeOrderCurrentPage, changeOrderPageSize, changeOrderSortFieldName, changeOrderSortOrder } from '../../../store/actions';

import { formatDate, formatDecimal } from '../../../utils';
import { ERROR_TYPE, PAGINATION_PAGE_SIZE_OPTIONS, ORDER_STATUS } from '../../../constants';

const MasterDashboardOrdersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);

  const orders = useSelector(selectAllOrders);
  const error = useSelector(selectOrderError);
  const loading = useSelector(selectOrderInitialLoading);
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
      else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) fetchPage();
      }
    },
    [dispatch, enqueueSnackbar, fetchPage],
  );

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

  const columns = [
    { field: 'client.name', headerName: 'Client Name', width: 240, flex: 1, valueGetter: ({ row }) => row.client.name },
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
      field: 'actions',
      headerName: 'actions',
      type: 'actions',
      flex: 1,
      filterable: false,
      disableReorder: true,
      getActions: ({ row }) => {
        const actions = [];
        if (row.status === ORDER_STATUS.CONFIRMED) {
          actions.unshift(
            <GridActionsCellItem
              icon={<TaskAltIcon />}
              label="Complete Order"
              onClick={() => onComplete(row)}
              disabled={row.isCompleting}
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

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Master: Orders Dashboard</h1>
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

        <Dialog onClose={onImagePreviewClose} open={open} maxWidth={'true'}>
          <DialogTitle>Order images</DialogTitle>
          <DialogContent>
            <OrderImageList images={selectedOrder?.images} />
          </DialogContent>
        </Dialog>
      </Container>
    </Container>
  );
};

export default MasterDashboardOrdersPage;
