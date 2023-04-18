import { createAsyncThunk } from '@reduxjs/toolkit';
import { api, apiSecure } from '../../axios/axios.interceptor';
import { getErrorType, getErrorText } from '../../utils';
import { PAGINATION_PAGE_SIZE_OPTIONS } from '../../constants';

//#region City
export const fetchCities = createAsyncThunk(
  'city/fetchAll',
  async ({ offset = 0, limit = PAGINATION_PAGE_SIZE_OPTIONS[0], orderBy = '', order = '' }, thunkAPI) => {
    try {
      if (limit === -1) limit = undefined;
      if (orderBy === '') orderBy = order = undefined;

      const response = await api.get('/cities', { params: { offset, limit, orderBy, order } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
    }
  },
);

export const addCity = createAsyncThunk('city/addCity', async (city, thunkAPI) => {
  try {
    const response = await apiSecure.post('/cities', { city });
    return response.data.city;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const deleteCity = createAsyncThunk('city/deleteCity', async (id, thunkAPI) => {
  try {
    await apiSecure.delete(`/cities/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const fetchCity = createAsyncThunk('city/fetchCity', async (id, thunkAPI) => {
  try {
    const response = await apiSecure.get(`/cities/${id}`);
    return response.data.city;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const updateCity = createAsyncThunk('city/updateCity', async (city, thunkAPI) => {
  try {
    const response = await apiSecure.put(`/cities/${city.id}`, { id: city.id, city });
    return response.data.city;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});
//#endregion
