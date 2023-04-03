import { createSelector } from '@reduxjs/toolkit';

const stateAllCities = state => state.cityReducer.cities;
const stateNewCity = state => state.cityReducer.newCity;
const stateOldCity = state => state.cityReducer.oldCity;
const stateCityError = state => state.cityReducer.error;
const stateCityInitialLoading = state => state.cityReducer.isInitialLoading;
const stateCityPending = state => state.cityReducer.isPending;
const stateCityShowAddForm = state => state.cityReducer.isShowAddForm;

export const selectAllCities = createSelector([stateAllCities], allCities => allCities);
export const selectNewCity = createSelector([stateNewCity], newCity => newCity);
export const selectOldCity = createSelector([stateOldCity], oldCity => oldCity);
export const selectCityError = createSelector([stateCityError], cityError => cityError);
export const selectCityInitialLoading = createSelector([stateCityInitialLoading], loading => loading);
export const selectCityPending = createSelector([stateCityPending], pending => pending);
export const selectCityShowAddForm = createSelector([stateCityShowAddForm], isShowForm => isShowForm);
