import React, { useState, useEffect, useCallback } from 'react';
import { Container, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';

import { Header, OrderImageList } from '../../components';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchOrders, completeOrder } from '../../store/thunks';
import {
  selectAllOrders,
  selectOrderError,
  selectOrderInitialLoading,
  selectOrderTotalItems,
  selectOrderCurrentPage,
  selectOrderPageSize,
  selectOrderSortFielName,
  selectOrderSortOrder,
} from '../../store/selectors';
import { changeOrderCurrentPage, changeOrderPageSize, changeOrderSortFieldName, changeOrderSortOrder } from '../../store/actions';

import { formatDate, formatDecimal } from '../../utils';
import { ERROR_TYPE, PAGINATION_PAGE_SIZE_OPTIONS, ORDER_STATUS } from '../../constants';

const localizer = momentLocalizer(moment);

const MasterScheduleCalendarPage = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

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

  //const [selectedView, setSelectedView] = useState(CalendarView.WEEK);

  return (
    <Container maxWidth={'true'}>
      <Header />
      <Container>
        <center>
          <h1>Master: Orders Schedule</h1>
        </center>
        <hr />

        <Calendar
          localizer={localizer}
          events={orders.map(item => ({ start: item.startDate, end: item.endDate, title: item.id }))}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 650 }}
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

export default MasterScheduleCalendarPage;
