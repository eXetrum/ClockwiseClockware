import { createAsyncThunk } from '@reduxjs/toolkit';
import { login, register } from '../../api';
import { getErrorType, getErrorText } from '../../utils';

//#region Auth
export const loginAuth = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  try {
    const response = await login({ email, password });
    return response.data.accessToken;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const registerAuth = createAsyncThunk('auth/register', async ({ ...params }, thunkAPI) => {
  try {
    await register({ ...params });
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});
//#endregion
