/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { fetchCities, addCity, deleteCity } from './ActionCreators';
import { isGlobalErrorType } from '../../utils';
import { ERROR_TYPE } from '../../constants';

const initEmptyCity = () => ({ name: '', pricePerHour: 0.0 });
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });
const createNotification = ({ text = '', variant = '' }) => ({ text, variant });

const initialState = {
  cities: [],
  newCity: initEmptyCity(),
  error: initEmptyError(),
  isInitialLoading: false,
  isShowAddForm: false,
  isPending: false,
  notification: {},
};

export const citySlice = createSlice({
  name: 'city',
  initialState,
  reducers: {
    changeVisibilityNewCityForm(state, action) {
      state.isShowAddForm = action.payload;
      if (action.payload === false) state.newCity = initEmptyCity();
    },
    changeNewCityField(state, action) {
      state.newCity[action.payload.name] = action.payload.value;
    },
    clearNotification(state, action) {
      state.notification = createNotification({});
    },

    /*getCityById(state, action) {},
    updateCityById(state, action) {},*/
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCities.pending, (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    }),
      builder.addCase(fetchCities.fulfilled, (state, action) => {
        state.cities = action.payload;
        state.isInitialLoading = false;
        state.error = initEmptyError();
      }),
      builder.addCase(fetchCities.rejected, (state, action) => {
        state.isInitialLoading = false;
        state.error = action.payload;
      });
    ////
    builder.addCase(addCity.pending, (state, action) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(addCity.fulfilled, (state, action) => {
        state.cities = [action.payload, ...state.cities];
        state.isPending = false;
        state.isShowAddForm = false;
        state.newCity = initEmptyCity();
        state.error = initEmptyError();
        state.notification = createNotification({ text: `City "${action.payload.name}" created`, variant: 'success' });
      }),
      builder.addCase(addCity.rejected, (state, action) => {
        state.isPending = false;
        if (isGlobalErrorType(action.payload.type)) state.error = action.payload;
        else state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    ////
    builder.addCase(deleteCity.pending, (state, action) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(deleteCity.fulfilled, (state, action) => {
        state.cities = state.cities.filter((city) => city.id !== action.payload.id);
        state.isPending = false;
        state.error = initEmptyError();
        state.notification = createNotification({ text: `City "${action.payload.name}" removed`, variant: 'success' });
      }),
      builder.addCase(deleteCity.rejected, (state, action) => {
        state.isPending = false;

        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
          state.cities = state.cities.filter((item) => item.id !== action.payload.city.id);
        }

        if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = action.payload;
        else state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
  },
});

export default citySlice.reducer;
