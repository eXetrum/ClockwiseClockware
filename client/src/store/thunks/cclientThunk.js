import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiSecure } from '../../axios/axios.interceptor';
import { getErrorType, getErrorText } from '../../utils';

//#region Client
export const fetchClients = createAsyncThunk('client/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await apiSecure.get('/clients');
    return response.data.clients;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

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
    await apiSecure.put(`/clients/${client.id}`, { client });
    return client;
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
