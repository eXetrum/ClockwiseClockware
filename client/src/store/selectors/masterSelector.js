import { createSelector } from '@reduxjs/toolkit';

const stateAllMasters = state => state.masterReducer.masters;
const stateNewMaster = state => state.masterReducer.newMaster;
const stateOldMaster = state => state.masterReducer.oldMaster;
const stateMasterError = state => state.masterReducer.error;
const stateMasterInitialLoading = state => state.masterReducer.isInitialLoading;
const stateMasterPending = state => state.masterReducer.isPending;
const stateMasterShowAddForm = state => state.masterReducer.isShowAddForm;
const stateMasterTotalItems = state => state.masterReducer.totalItems;
const stateMasterCurrentPage = state => state.masterReducer.currentPage;
const stateMasterPageSize = state => state.masterReducer.pageSize;
const stateMasterSortFieldName = state => state.masterReducer.sortFieldName;
const stateMasterSortOrder = state => state.masterReducer.sortOrder;

export const selectAllMasters = createSelector([stateAllMasters], allMasters => allMasters);
export const selectNewMaster = createSelector([stateNewMaster], newMaster => newMaster);
export const selectOldMaster = createSelector([stateOldMaster], oldMaster => oldMaster);
export const selectMasterError = createSelector([stateMasterError], masterError => masterError);
export const selectMasterInitialLoading = createSelector([stateMasterInitialLoading], loading => loading);
export const selectMasterPending = createSelector([stateMasterPending], pending => pending);
export const selectMasterShowAddForm = createSelector([stateMasterShowAddForm], isShowForm => isShowForm);
export const selectMasterTotalItems = createSelector([stateMasterTotalItems], totalItems => totalItems);
export const selectMasterCurrentPage = createSelector([stateMasterCurrentPage], currentPage => currentPage);
export const selectMasterPageSize = createSelector([stateMasterPageSize], pageSize => pageSize);
export const selectMasterSortFielName = createSelector([stateMasterSortFieldName], sortFieldName => sortFieldName);
export const selectMasterSortOrder = createSelector([stateMasterSortOrder], sortOrder => sortOrder);
