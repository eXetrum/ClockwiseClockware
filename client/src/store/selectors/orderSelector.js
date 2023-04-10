import { createSelector } from '@reduxjs/toolkit';

const stateAllOrders = state => state.orderReducer.orders;
const stateNewOrder = state => state.orderReducer.newOrder;
const stateOldOrder = state => state.orderReducer.oldOrder;
const stateOrderError = state => state.orderReducer.error;
const stateOrderInitialLoading = state => state.orderReducer.isInitialLoading;
const stateOrderPending = state => state.orderReducer.isPending;
const stateOrderShowRateForm = state => state.orderReducer.isShowRateForm;
const stateOrderTotalItems = state => state.orderReducer.totalItems;
const stateOrderCurrentPage = state => state.orderReducer.currentPage;
const stateOrderRowsPerPage = state => state.orderReducer.rowsPerPage;

export const selectAllOrders = createSelector([stateAllOrders], allOrders => allOrders);
export const selectNewOrder = createSelector([stateNewOrder], newOrder => newOrder);
export const selectOldOrder = createSelector([stateOldOrder], oldOrder => oldOrder);
export const selectOrderError = createSelector([stateOrderError], orderError => orderError);
export const selectOrderInitialLoading = createSelector([stateOrderInitialLoading], loading => loading);
export const selectOrderPending = createSelector([stateOrderPending], pending => pending);
export const selectOrderShowRateForm = createSelector([stateOrderShowRateForm], isShowForm => isShowForm);
export const selectOrderTotalItems = createSelector([stateOrderTotalItems], totalItems => totalItems);
export const selectOrderCurrentPage = createSelector([stateOrderCurrentPage], currentPage => currentPage);
export const selectOrderRowsPerPage = createSelector([stateOrderRowsPerPage], rowsPerPage => rowsPerPage);
