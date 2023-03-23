import { createAsyncThunk } from '@reduxjs/toolkit';
import { getCities, createCity, deleteCityById, getCityById, updateCityById } from '../../api';
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

export const deleteCity = createAsyncThunk('city/deleteCity', async (id, thunkAPI) => {
  try {
    await deleteCityById({ id });
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const fetchCity = createAsyncThunk('city/fetchCity', async (id, thunkAPI) => {
  try {
    const response = await getCityById({ id });
    return response.data.city;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const updateCity = createAsyncThunk('city/updateCity', async (city, thunkAPI) => {
  try {
    await updateCityById({ id: city.id, city });
    return city;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});
