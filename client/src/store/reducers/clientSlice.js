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
} from '../thunks';
import { isGlobalErrorType } from '../../utils';
import { ERROR_TYPE } from '../../constants';

const initEmptyClient = (client = null) => ({ id: client?.id || -1, email: client?.email || '', password: '', name: client?.name || '' });
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });

const initialState = {
  clients: [],
  newClient: initEmptyClient(),
  oldClient: initEmptyClient(),
  error: initEmptyError(),
  isInitialLoading: false,
  isPending: false,
  isShowAddForm: false,
  totalItems: 0,
};

export const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    changeVisibilityAddClientForm(state, { payload }) {
      state.isShowAddForm = payload;
      state.newClient = initEmptyClient();
    },
    changeNewClientField(state, { payload }) {
      state.newClient[payload.name] = payload.value;
    },
  },
  extraReducers: {
    //#region Fetch all clients
    [fetchClients.pending]: state => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    },
    [fetchClients.fulfilled]: (state, { payload: { clients, total } }) => {
      state.clients = clients.map(client => {
        client.isPendingResetPassword = false;
        client.isPendingResendEmailConfirmation = false;
        return client;
      });
      state.totalItems = total;
      state.isInitialLoading = false;
      state.error = initEmptyError();
    },
    [fetchClients.rejected]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = payload;
    },
    //#endregion
    //#region Create new client
    [addClient.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [addClient.fulfilled]: (state, { payload }) => {
      state.clients.unshift({ ...payload, isPendingResetPassword: false, isPendingResendEmailConfirmation: false });
      state.isPending = false;
      state.isShowAddForm = false;
      state.newClient = initEmptyClient();
      state.error = initEmptyError();
    },
    [addClient.rejected]: (state, { payload }) => {
      state.isPending = false;
      if (isGlobalErrorType(payload.type)) state.error = payload;
    },
    //#endregion
    //#region Delete client by id
    [deleteClient.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [deleteClient.fulfilled]: (state, { payload }) => {
      state.clients = state.clients.filter(client => client.id !== payload);
      state.isPending = false;
      state.error = initEmptyError();
    },
    [deleteClient.rejected]: (state, { payload }) => {
      state.isPending = false;

      if (payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
        state.clients = state.clients.filter(client => client.id !== payload.id);
      }

      if (isGlobalErrorType(payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = payload;
    },
    //#endregion
    //#region Get client by id
    [fetchClient.pending]: state => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newClient = initEmptyClient();
      state.oldClient = initEmptyClient();
    },
    [fetchClient.fulfilled]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = initEmptyError();
      state.newClient = initEmptyClient(payload);
      state.oldClient = initEmptyClient(payload);
    },
    [fetchClient.rejected]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = payload;
    },
    //#endregion
    //#region Update client by id
    [updateClient.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [updateClient.fulfilled]: (state, { payload }) => {
      state.isPending = false;
      state.error = initEmptyError();
      state.newClient = initEmptyClient(payload);
      state.oldClient = initEmptyClient(payload);
    },
    [updateClient.rejected]: (state, { payload }) => {
      state.isPending = false;
      state.newClient = state.oldClient;
      if (isGlobalErrorType(payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = payload;
    },
    //#endregion

    //#region Reset password client
    [resetPasswordClient.pending]: (state, { meta }) => {
      const idx = state.clients.map(client => client.id).indexOf(meta.arg);
      state.clients[idx].isPendingResetPassword = true;
      state.error = initEmptyError();
    },
    [resetPasswordClient.fulfilled]: (state, { payload }) => {
      const idx = state.clients.map(client => client.id).indexOf(payload);
      state.clients[idx].isPendingResetPassword = false;
      state.error = initEmptyError();
    },
    [resetPasswordClient.rejected]: (state, { payload }) => {
      const idx = state.clients.map(client => client.id).indexOf(payload.id);
      state.clients[idx].isPendingResetPassword = false;
      if (payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.clients.filter(client => client.id !== payload.id);
    },
    //#endregion

    //#region Resend email confirmation client
    [resendEmailConfirmationClient.pending]: (state, { meta }) => {
      const idx = state.clients.map(client => client.id).indexOf(meta.arg);
      state.clients[idx].isPendingResendEmailConfirmation = true;
      state.error = initEmptyError();
    },
    [resendEmailConfirmationClient.fulfilled]: (state, { payload }) => {
      const idx = state.clients.map(client => client.id).indexOf(payload);
      state.clients[idx].isPendingResendEmailConfirmation = false;
      state.error = initEmptyError();
    },
    [resendEmailConfirmationClient.rejected]: (state, { payload }) => {
      const idx = state.clients.map(client => client.id).indexOf(payload.id);
      state.clients[idx].isPendingResendEmailConfirmation = false;
      if (payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.clients.filter(client => client.id !== payload.id);
    },
  },
});

export const { changeVisibilityAddClientForm, changeNewClientField } = clientSlice.actions;
export default clientSlice.reducer;
