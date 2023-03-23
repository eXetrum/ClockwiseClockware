/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { fetchCities, addCity, deleteCity, fetchCity, updateCity } from './ActionCreators';
import { isGlobalErrorType } from '../../utils';
import { ERROR_TYPE } from '../../constants';

const initEmptyCity = () => ({ name: '', pricePerHour: 0.0 });
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });
const createNotification = ({ text = '', variant = '' }) => ({ text, variant });

const initialState = {
  cities: [],
  newCity: initEmptyCity(),
  oldCity: initEmptyCity(),
  error: initEmptyError(),
  isInitialLoading: false,
  isShowAddForm: false,
  isPending: false,
  notification: createNotification({}),
};

export const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    changeVisibilityAddForm(state, action) {
      state.isShowAddForm = action.payload;
      if (action.payload === false) state.newCity = initEmptyCity();
    },
    changeNewCityField(state, action) {
      state.newCity[action.payload.name] = action.payload.value;
    },
    clearNotification(state, _) {
      state.notification = createNotification({});
    },
  },
  extraReducers: (builder) => {
    //#region Fetch all cities
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
    //#endregion
    //#region Create new city
    builder.addCase(addCity.pending, (state, _) => {
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
    //#endregion
    //#region Delete city by id
    builder.addCase(deleteCity.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(deleteCity.fulfilled, (state, action) => {
        const removedCity = state.cities.find((city) => city.id === action.payload);
        state.cities = state.cities.filter((city) => city.id !== action.payload);
        state.isPending = false;
        state.error = initEmptyError();
        state.notification = createNotification({ text: `City "${removedCity.name}" removed`, variant: 'success' });
      }),
      builder.addCase(deleteCity.rejected, (state, action) => {
        state.isPending = false;

        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
          state.cities = state.cities.filter((city) => city.id !== action.payload.id);
        }

        if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = action.payload;
        else state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion
    //#region Get city by id
    builder.addCase(fetchCity.pending, (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newCity = initEmptyCity();
      state.oldCity = initEmptyCity();
    }),
      builder.addCase(fetchCity.fulfilled, (state, action) => {
        state.isInitialLoading = false;
        state.error = initEmptyError();
        state.newCity = action.payload;
        state.oldCity = action.payload;
      }),
      builder.addCase(fetchCity.rejected, (state, action) => {
        state.isInitialLoading = false;
        state.error = action.payload;
      });
    //#endregion
    //#region Update city by id
    builder.addCase(updateCity.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(updateCity.fulfilled, (state, action) => {
        state.isPending = false;
        state.error = initEmptyError();
        state.newCity = action.payload;
        state.oldCity = action.payload;
        state.notification = createNotification({ text: 'City updated', variant: 'success' });
      }),
      builder.addCase(updateCity.rejected, (state, action) => {
        state.isPending = false;
        state.newCity = state.oldCity;
        if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = action.payload;
        else state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion
  },
});

export default clientSlice.reducer;
