import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../axios/axios.interceptor';
import { getErrorType, getErrorText } from '../../utils';

//#region Auth
export const loginAuth = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const response = await api.login({ email, password });
    return response.data.accessToken;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const registerAuth = createAsyncThunk('auth/register', async ({ ...params }, thunkAPI) => {
  try {
    await api.register({ ...params });
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});
//#endregion
