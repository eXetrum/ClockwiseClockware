import { createAsyncThunk } from '@reduxjs/toolkit';
import { api, apiSecure } from '../../axios/axios.interceptor';
import { getErrorType, getErrorText } from '../../utils';
import { PAGINATION_PAGE_SIZE_OPTIONS } from '../../constants';

//#region Master
export const fetchMasters = createAsyncThunk(
  'master/fetchAll',
  async ({ offset = 0, limit = PAGINATION_PAGE_SIZE_OPTIONS[0], orderBy = '', order = '' }, thunkAPI) => {
    try {
      const params = {
        ...(limit !== null && { offset, limit }),
        ...(orderBy !== '' && { orderBy }),
        ...(order !== '' && { order }),
      };

      const response = await apiSecure.get('/masters', { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
    }
  },
);

export const fetchAllAvailable = createAsyncThunk('master/fetchAllAvailable', async ({ cityId, watchId, startDate }, thunkAPI) => {
  try {
    const response = await api.get('/masters/available', { params: { cityId, watchId, startDate } });
    return response.data.masters;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const addMaster = createAsyncThunk('master/addMaster', async (master, thunkAPI) => {
  try {
    const response = await apiSecure.post('/masters', { master });
    return response.data.master;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const deleteMaster = createAsyncThunk('master/deleteMaster', async (id, thunkAPI) => {
  try {
    await apiSecure.delete(`/masters/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const fetchMaster = createAsyncThunk('master/fetchMaster', async (id, thunkAPI) => {
  try {
    const response = await apiSecure.get(`/masters/${id}`);
    return response.data.master;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const updateMaster = createAsyncThunk('master/updateMaster', async (master, thunkAPI) => {
  try {
    const response = await apiSecure.put(`/masters/${master.id}`, { master });
    return response.data.master;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const resetPasswordMaster = createAsyncThunk('master/resetPassword', async (userId, thunkAPI) => {
  try {
    await apiSecure.post('/reset_password', { userId });
    return userId;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id: userId, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const resendEmailConfirmationMaster = createAsyncThunk('master/resendEmailConfirmation', async (userId, thunkAPI) => {
  try {
    await apiSecure.post('/resend_email_confirmation', { userId });
    return userId;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id: userId, message: getErrorText(error), type: getErrorType(error) });
  }
});
//#endregion
