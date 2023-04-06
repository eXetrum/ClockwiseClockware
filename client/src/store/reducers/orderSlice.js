/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { fetchOrders, addOrder, deleteOrder, fetchOrder, updateOrder, completeOrder, cancelOrder, rateOrder } from '../thunks';
import { dateToNearestHour, isGlobalErrorType } from '../../utils';
import { ERROR_TYPE, MAX_RATING_VALUE, ORDER_STATUS } from '../../constants';

const initEmptyOrder = (order = null) => ({
  id: order?.id || -1,
  client: { name: order?.client?.name || '', email: order?.client?.email || '' },
  master: order?.master || null,
  city: order?.city || null,
  watch: order?.watch || null,
  startDate: new Date(order?.startDate || dateToNearestHour()).getTime(),
  rating: MAX_RATING_VALUE,
  images: order?.images || [],
});
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });

const initialState = {
  orders: [],
  newOrder: initEmptyOrder(),
  oldOrder: initEmptyOrder(),
  error: initEmptyError(),
  isInitialLoading: false,
  isPending: false,
  isShowRateForm: false,
  totalItems: 0,
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    changeVisibilityRateForm(state, { payload }) {
      state.isShowRateForm = payload;
      state.newOrder = initEmptyOrder();
      state.oldOrder = initEmptyOrder();
    },
    changeNewOrderField(state, { payload }) {
      // Max one level depth
      const [head, ...rest] = payload.name.split('.');
      if (!rest.length) state.newOrder[head] = payload.value;
      else state.newOrder[head][rest[0]] = payload.value;
    },
    resetNewOrder(state, { payload }) {
      if (payload) state.newOrder = initEmptyOrder(payload);
      else state.newOrder = initEmptyOrder(state.oldOrder);
    },
  },
  extraReducers: {
    //#region Fetch all orders
    [fetchOrders.pending]: state => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    },
    [fetchOrders.fulfilled]: (state, { payload: { orders, total } }) => {
      state.orders = orders.map(order => {
        order.isCompleting = false;
        order.isCanceling = false;
        order.isEvaluating = false;
        return order;
      });
      state.totalItems = total;
      state.isInitialLoading = false;
      state.error = initEmptyError();
    },
    [fetchOrders.rejected]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = payload;
    },
    //#endregion
    //#region Create new order
    [addOrder.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [addOrder.fulfilled]: (state, { payload }) => {
      state.orders.unshift({ ...payload, isCompleting: false, isCanceling: false, isEvaluating: false });
      state.isPending = false;
      state.newOrder = initEmptyOrder();
      state.error = initEmptyError();
    },
    [addOrder.rejected]: (state, { payload }) => {
      state.isPending = false;
      if (isGlobalErrorType(payload.type, [ERROR_TYPE.ACCESS_DENIED])) state.error = payload;
    },
    //#endregion

    //#region Delete order by id
    [deleteOrder.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [deleteOrder.fulfilled]: (state, { payload }) => {
      state.orders = state.orders.filter(order => order.id !== payload);
      state.isPending = false;
      state.error = initEmptyError();
    },
    [deleteOrder.rejected]: (state, { payload }) => {
      state.isPending = false;

      if (payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
        state.orders = state.orders.filter(order => order.id !== payload.id);
      }

      if (isGlobalErrorType(payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = payload;
    },
    //#endregion

    //#region Get order by id
    [fetchOrder.pending]: state => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newOrder = initEmptyOrder();
      state.oldOrder = initEmptyOrder();
    },
    [fetchOrder.fulfilled]: (state, { payload }) => {
      state.error = initEmptyError();
      state.newOrder = initEmptyOrder(payload);
      state.oldOrder = initEmptyOrder(payload);
      state.isInitialLoading = false;
    },
    [fetchOrder.rejected]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = payload;
    },
    //#endregion

    //#region Update order by id
    [updateOrder.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [updateOrder.fulfilled]: (state, { payload }) => {
      state.isPending = false;
      state.error = initEmptyError();
      state.newOrder = initEmptyOrder(payload);
      state.oldOrder = initEmptyOrder(payload);
    },
    [updateOrder.rejected]: (state, { payload }) => {
      state.isPending = false;
      state.newOrder = initEmptyOrder(state.oldOrder);
      if (isGlobalErrorType(payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = payload;
    },
    //#endregion

    //#region complete order by id
    [completeOrder.pending]: (state, { meta }) => {
      const idx = state.orders.map(order => order.id).indexOf(meta.arg);
      state.orders[idx].isCompleting = true;
      state.error = initEmptyError();
    },
    [completeOrder.fulfilled]: (state, { payload }) => {
      const idx = state.orders.map(order => order.id).indexOf(payload);
      state.orders[idx].isCompleting = false;
      state.orders[idx].status = ORDER_STATUS.COMPLETED;
      state.error = initEmptyError();
    },
    [completeOrder.rejected]: (state, { payload }) => {
      const idx = state.orders.map(order => order.id).indexOf(payload.id);
      state.orders[idx].isCompleting = false;
      if (payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.orders.filter(order => order.id !== payload.id);
    },
    //#endregion

    //#region cancel order by id
    [cancelOrder.pending]: (state, { meta }) => {
      const idx = state.orders.map(order => order.id).indexOf(meta.arg);
      state.orders[idx].isCanceling = true;
      state.error = initEmptyError();
    },
    [cancelOrder.fulfilled]: (state, { payload }) => {
      const idx = state.orders.map(order => order.id).indexOf(payload);
      state.orders[idx].isCanceling = false;
      state.orders[idx].status = ORDER_STATUS.CANCELED;
      state.error = initEmptyError();
    },
    [cancelOrder.rejected]: (state, { payload }) => {
      state.isPending = false;
      const idx = state.orders.map(order => order.id).indexOf(payload.id);
      state.orders[idx].isCanceling = false;
      if (payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.orders.filter(order => order.id !== payload.id);
    },
    //#endregion

    //#region rate order by id
    [rateOrder.pending]: (state, { meta }) => {
      const idx = state.orders.map(order => order.id).indexOf(meta.arg.id);
      state.orders[idx].isEvaluating = true;
      state.error = initEmptyError();
    },
    [rateOrder.fulfilled]: (state, { payload }) => {
      const idx = state.orders.map(order => order.id).indexOf(payload.id);
      state.orders[idx].isEvaluating = false;
      state.orders[idx].rating = payload.rating;
      state.error = initEmptyError();
    },
    [rateOrder.rejected]: (state, { payload }) => {
      const idx = state.orders.map(order => order.id).indexOf(payload.id);
      state.orders[idx].isEvaluating = false;
      if (payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.orders.filter(order => order.id !== payload.id);
    },
    //#endregion
  },
});

export const { changeVisibilityRateForm, changeNewOrderField, resetNewOrder } = orderSlice.actions;
export default orderSlice.reducer;
