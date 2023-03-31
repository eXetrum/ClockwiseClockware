import { createSelector } from '@reduxjs/toolkit';

const stateAllOrders = state => state.orderReducer.orders;
const stateNewOrder = state => state.orderReducer.newOrder;
const stateOldOrder = state => state.orderReducer.oldOrder;
const stateOrderError = state => state.orderReducer.error;
const stateOrderInitialLoading = state => state.orderReducer.isInitialLoading;
const stateOrderPending = state => state.orderReducer.isPending;
const stateOrderShowRateForm = state => state.orderReducer.isShowRateForm;

export const selectAllOrders = createSelector([stateAllOrders], allOrders => allOrders);
export const selectNewOrder = createSelector([stateNewOrder], newOrder => newOrder);
export const selectOldOrder = createSelector([stateOldOrder], oldOrder => oldOrder);
export const selectOrderError = createSelector([stateOrderError], cityError => cityError);
export const selectOrderInitialLoading = createSelector([stateOrderInitialLoading], loading => loading);
export const selectOrderPending = createSelector([stateOrderPending], pending => pending);
export const selectOrderShowRateForm = createSelector([stateOrderShowRateForm], isShowForm => isShowForm);
