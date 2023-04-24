import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';

import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DialogContent from '@mui/material/DialogContent';
import Dialog from '@mui/material/Dialog';
import ImageIcon from '@mui/icons-material/Image';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import DialogTitle from '@mui/material/DialogTitle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';

import { Header, OrderImageList, LoadingOverlay, NoRowsOverlay, DataGridFilterContainer } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchOrders, deleteOrder, completeOrder, cancelOrder } from '../../../store/thunks';
import {
  changeOrderCurrentPage,
  changeOrderPageSize,
  changeOrderSortFieldName,
  changeOrderSortOrder,
  changeOrderFilters,
} from '../../../store/actions';
import {
  selectAllOrders,
  selectOrderError,
  selectOrderInitialLoading,
  selectOrderTotalItems,
  selectOrderCurrentPage,
  selectOrderPageSize,
  selectOrderSortFielName,
  selectOrderSortOrder,
  selectOrderFilters,
} from '../../../store/selectors';

import { formatDate, formatDecimal, buildFilter } from '../../../utils';
import { ERROR_TYPE, PAGINATION_PAGE_SIZE_OPTIONS, MAX_RATING_VALUE, RATING_FORMAT_DECIMAL, ORDER_STATUS } from '../../../constants';

const AdminDashboardOrdersPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = useSelector(selectAllOrders);
  const error = useSelector(selectOrderError);
  const loading = useSelector(selectOrderInitialLoading);
  const totalItems = useSelector(selectOrderTotalItems);

  const page = useSelector(selectOrderCurrentPage);
  const pageSize = useSelector(selectOrderPageSize);

  const sortFieldName = useSelector(selectOrderSortFielName);
  const sortOrder = useSelector(selectOrderSortOrder);

  const filters = useSelector(selectOrderFilters);

  const fetchPage = useCallback(
    () =>
      dispatch(
        fetchOrders({ offset: page * pageSize, limit: pageSize, orderBy: sortFieldName, order: sortOrder, filter: buildFilter(filters) }),
      ),
    [dispatch, page, pageSize, sortFieldName, sortOrder, filters],
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
      else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) fetchPage();
      }
    },
    [dispatch, enqueueSnackbar, fetchPage],
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
      else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) fetchPage();
      }
    },
    [dispatch, enqueueSnackbar, fetchPage],
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

  const onFilterApply = useCallback(
    selectedFilters => {
      dispatch(changeOrderFilters(selectedFilters));
    },
    [dispatch],
  );

  const columns = useMemo(
    () => [
      {
        field: 'client.email',
        headerName: 'Client Email',
        flex: 1,
        valueGetter: ({ row }) => row.client.email,
      },
      {
        field: 'client.name',
        headerName: 'Client Name',
        flex: 1,
        valueGetter: ({ row }) => row.client.name,
      },
      {
        field: 'master.email',
        headerName: 'Master Email',
        flex: 1,
        valueGetter: ({ row }) => row.master.email,
      },
      {
        field: 'master.name',
        headerName: 'Master Name',
        flex: 1,
        valueGetter: ({ row }) => row.master.name,
      },
      {
        field: 'master.rating',
        headerName: 'Master Rating',
        type: 'number',
        flex: 1,
        valueGetter: ({ row }) =>
          `${formatDecimal(row.master.rating, RATING_FORMAT_DECIMAL)}/${formatDecimal(MAX_RATING_VALUE, RATING_FORMAT_DECIMAL)}`,
      },
      {
        field: 'city.name',
        headerName: 'City',
        flex: 1,
        valueGetter: ({ row }) => row.city.name,
      },
      {
        field: 'watch.repairTime',
        headerName: 'Clock',
        type: 'number',
        flex: 1,
        valueGetter: ({ row }) => `${row.watch.name} (${row.watch.repairTime}h)`,
      },
      {
        field: 'startDate',
        headerName: 'Start Date/Time',
        width: 140,
        type: 'dateTime',
        flex: 1,
        valueFormatter: ({ value }) => formatDate(value),
      },
      {
        field: 'endDate',
        headerName: 'End Date/Time',
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
        width: 100,
        flex: 1,
        filterable: false,
        disableReorder: true,
        getActions: ({ row }) => {
          const actions = [<GridActionsCellItem icon={<DeleteForeverIcon />} label="Delete" onClick={() => onRemove(row)} showInMenu />];

          if (row.status === ORDER_STATUS.CONFIRMED) {
            actions.unshift(
              <GridActionsCellItem
                icon={<TaskAltIcon />}
                label="Complete Order"
                onClick={() => onComplete(row)}
                disabled={row.isCompleting || row.isCanceling}
                showInMenu
              />,
              <GridActionsCellItem
                icon={<DoNotDisturbAltIcon />}
                label="Cancel Order"
                onClick={() => onCancel(row)}
                disabled={row.isCompleting || row.isCanceling}
                showInMenu
              />,
              <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => navigate(`/admin/orders/${row.id}`)} showInMenu />,
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
    ],
    [navigate, onComplete, onCancel, onImagePreviewOpen, onRemove],
  );

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Orders</h1>
        </center>
        <hr />

        <DataGridFilterContainer columns={columns} filters={filters} onApply={onFilterApply} />
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

export default AdminDashboardOrdersPage;
