/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchClients,
  addClient,
  deleteClient,
  fetchClient,
  updateClient,
  resetPasswordClient,
  resendEmailConfirmationClient,
} from './ActionCreators';
import { isGlobalErrorType } from '../../utils';
import { ERROR_TYPE } from '../../constants';

const initEmptyClient = () => ({ email: '', password: '', name: '' });
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });

const initialState = {
  clients: [],
  newClient: initEmptyClient(),
  oldClient: initEmptyClient(),
  error: initEmptyError(),
  isInitialLoading: false,
  isShowAddForm: false,
  isPending: false,
};

export const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    changeVisibilityAddForm(state, action) {
      state.isShowAddForm = action.payload;
      state.newClient = initEmptyClient();
    },
    changeNewClientField(state, action) {
      state.newClient[action.payload.name] = action.payload.value;
    },
  },
  extraReducers: {
    //#region Fetch all clients
    [fetchClients.pending]: (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    },
    [fetchClients.fulfilled]: (state, action) => {
      state.clients = action.payload;
      state.isInitialLoading = false;
      state.error = initEmptyError();
    },
    [fetchClients.rejected]: (state, action) => {
      state.isInitialLoading = false;
      state.error = action.payload;
    },
    //#endregion
    //#region Create new client
    [addClient.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [addClient.fulfilled]: (state, action) => {
      state.clients = [action.payload, ...state.clients];
      state.isPending = false;
      state.isShowAddForm = false;
      state.newClient = initEmptyClient();
      state.error = initEmptyError();
    },
    [addClient.rejected]: (state, action) => {
      state.isPending = false;
      if (isGlobalErrorType(action.payload.type)) state.error = action.payload;
    },
    //#endregion
    //#region Delete client by id
    [deleteClient.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [deleteClient.fulfilled]: (state, action) => {
      state.clients = state.clients.filter(client => client.id !== action.payload);
      state.isPending = false;
      state.error = initEmptyError();
    },
    [deleteClient.rejected]: (state, action) => {
      state.isPending = false;

      if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
        state.clients = state.clients.filter(client => client.id !== action.payload.id);
      }

      if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = action.payload;
    },
    //#endregion
    //#region Get client by id
    [fetchClient.pending]: (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newClient = initEmptyClient();
      state.oldClient = initEmptyClient();
    },
    [fetchClient.fulfilled]: (state, action) => {
      state.isInitialLoading = false;
      state.error = initEmptyError();
      state.newClient = action.payload;
      state.oldClient = action.payload;
    },
    [fetchClient.rejected]: (state, action) => {
      state.isInitialLoading = false;
      state.error = action.payload;
    },
    //#endregion
    //#region Update client by id
    [updateClient.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [updateClient.fulfilled]: (state, action) => {
      state.isPending = false;
      state.error = initEmptyError();
      state.newClient = action.payload;
      state.oldClient = action.payload;
    },
    [updateClient.rejected]: (state, action) => {
      state.isPending = false;
      state.newClient = state.oldClient;
      if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = action.payload;
    },
    //#endregion

    //#region Reset password client
    [resetPasswordClient.pending]: (state, action) => {
      const userId = action.meta.arg;
      const idx = state.clients.map(client => client.id).indexOf(userId);
      state.clients[idx].isPendingResetPassword = true;
      state.error = initEmptyError();
    },
    [resetPasswordClient.fulfilled]: (state, action) => {
      const userId = action.payload;
      const idx = state.clients.map(client => client.id).indexOf(userId);
      state.clients[idx].isPendingResetPassword = false;
      state.error = initEmptyError();
    },
    [resetPasswordClient.rejected]: (state, action) => {
      const idx = state.clients.map(client => client.id).indexOf(action.payload.id);
      state.clients[idx].isPendingResetPassword = false;
      if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.clients.filter(client => client.id !== action.payload.id);
    },
    //#endregion

    //#region Resend email confirmation client
    [resendEmailConfirmationClient.pending]: (state, action) => {
      const userId = action.meta.arg;
      const idx = state.clients.map(client => client.id).indexOf(userId);
      state.clients[idx].isPendingResendEmailConfirmation = true;
      state.error = initEmptyError();
    },
    [resendEmailConfirmationClient.fulfilled]: (state, action) => {
      const userId = action.payload;
      const idx = state.clients.map(client => client.id).indexOf(userId);
      state.clients[idx].isPendingResendEmailConfirmation = false;
      state.error = initEmptyError();
    },
    [resendEmailConfirmationClient.rejected]: (state, action) => {
      const idx = state.clients.map(client => client.id).indexOf(action.payload.id);
      state.clients[idx].isPendingResendEmailConfirmation = false;
      if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.clients.filter(client => client.id !== action.payload.id);
    },
  },
});

export const { changeVisibilityAddForm, changeNewClientField } = clientSlice.actions;
export default clientSlice.reducer;
