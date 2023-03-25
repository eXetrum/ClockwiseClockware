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
  startDate: String(dateToNearestHour()),
  rating: MAX_RATING_VALUE,
});
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });
const createNotification = ({ text = '', variant = '' }) => ({ text, variant });

const initialState = {
  orders: [],
  newOrder: initEmptyOrder(),
  oldOrder: initEmptyOrder(),
  error: initEmptyError(),
  isInitialLoading: false,
  isShowRateForm: false,
  isPending: false,
  notification: createNotification({}),
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
      state.newOrder[action.payload.name] = action.payload.value;
    },
    clearNotification(state, _) {
      state.notification = createNotification({});
    },
  },
  extraReducers: (builder) => {
    //#region Fetch all orders
    builder.addCase(fetchOrders.pending, (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    }),
      builder.addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload.map((order) => {
          order.isCompleting = false;
          order.isCanceling = false;
          order.isEvaluating = false;
          return order;
        });
        state.isInitialLoading = false;
        state.error = initEmptyError();
      }),
      builder.addCase(fetchOrders.rejected, (state, action) => {
        state.isInitialLoading = false;
        state.error = action.payload;
      });
    //#endregion
    //#region Create new order
    builder.addCase(addOrder.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(addOrder.fulfilled, (state, action) => {
        state.orders = [{ ...action.payload, isCompleting: false, isCanceling: false, isEvaluating: false }, ...state.orders];
        state.isPending = false;
        state.newOrder = initEmptyOrder();
        state.error = initEmptyError();
        state.notification = createNotification({ text: 'Order placed', variant: 'success' });
      }),
      builder.addCase(addOrder.rejected, (state, action) => {
        state.isPending = false;
        if (isGlobalErrorType(action.payload.type)) state.error = action.payload;
        else state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion

    //#region Delete order by id
    builder.addCase(deleteOrder.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(deleteOrder.fulfilled, (state, action) => {
        const removedOrder = state.orders.find((order) => order.id === action.payload);
        state.orders = state.orders.filter((order) => order.id !== action.payload);
        state.isPending = false;
        state.error = initEmptyError();
        state.notification = createNotification({ text: `Order "${removedOrder.id}" removed`, variant: 'success' });
      }),
      builder.addCase(deleteOrder.rejected, (state, action) => {
        state.isPending = false;

        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
          state.orders = state.orders.filter((order) => order.id !== action.payload.id);
        }

        if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = action.payload;
        else state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion

    //#region Get order by id
    builder.addCase(fetchOrder.pending, (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newOrder = initEmptyOrder();
      state.oldOrder = initEmptyOrder();
    }),
      builder.addCase(fetchOrder.fulfilled, (state, action) => {
        state.isInitialLoading = false;
        state.error = initEmptyError();
        state.newOrder = action.payload;
        state.oldOrder = action.payload;
      }),
      builder.addCase(fetchOrder.rejected, (state, action) => {
        state.isInitialLoading = false;
        state.error = action.payload;
      });
    //#endregion

    //#region Update order by id
    builder.addCase(updateOrder.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(updateOrder.fulfilled, (state, action) => {
        state.isPending = false;
        state.error = initEmptyError();
        state.newOrder = action.payload;
        state.oldOrder = action.payload;
        state.notification = createNotification({ text: `Order ${action.payload.id} updated`, variant: 'success' });
      }),
      builder.addCase(updateOrder.rejected, (state, action) => {
        state.isPending = false;
        state.newOrder = state.oldOrder;
        if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = action.payload;
        else state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion

    //#region complete order by id
    builder.addCase(completeOrder.pending, (state, action) => {
      const orderId = action.meta.arg;
      const idx = state.orders.map((order) => order.id).indexOf(orderId);
      state.orders[idx].isCompleting = true;
      state.error = initEmptyError();
    }),
      builder.addCase(completeOrder.fulfilled, (state, action) => {
        const idx = state.orders.map((order) => order.id).indexOf(action.payload);
        state.orders[idx].isCompleting = false;
        state.orders[idx].status = ORDER_STATUS.COMPLETED;
        state.error = initEmptyError();
        state.notification = createNotification({ text: `Order ${action.payload} completed`, variant: 'success' });
      }),
      builder.addCase(completeOrder.rejected, (state, action) => {
        const idx = state.orders.map((order) => order.id).indexOf(action.payload.id);
        state.orders[idx].isCompleting = false;
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.orders.filter((order) => order.id !== action.payload.id);
        state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion

    //#region cancel order by id
    builder.addCase(cancelOrder.pending, (state, action) => {
      const orderId = action.meta.arg;
      const idx = state.orders.map((order) => order.id).indexOf(orderId);
      state.orders[idx].isCanceling = true;
      state.error = initEmptyError();
    }),
      builder.addCase(cancelOrder.fulfilled, (state, action) => {
        const idx = state.orders.map((order) => order.id).indexOf(action.payload);
        state.orders[idx].isCanceling = false;
        state.orders[idx].status = ORDER_STATUS.CANCELED;
        state.error = initEmptyError();
        state.notification = createNotification({ text: `Order ${action.payload} completed`, variant: 'success' });
      }),
      builder.addCase(cancelOrder.rejected, (state, action) => {
        state.isPending = false;
        const idx = state.orders.map((order) => order.id).indexOf(action.payload.id);
        state.orders[idx].isCanceling = false;
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.orders.filter((order) => order.id !== action.payload.id);
        state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion

    //#region rate order by id
    builder.addCase(rateOrder.pending, (state, action) => {
      const idx = state.orders.map((order) => order.id).indexOf(action.meta.arg.id);
      state.orders[idx].isEvaluating = true;
      state.error = initEmptyError();
    }),
      builder.addCase(rateOrder.fulfilled, (state, action) => {
        const idx = state.orders.map((order) => order.id).indexOf(action.payload.id);
        state.orders[idx].isEvaluating = false;
        state.orders[idx].rating = action.payload.rating;
        state.error = initEmptyError();
        state.notification = createNotification({ text: `Order ${action.payload} completed`, variant: 'success' });
      }),
      builder.addCase(rateOrder.rejected, (state, action) => {
        const idx = state.orders.map((order) => order.id).indexOf(action.payload.id);
        state.orders[idx].isEvaluating = false;
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.orders.filter((order) => order.id !== action.payload.id);
        state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion
  },
});

export default orderSlice.reducer;
