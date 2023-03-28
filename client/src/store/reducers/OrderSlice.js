/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { fetchOrders, addOrder, deleteOrder, fetchOrder, updateOrder, completeOrder, cancelOrder, rateOrder } from './ActionCreators';
import { dateToNearestHour, isGlobalErrorType } from '../../utils';
import { ERROR_TYPE, MAX_RATING_VALUE, ORDER_STATUS } from '../../constants';

const initEmptyOrder = () => ({
  client: { name: '', email: '' },
  master: null,
  city: null,
  watch: null,
  startDate: dateToNearestHour().getTime(),
  rating: MAX_RATING_VALUE,
});
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });

const initialState = {
  orders: [],
  newOrder: initEmptyOrder(),
  oldOrder: initEmptyOrder(),
  error: initEmptyError(),
  isInitialLoading: false,
  isShowRateForm: false,
  isPending: false,
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    changeVisibilityRateForm(state, action) {
      state.isShowRateForm = action.payload;
      state.newOrder = initEmptyOrder();
    },
    changeNewOrderField(state, action) {
      // Max one level depth
      const [head, ...rest] = action.payload.name.split('.');
      if (!rest.length) state.newOrder[head] = action.payload.value;
      else state.newOrder[head][rest[0]] = action.payload.value;
    },
    resetNewOrder(state, action) {
      state.newOrder = action.payload || initEmptyOrder();
    },
  },
  extraReducers: {
    //#region Fetch all orders
    [fetchOrders.pending]: (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    },
    [fetchOrders.fulfilled]: (state, action) => {
      state.orders = action.payload.map(order => {
        order.isCompleting = false;
        order.isCanceling = false;
        order.isEvaluating = false;
        return order;
      });
      state.isInitialLoading = false;
      state.error = initEmptyError();
    },
    [fetchOrders.rejected]: (state, action) => {
      state.isInitialLoading = false;
      state.error = action.payload;
    },
    //#endregion
    //#region Create new order
    [addOrder.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [addOrder.fulfilled]: (state, action) => {
      state.orders = [{ ...action.payload, isCompleting: false, isCanceling: false, isEvaluating: false }, ...state.orders];
      state.isPending = false;
      state.newOrder = initEmptyOrder();
      state.error = initEmptyError();
    },
    [addOrder.rejected]: (state, action) => {
      state.isPending = false;
      if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.ACCESS_DENIED])) state.error = action.payload;
    },
    //#endregion

    //#region Delete order by id
    [deleteOrder.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [deleteOrder.fulfilled]: (state, action) => {
      state.orders = state.orders.filter(order => order.id !== action.payload);
      state.isPending = false;
      state.error = initEmptyError();
    },
    [deleteOrder.rejected]: (state, action) => {
      state.isPending = false;

      if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
        state.orders = state.orders.filter(order => order.id !== action.payload.id);
      }

      if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = action.payload;
    },
    //#endregion

    //#region Get order by id
    [fetchOrder.pending]: (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newOrder = initEmptyOrder();
      state.oldOrder = initEmptyOrder();
    },
    [fetchOrder.fulfilled]: (state, action) => {
      state.isInitialLoading = false;
      state.error = initEmptyError();
      state.newOrder = action.payload;
      state.oldOrder = action.payload;
    },
    [fetchOrder.rejected]: (state, action) => {
      state.isInitialLoading = false;
      state.error = action.payload;
    },
    //#endregion

    //#region Update order by id
    [updateOrder.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [updateOrder.fulfilled]: (state, action) => {
      state.isPending = false;
      state.error = initEmptyError();
      state.newOrder = action.payload;
      state.oldOrder = action.payload;
    },
    [updateOrder.rejected]: (state, action) => {
      state.isPending = false;
      state.newOrder = state.oldOrder;
      if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = action.payload;
    },
    //#endregion

    //#region complete order by id
    [completeOrder.pending]: (state, action) => {
      const orderId = action.meta.arg;
      const idx = state.orders.map(order => order.id).indexOf(orderId);
      state.orders[idx].isCompleting = true;
      state.error = initEmptyError();
    },
    [completeOrder.fulfilled]: (state, action) => {
      const idx = state.orders.map(order => order.id).indexOf(action.payload);
      state.orders[idx].isCompleting = false;
      state.orders[idx].status = ORDER_STATUS.COMPLETED;
      state.error = initEmptyError();
    },
    [completeOrder.rejected]: (state, action) => {
      const idx = state.orders.map(order => order.id).indexOf(action.payload.id);
      state.orders[idx].isCompleting = false;
      if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.orders.filter(order => order.id !== action.payload.id);
    },
    //#endregion

    //#region cancel order by id
    [cancelOrder.pending]: (state, action) => {
      const orderId = action.meta.arg;
      const idx = state.orders.map(order => order.id).indexOf(orderId);
      state.orders[idx].isCanceling = true;
      state.error = initEmptyError();
    },
    [cancelOrder.fulfilled]: (state, action) => {
      const idx = state.orders.map(order => order.id).indexOf(action.payload);
      state.orders[idx].isCanceling = false;
      state.orders[idx].status = ORDER_STATUS.CANCELED;
      state.error = initEmptyError();
    },
    [cancelOrder.rejected]: (state, action) => {
      state.isPending = false;
      const idx = state.orders.map(order => order.id).indexOf(action.payload.id);
      state.orders[idx].isCanceling = false;
      if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.orders.filter(order => order.id !== action.payload.id);
    },
    //#endregion

    //#region rate order by id
    [rateOrder.pending]: (state, action) => {
      const idx = state.orders.map(order => order.id).indexOf(action.meta.arg.id);
      state.orders[idx].isEvaluating = true;
      state.error = initEmptyError();
    },
    [rateOrder.fulfilled]: (state, action) => {
      const idx = state.orders.map(order => order.id).indexOf(action.payload.id);
      state.orders[idx].isEvaluating = false;
      state.orders[idx].rating = action.payload.rating;
      state.error = initEmptyError();
    },
    [rateOrder.rejected]: (state, action) => {
      const idx = state.orders.map(order => order.id).indexOf(action.payload.id);
      state.orders[idx].isEvaluating = false;
      if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.orders.filter(order => order.id !== action.payload.id);
    },
    //#endregion
  },
});

export const { changeVisibilityRateForm, changeNewOrderField, resetNewOrder } = orderSlice.actions;
export default orderSlice.reducer;
