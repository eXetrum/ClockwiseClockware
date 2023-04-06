import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiSecure } from '../../axios/axios.interceptor';
import { getErrorType, getErrorText } from '../../utils';
import { PAGINATION_PAGE_SIZE_OPTIONS } from '../../constants';

//#region Client
export const fetchClients = createAsyncThunk(
  'client/fetchAll',
  async ({ offset = 0, limit = PAGINATION_PAGE_SIZE_OPTIONS[0] }, thunkAPI) => {
    try {
      if (limit === -1) limit = undefined;
      const response = await apiSecure.get('/clients', { params: { offset, limit } });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
    }
  },
);

export const addClient = createAsyncThunk('client/addClient', async (client, thunkAPI) => {
  try {
    const response = await apiSecure.post('/clients', { client });
    return response.data.client;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const deleteClient = createAsyncThunk('client/deleteClient', async (id, thunkAPI) => {
  try {
    await apiSecure.delete(`/clients/${id}`);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const fetchClient = createAsyncThunk('client/fetchClient', async (id, thunkAPI) => {
  try {
    const response = await apiSecure.get(`/clients/${id}`);
    return response.data.client;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const updateClient = createAsyncThunk('client/updateClient', async (client, thunkAPI) => {
  try {
    const response = await apiSecure.put(`/clients/${client.id}`, { client });
    return response.data.client;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const resetPasswordClient = createAsyncThunk('client/resetPassword', async (userId, thunkAPI) => {
  try {
    await apiSecure.post('/reset_password', { userId });
    return userId;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id: userId, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const resendEmailConfirmationClient = createAsyncThunk('client/resendEmailConfirmation', async (userId, thunkAPI) => {
  try {
    await apiSecure.post('/resend_email_confirmation', { userId });
    return userId;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id: userId, message: getErrorText(error), type: getErrorType(error) });
  }
});
//#endregion
