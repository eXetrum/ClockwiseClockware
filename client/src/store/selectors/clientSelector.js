import { createSelector } from '@reduxjs/toolkit';

const stateAllClients = state => state.clientReducer.clients;
const stateNewClient = state => state.clientReducer.newClient;
const stateOldClient = state => state.clientReducer.oldClient;
const stateClientError = state => state.clientReducer.error;
const stateClientInitialLoading = state => state.clientReducer.isInitialLoading;
const stateClientPending = state => state.clientReducer.isPending;
const stateClientShowAddForm = state => state.clientReducer.isShowAddForm;
const stateClientTotalItems = state => state.clientReducer.totalItems;

export const selectAllClients = createSelector([stateAllClients], allClients => allClients);
export const selectNewClient = createSelector([stateNewClient], newClient => newClient);
export const selectOldClient = createSelector([stateOldClient], oldClient => oldClient);
export const selectClientError = createSelector([stateClientError], clientError => clientError);
export const selectClientInitialLoading = createSelector([stateClientInitialLoading], loading => loading);
export const selectClientPending = createSelector([stateClientPending], pending => pending);
export const selectClientShowAddForm = createSelector([stateClientShowAddForm], isShowForm => isShowForm);
export const selectClientTotalItems = createSelector([stateClientTotalItems], totalItems => totalItems);
