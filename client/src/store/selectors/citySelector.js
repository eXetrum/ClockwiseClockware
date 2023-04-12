import { createSelector } from '@reduxjs/toolkit';

const stateAllCities = state => state.cityReducer.cities;
const stateNewCity = state => state.cityReducer.newCity;
const stateOldCity = state => state.cityReducer.oldCity;
const stateCityError = state => state.cityReducer.error;
const stateCityInitialLoading = state => state.cityReducer.isInitialLoading;
const stateCityPending = state => state.cityReducer.isPending;
const stateCityShowAddForm = state => state.cityReducer.isShowAddForm;
const stateCityTotalItems = state => state.cityReducer.totalItems;
const stateCityCurrentPage = state => state.cityReducer.currentPage;
const stateCityPageSize = state => state.cityReducer.pageSize;
const stateCitySortFieldName = state => state.cityReducer.sortFieldName;
const stateCitySortOrder = state => state.cityReducer.sortOrder;
const stateCityFilters = state => state.cityReducer.filters;

export const selectAllCities = createSelector([stateAllCities], allCities => allCities);
export const selectNewCity = createSelector([stateNewCity], newCity => newCity);
export const selectOldCity = createSelector([stateOldCity], oldCity => oldCity);
export const selectCityError = createSelector([stateCityError], cityError => cityError);
export const selectCityInitialLoading = createSelector([stateCityInitialLoading], loading => loading);
export const selectCityPending = createSelector([stateCityPending], pending => pending);
export const selectCityShowAddForm = createSelector([stateCityShowAddForm], isShowForm => isShowForm);
export const selectCityTotalItems = createSelector([stateCityTotalItems], totalItems => totalItems);
export const selectCityCurrentPage = createSelector([stateCityCurrentPage], currentPage => currentPage);
export const selectCityPageSize = createSelector([stateCityPageSize], pageSize => pageSize);
export const selectCitySortFielName = createSelector([stateCitySortFieldName], sortFieldName => sortFieldName);
export const selectCitySortOrder = createSelector([stateCitySortOrder], sortOrder => sortOrder);
export const selectCityFilters = createSelector([stateCityFilters], filters => filters);
