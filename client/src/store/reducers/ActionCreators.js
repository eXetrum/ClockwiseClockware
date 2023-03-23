import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  resetPassword,
  resendEmailConfirmation,
  //
  getCities,
  createCity,
  deleteCityById,
  getCityById,
  updateCityById,
  //
  getMasters,
  createMaster,
  deleteMasterById,
  getMasterById,
  updateMasterById,
  //
  getClients,
  createClient,
  deleteClientById,
  getClientById,
  updateClientById,
} from '../../api';
import { getErrorType, getErrorText } from '../../utils';

//#region City
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
//#endregion

//#region Master
export const fetchMasters = createAsyncThunk('master/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await getMasters();
    return response.data.masters;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const addMaster = createAsyncThunk('master/addMaster', async (master, thunkAPI) => {
  try {
    const response = await createMaster({ master });
    return response.data.master;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const deleteMaster = createAsyncThunk('master/deleteMaster', async (id, thunkAPI) => {
  try {
    await deleteMasterById({ id });
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const fetchMaster = createAsyncThunk('master/fetchMaster', async (id, thunkAPI) => {
  try {
    const response = await getMasterById({ id });
    return response.data.master;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const updateMaster = createAsyncThunk('master/updateMaster', async (master, thunkAPI) => {
  try {
    await updateMasterById({ id: master.id, master });
    return master;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const resetPasswordMaster = createAsyncThunk('master/resetPassword', async (userId, thunkAPI) => {
  try {
    await resetPassword({ userId });
    return userId;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id: userId, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const resendEmailConfirmationMaster = createAsyncThunk('master/resendEmailConfirmation', async (userId, thunkAPI) => {
  try {
    await resendEmailConfirmation({ userId });
    return userId;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id: userId, message: getErrorText(error), type: getErrorType(error) });
  }
});
//#endregion

//#region Client
export const fetchClients = createAsyncThunk('client/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await getClients();
    return response.data.clients;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const addClient = createAsyncThunk('client/addClient', async (client, thunkAPI) => {
  try {
    const response = await createClient({ client });
    return response.data.client;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const deleteClient = createAsyncThunk('client/deleteClient', async (id, thunkAPI) => {
  try {
    await deleteClientById({ id });
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const fetchClient = createAsyncThunk('client/fetchClient', async (id, thunkAPI) => {
  try {
    const response = await getClientById({ id });
    return response.data.client;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const updateClient = createAsyncThunk('client/updateClient', async (client, thunkAPI) => {
  try {
    await updateClientById({ id: client.id, client });
    return client;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const resetPasswordClient = createAsyncThunk('client/resetPassword', async (userId, thunkAPI) => {
  try {
    await resetPassword({ userId });
    return userId;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id: userId, message: getErrorText(error), type: getErrorType(error) });
  }
});

export const resendEmailConfirmationClient = createAsyncThunk('client/resendEmailConfirmation', async (userId, thunkAPI) => {
  try {
    await resendEmailConfirmation({ userId });
    return userId;
  } catch (error) {
    return thunkAPI.rejectWithValue({ id: userId, message: getErrorText(error), type: getErrorType(error) });
  }
});
//#endregion
