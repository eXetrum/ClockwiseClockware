/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { fetchCities, addCity, deleteCity, fetchCity, updateCity } from '../thunks';
import { isGlobalErrorType } from '../../utils';
import { ERROR_TYPE, PAGINATION_PAGE_SIZE_OPTIONS, SORT_ORDER } from '../../constants';

const initEmptyCity = (city = null) => ({ id: city?.id || -1, name: city?.name || '', pricePerHour: city?.pricePerHour || 0.0 });
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });

const initialState = {
  cities: [],
  newCity: initEmptyCity(),
  oldCity: initEmptyCity(),
  error: initEmptyError(),
  isInitialLoading: false,
  isPending: false,
  isShowAddForm: false,
  totalItems: 0,
  currentPage: 0,
  pageSize: PAGINATION_PAGE_SIZE_OPTIONS[0],
  sortFieldName: 'name',
  sortOrder: SORT_ORDER.ASC,
};

export const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    changeVisibilityAddCityForm(state, { payload }) {
      state.isShowAddForm = payload;
      state.newCity = initEmptyCity();
    },
    changeNewCityField(state, { payload }) {
      state.newCity[payload.name] = payload.value;
    },
    changeCityCurrentPage(state, { payload }) {
      state.currentPage = payload;
    },
    changeCityPageSize(state, { payload }) {
      state.pageSize = payload;
    },
    changeCitySortFieldName(state, { payload }) {
      state.sortFieldName = payload;
    },
    changeCitySortOrder(state, { payload }) {
      state.sortOrder = payload;
    },
  },
  extraReducers: {
    //#region Fetch all cities
    [fetchCities.pending]: state => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    },
    [fetchCities.fulfilled]: (state, { payload: { cities, total } }) => {
      state.cities = cities;
      state.totalItems = total;
      state.isInitialLoading = false;
      state.error = initEmptyError();
    },
    [fetchCities.rejected]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = payload;
    },
    //#endregion

    //#region Create new city
    [addCity.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [addCity.fulfilled]: (state, { payload }) => {
      state.cities.unshift(payload);
      state.isPending = false;
      state.isShowAddForm = false;
      state.newCity = initEmptyCity();
      state.error = initEmptyError();
    },
    [addCity.rejected]: (state, { payload }) => {
      state.isPending = false;
      if (isGlobalErrorType(payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = payload;
    },
    //#endregion
    //#region Delete city by id
    [deleteCity.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [deleteCity.fulfilled]: (state, { payload }) => {
      state.cities = state.cities.filter(city => city.id !== payload);
      state.isPending = false;
      state.error = initEmptyError();
    },
    [deleteCity.rejected]: (state, { payload }) => {
      state.isPending = false;

      if (payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
        state.cities = state.cities.filter(city => city.id !== payload.id);
      }

      if (isGlobalErrorType(payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = payload;
    },
    //#endregion
    //#region Get city by id
    [fetchCity.pending]: state => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newCity = initEmptyCity();
      state.oldCity = initEmptyCity();
    },
    [fetchCity.fulfilled]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = initEmptyError();
      state.newCity = payload;
      state.oldCity = payload;
    },
    [fetchCity.rejected]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = payload;
    },
    //#endregion
    //#region Update city by id
    [updateCity.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [updateCity.fulfilled]: (state, { payload }) => {
      state.isPending = false;
      state.error = initEmptyError();
      state.newCity = payload;
      state.oldCity = payload;
    },
    [updateCity.rejected]: (state, { payload }) => {
      state.isPending = false;
      state.newCity = state.oldCity;
      if (isGlobalErrorType(payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = payload;
    },
    //#endregion
  },
});

export const {
  changeVisibilityAddCityForm,
  changeNewCityField,
  changeCityCurrentPage,
  changeCityPageSize,
  changeCitySortFieldName,
  changeCitySortOrder,
} = citySlice.actions;
export default citySlice.reducer;
