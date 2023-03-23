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
const createNotification = ({ text = '', variant = '' }) => ({ text, variant });

const initialState = {
  clients: [],
  newClient: initEmptyClient(),
  oldClient: initEmptyClient(),
  error: initEmptyError(),
  isInitialLoading: false,
  isShowAddForm: false,
  isPending: false,
  notification: createNotification({}),
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
    clearNotification(state, _) {
      state.notification = createNotification({});
    },
  },
  extraReducers: (builder) => {
    //#region Fetch all clients
    builder.addCase(fetchClients.pending, (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    }),
      builder.addCase(fetchClients.fulfilled, (state, action) => {
        state.clients = action.payload;
        state.isInitialLoading = false;
        state.error = initEmptyError();
      }),
      builder.addCase(fetchClients.rejected, (state, action) => {
        state.isInitialLoading = false;
        state.error = action.payload;
      });
    //#endregion
    //#region Create new client
    builder.addCase(addClient.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(addClient.fulfilled, (state, action) => {
        state.clients = [action.payload, ...state.clients];
        state.isPending = false;
        state.isShowAddForm = false;
        state.newClient = initEmptyClient();
        state.error = initEmptyError();
        state.notification = createNotification({ text: `Client "${action.payload.email}" created`, variant: 'success' });
      }),
      builder.addCase(addClient.rejected, (state, action) => {
        state.isPending = false;
        if (isGlobalErrorType(action.payload.type)) state.error = action.payload;
        else state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion
    //#region Delete client by id
    builder.addCase(deleteClient.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(deleteClient.fulfilled, (state, action) => {
        const removedClient = state.clients.find((client) => client.id === action.payload);
        state.clients = state.clients.filter((client) => client.id !== action.payload);
        state.isPending = false;
        state.error = initEmptyError();
        state.notification = createNotification({ text: `Client "${removedClient.email}" removed`, variant: 'success' });
      }),
      builder.addCase(deleteClient.rejected, (state, action) => {
        state.isPending = false;

        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
          state.clients = state.clients.filter((client) => client.id !== action.payload.id);
        }

        if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = action.payload;
        else state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion
    //#region Get client by id
    builder.addCase(fetchClient.pending, (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newClient = initEmptyClient();
      state.oldClient = initEmptyClient();
    }),
      builder.addCase(fetchClient.fulfilled, (state, action) => {
        state.isInitialLoading = false;
        state.error = initEmptyError();
        state.newClient = action.payload;
        state.oldClient = action.payload;
      }),
      builder.addCase(fetchClient.rejected, (state, action) => {
        state.isInitialLoading = false;
        state.error = action.payload;
      });
    //#endregion
    //#region Update client by id
    builder.addCase(updateClient.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(updateClient.fulfilled, (state, action) => {
        state.isPending = false;
        state.error = initEmptyError();
        state.newClient = action.payload;
        state.oldClient = action.payload;
        state.notification = createNotification({ text: 'Client updated', variant: 'success' });
      }),
      builder.addCase(updateClient.rejected, (state, action) => {
        state.isPending = false;
        state.newClient = state.oldClient;
        if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = action.payload;
        else state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion

    //#region Reset password client
    builder.addCase(resetPasswordClient.pending, (state, action) => {
      const userId = action.meta.arg;
      const idx = state.clients.map((client) => client.id).indexOf(userId);
      state.clients[idx].isPendingResetPassword = true;
      state.error = initEmptyError();
    }),
      builder.addCase(resetPasswordClient.fulfilled, (state, action) => {
        const userId = action.payload;
        const idx = state.clients.map((client) => client.id).indexOf(userId);
        const client = state.clients[idx];
        state.clients[idx].isPendingResetPassword = false;
        state.error = initEmptyError();
        state.notification = createNotification({
          text: `Password for client ${client.email} has been successfully reset`,
          variant: 'success',
        });
      }),
      builder.addCase(resetPasswordClient.rejected, (state, action) => {
        const idx = state.clients.map((client) => client.id).indexOf(action.payload.id);
        state.clients[idx].isPendingResetPassword = false;
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.clients.filter((client) => client.id !== action.payload.id);
        state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
    //#endregion

    //#region Resend email confirmation client
    builder.addCase(resendEmailConfirmationClient.pending, (state, action) => {
      const userId = action.meta.arg;
      const idx = state.clients.map((client) => client.id).indexOf(userId);
      state.clients[idx].isPendingResendEmailConfirmation = true;
      state.error = initEmptyError();
    }),
      builder.addCase(resendEmailConfirmationClient.fulfilled, (state, action) => {
        const userId = action.payload;
        const idx = state.clients.map((client) => client.id).indexOf(userId);
        const client = state.clients[idx];
        state.clients[idx].isPendingResendEmailConfirmation = false;
        state.error = initEmptyError();
        state.notification = createNotification({
          text: `Email confirmation for client ${client.email} has been sent`,
          variant: 'success',
        });
      }),
      builder.addCase(resendEmailConfirmationClient.rejected, (state, action) => {
        const idx = state.clients.map((client) => client.id).indexOf(action.payload.id);
        state.clients[idx].isPendingResendEmailConfirmation = false;
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.clients.filter((client) => client.id !== action.payload.id);
        state.notification = createNotification({ text: `Error: ${action.payload.message}`, variant: 'error' });
      });
  },
});

export default clientSlice.reducer;
