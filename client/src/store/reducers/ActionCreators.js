import { createAsyncThunk } from '@reduxjs/toolkit';
import { getCities, createCity, deleteCityById } from '../../api';
import { getErrorType, getErrorText } from '../../utils';

export const fetchCities = createAsyncThunk('city/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await getCities();
    return response.data.cities;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const addCity = createAsyncThunk('city/addCity', async (city, thunkAPI) => {
  try {
    const response = await createCity({ city });
    return response.data.city;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const deleteCity = createAsyncThunk('city/deleteCity', async (city, thunkAPI) => {
  try {
    await deleteCityById({ id: city.id });
    return city;
  } catch (error) {
    return thunkAPI.rejectWithValue({ city, message: getErrorText(error), type: getErrorType(error) });
  }
});
