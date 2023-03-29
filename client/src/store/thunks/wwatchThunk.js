import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../axios/axios.interceptor';
import { getErrorType, getErrorText } from '../../utils';

//#region Watch
export const fetchWatches = createAsyncThunk('watch/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await api.get('/watches');
    return response.data.watches;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});
//#endregion
