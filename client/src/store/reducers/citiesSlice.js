import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initialState = {
  cities: [],
  isFetched: false,
  isLoading: false,
  error: null,
};

export const citiesSlice = createSlice({
  name: 'cities',
  initialState,
  reducers: {
    getCities(state, action) {},
    createCity(state, action) {},
    removeCityById(state, action) {},
    getCityById(state, action) {},
    updateCityById(state, action) {},
  },
});

export default citiesSlice.reducer;
