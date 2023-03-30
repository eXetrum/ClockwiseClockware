/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import {
  fetchMasters,
  fetchAllAvailable,
  addMaster,
  deleteMaster,
  fetchMaster,
  updateMaster,
  resetPasswordMaster,
  resendEmailConfirmationMaster,
} from '../thunks';
import { isGlobalErrorType } from '../../utils';
import { ERROR_TYPE } from '../../constants';

const initEmptyMaster = (master = null) => ({
  id: master?.id || -1,
  name: master?.name || '',
  email: master?.email || '',
  password: '',
  rating: parseInt(master?.rating || 0),
  isApprovedByAdmin: master?.isApprovedByAdmin || false,
  cities: master?.cities || [],
});
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });

const initialState = {
  masters: [],
  newMaster: initEmptyMaster(),
  oldMaster: initEmptyMaster(),
  error: initEmptyError(),
  isInitialLoading: false,
  isShowAddForm: false,
  isPending: false,
};

export const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {
    changeVisibilityAddForm(state, action) {
      state.isShowAddForm = action.payload;
      state.newMaster = initEmptyMaster();
    },
    changeNewMasterField(state, action) {
      state.newMaster[action.payload.name] = action.payload.value;
    },
    resetMasters(state, action) {
      if (!action.payload) state.masters = [];
      else state.masters = action.payload;
    },
  },
  extraReducers: {
    //#region Fetch all masters
    [fetchMasters.pending]: (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    },
    [fetchMasters.fulfilled]: (state, action) => {
      state.masters = action.payload.map(master => {
        master.isPendingResetPassword = false;
        master.isPendingResendEmailConfirmation = false;
        return master;
      });
      state.isInitialLoading = false;
      state.error = initEmptyError();
    },
    [fetchMasters.rejected]: (state, action) => {
      state.isInitialLoading = false;
      state.error = action.payload;
    },
    //#endregion
    //#region Fetch all but available masters
    [fetchAllAvailable.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [fetchAllAvailable.fulfilled]: (state, action) => {
      state.masters = action.payload;
      state.isPending = false;
      state.error = initEmptyError();
    },
    [fetchAllAvailable.rejected]: (state, action) => {
      state.isPending = false;
      state.error = action.payload;
    },
    //#endregion
    //#region Create new master
    [addMaster.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [addMaster.fulfilled]: (state, action) => {
      state.masters = [{ ...action.payload, isPendingResetPassword: false, isPendingResendEmailConfirmation: false }, ...state.masters];
      state.isPending = false;
      state.isShowAddForm = false;
      state.newMaster = initEmptyMaster();
      state.error = initEmptyError();
    },
    [addMaster.rejected]: (state, action) => {
      state.isPending = false;
      if (isGlobalErrorType(action.payload.type)) state.error = action.payload;
    },
    //#endregion

    //#region Delete master by id
    [deleteMaster.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [deleteMaster.fulfilled]: (state, action) => {
      state.masters = state.masters.filter(master => master.id !== action.payload);
      state.isPending = false;
      state.error = initEmptyError();
    },
    [deleteMaster.rejected]: (state, action) => {
      state.isPending = false;

      if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
        state.masters = state.masters.filter(master => master.id !== action.payload.id);
      }

      if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = action.payload;
    },
    //#endregion

    //#region Get master by id
    [fetchMaster.pending]: (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newMaster = initEmptyMaster();
      state.oldMaster = initEmptyMaster();
    },
    [fetchMaster.fulfilled]: (state, action) => {
      state.isInitialLoading = false;
      state.error = initEmptyError();
      state.newMaster = initEmptyMaster(action.payload);
      state.oldMaster = initEmptyMaster(action.payload);
    },
    [fetchMaster.rejected]: (state, action) => {
      state.isInitialLoading = false;
      state.error = action.payload;
    },
    //#endregion

    //#region Update master by id
    [updateMaster.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [updateMaster.fulfilled]: (state, action) => {
      state.isPending = false;
      state.error = initEmptyError();
      state.newMaster = initEmptyMaster(action.payload);
      state.oldMaster = initEmptyMaster(action.payload);
    },
    [updateMaster.rejected]: (state, action) => {
      state.isPending = false;
      state.newMaster = state.oldMaster;
      if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = action.payload;
    },
    //#endregion

    //#region Reset password master
    [resetPasswordMaster.pending]: (state, action) => {
      const userId = action.meta.arg;
      const idx = state.masters.map(master => master.id).indexOf(userId);
      state.masters[idx].isPendingResetPassword = true;
      state.error = initEmptyError();
    },
    [resetPasswordMaster.fulfilled]: (state, action) => {
      const userId = action.payload;
      const idx = state.masters.map(master => master.id).indexOf(userId);
      const master = state.masters[idx];
      state.masters[idx].isPendingResetPassword = false;
      state.error = initEmptyError();
    },
    [resetPasswordMaster.rejected]: (state, action) => {
      const idx = state.masters.map(master => master.id).indexOf(action.payload.id);
      state.masters[idx].isPendingResetPassword = false;
      if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.masters.filter(master => master.id !== action.payload.id);
    },
    //#endregion

    //#region Resend master email confirmation
    [resendEmailConfirmationMaster.pending]: (state, action) => {
      const userId = action.meta.arg;
      const idx = state.masters.map(master => master.id).indexOf(userId);
      state.masters[idx].isPendingResendEmailConfirmation = true;
      state.error = initEmptyError();
    },
    [resendEmailConfirmationMaster.fulfilled]: (state, action) => {
      const userId = action.payload;
      const idx = state.masters.map(master => master.id).indexOf(userId);
      state.masters[idx].isPendingResendEmailConfirmation = false;
      state.error = initEmptyError();
    },
    [resendEmailConfirmationMaster.rejected]: (state, action) => {
      const idx = state.masters.map(master => master.id).indexOf(action.payload.id);
      state.masters[idx].isPendingResendEmailConfirmation = false;
      if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.masters.filter(master => master.id !== action.payload.id);
    },
    //#endregion
  },
});

export const { changeVisibilityAddForm, changeNewMasterField, resetMasters } = masterSlice.actions;
export default masterSlice.reducer;
