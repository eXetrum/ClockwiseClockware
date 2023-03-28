import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  resetPassword,
  resendEmailConfirmation,
  getMasters,
  getAvailableMasters,
  createMaster,
  deleteMasterById,
  getMasterById,
  updateMasterById,
} from '../../api';

import { getErrorType, getErrorText } from '../../utils';

//#region Master
export const fetchMasters = createAsyncThunk('master/fetchAll', async (_, thunkAPI) => {
  try {
    const response = await getMasters();
    return response.data.masters;
  } catch (error) {
    return thunkAPI.rejectWithValue({ message: getErrorText(error), type: getErrorType(error) });
  }
});

export const fetchAllAvailable = createAsyncThunk('master/fetchAllAvailable', async ({ cityId, watchId, startDate }, thunkAPI) => {
  try {
    const response = await getAvailableMasters({ cityId, watchId, startDate });
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
