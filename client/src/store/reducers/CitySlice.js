/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { fetchCities, addCity, deleteCity, fetchCity, updateCity } from './ActionCreators';
import { isGlobalErrorType } from '../../utils';
import { ERROR_TYPE } from '../../constants';

const initEmptyCity = () => ({ name: '', pricePerHour: 0.0 });
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });

const initialState = {
  cities: [],
  newCity: initEmptyCity(),
  oldCity: initEmptyCity(),
  error: initEmptyError(),
  isInitialLoading: false,
  isShowAddForm: false,
  isPending: false,
};

export const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    changeVisibilityAddForm(state, action) {
      state.isShowAddForm = action.payload;
      state.newCity = initEmptyCity();
    },
    changeNewCityField(state, action) {
      state.newCity[action.payload.name] = action.payload.value;
    },
  },
  extraReducers: {
    //#region Fetch all cities
    [fetchCities.pending]: (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    },
    [fetchCities.fulfilled]: (state, action) => {
      state.cities = action.payload;
      state.isInitialLoading = false;
      state.error = initEmptyError();
    },
    [fetchCities.rejected]: (state, action) => {
      state.isInitialLoading = false;
      state.error = action.payload;
    },
    //#endregion

    //#region Create new city
    [addCity.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [addCity.fulfilled]: (state, action) => {
      state.cities = [action.payload, ...state.cities];
      state.isPending = false;
      state.isShowAddForm = false;
      state.newCity = initEmptyCity();
      state.error = initEmptyError();
    },
    [addCity.rejected]: (state, action) => {
      state.isPending = false;
      if (isGlobalErrorType(action.payload.type)) state.error = action.payload;
    },
    //#endregion
    //#region Delete city by id
    [deleteCity.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [deleteCity.fulfilled]: (state, action) => {
      state.cities = state.cities.filter(city => city.id !== action.payload);
      state.isPending = false;
      state.error = initEmptyError();
    },
    [deleteCity.rejected]: (state, action) => {
      state.isPending = false;

      if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
        state.cities = state.cities.filter(city => city.id !== action.payload.id);
      }

      if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = action.payload;
    },
    //#endregion
    //#region Get city by id
    [fetchCity.pending]: (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newCity = initEmptyCity();
      state.oldCity = initEmptyCity();
    },
    [fetchCity.fulfilled]: (state, action) => {
      state.isInitialLoading = false;
      state.error = initEmptyError();
      state.newCity = action.payload;
      state.oldCity = action.payload;
    },
    [fetchCity.rejected]: (state, action) => {
      state.isInitialLoading = false;
      state.error = action.payload;
    },
    //#endregion
    //#region Update city by id
    [updateCity.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [updateCity.fulfilled]: (state, action) => {
      state.isPending = false;
      state.error = initEmptyError();
      state.newCity = action.payload;
      state.oldCity = action.payload;
    },
    [updateCity.rejected]: (state, action) => {
      state.isPending = false;
      state.newCity = state.oldCity;
      if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = action.payload;
    },
    //#endregion
  },
});

export const { changeVisibilityAddForm, changeNewCityField } = citySlice.actions;
export default citySlice.reducer;
