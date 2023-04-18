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
import { ERROR_TYPE, PAGINATION_PAGE_SIZE_OPTIONS } from '../../constants';

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
  isPending: false,
  isShowAddForm: false,
  totalItems: 0,
  currentPage: 0,
  pageSize: PAGINATION_PAGE_SIZE_OPTIONS[0],
  sortFieldName: '',
  sortOrder: '',
};

export const masterSlice = createSlice({
  name: 'master',
  initialState,
  reducers: {
    changeVisibilityAddMasterForm(state, { payload }) {
      state.isShowAddForm = payload;
      state.newMaster = initEmptyMaster();
    },
    changeNewMasterField(state, { payload }) {
      state.newMaster[payload.name] = payload.value;
    },
    resetMasters(state, { payload }) {
      if (!payload) state.masters = [];
      else state.masters = payload;
    },
    changeMasterCurrentPage(state, { payload }) {
      state.currentPage = payload;
    },
    changeMasterPageSize(state, { payload }) {
      state.pageSize = payload;
    },
    changeMasterSortFieldName(state, { payload }) {
      state.sortFieldName = payload;
    },
    changeMasterSortOrder(state, { payload }) {
      state.sortOrder = payload;
    },
  },
  extraReducers: {
    //#region Fetch all masters
    [fetchMasters.pending]: state => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    },
    [fetchMasters.fulfilled]: (state, { payload: { masters, total } }) => {
      state.masters = masters.map(master => {
        master.isPendingResetPassword = false;
        master.isPendingResendEmailConfirmation = false;
        return master;
      });
      state.totalItems = total;
      state.isInitialLoading = false;
      state.error = initEmptyError();
    },
    [fetchMasters.rejected]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = payload;
    },
    //#endregion
    //#region Fetch all but available masters
    [fetchAllAvailable.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [fetchAllAvailable.fulfilled]: (state, { payload }) => {
      state.masters = payload;
      state.isPending = false;
      state.error = initEmptyError();
    },
    [fetchAllAvailable.rejected]: (state, { payload }) => {
      state.isPending = false;
      state.error = payload;
    },
    //#endregion
    //#region Create new master
    [addMaster.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [addMaster.fulfilled]: (state, { payload }) => {
      state.masters.unshift({ ...payload, isPendingResetPassword: false, isPendingResendEmailConfirmation: false });
      state.isPending = false;
      state.isShowAddForm = false;
      state.newMaster = initEmptyMaster();
      state.error = initEmptyError();
    },
    [addMaster.rejected]: (state, { payload }) => {
      state.isPending = false;
      if (isGlobalErrorType(payload.type)) state.error = payload;
    },
    //#endregion

    //#region Delete master by id
    [deleteMaster.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [deleteMaster.fulfilled]: (state, { payload }) => {
      state.masters = state.masters.filter(master => master.id !== payload);
      state.isPending = false;
      state.error = initEmptyError();
    },
    [deleteMaster.rejected]: (state, { payload }) => {
      state.isPending = false;

      if (payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
        state.masters = state.masters.filter(master => master.id !== payload.id);
      }

      if (isGlobalErrorType(payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = payload;
    },
    //#endregion

    //#region Get master by id
    [fetchMaster.pending]: state => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newMaster = initEmptyMaster();
      state.oldMaster = initEmptyMaster();
    },
    [fetchMaster.fulfilled]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = initEmptyError();
      state.newMaster = initEmptyMaster(payload);
      state.oldMaster = initEmptyMaster(payload);
    },
    [fetchMaster.rejected]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = payload;
    },
    //#endregion

    //#region Update master by id
    [updateMaster.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
    },
    [updateMaster.fulfilled]: (state, { payload }) => {
      state.isPending = false;
      state.error = initEmptyError();
      state.newMaster = initEmptyMaster(payload);
      state.oldMaster = initEmptyMaster(payload);
    },
    [updateMaster.rejected]: (state, { payload }) => {
      state.isPending = false;
      state.newMaster = state.oldMaster;
      if (isGlobalErrorType(payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = payload;
    },
    //#endregion

    //#region Reset password master
    [resetPasswordMaster.pending]: (state, { meta }) => {
      const idx = state.masters.map(master => master.id).indexOf(meta.arg);
      state.masters[idx].isPendingResetPassword = true;
      state.error = initEmptyError();
    },
    [resetPasswordMaster.fulfilled]: (state, { payload }) => {
      const idx = state.masters.map(master => master.id).indexOf(payload);
      state.masters[idx].isPendingResetPassword = false;
      state.error = initEmptyError();
    },
    [resetPasswordMaster.rejected]: (state, { payload }) => {
      const idx = state.masters.map(master => master.id).indexOf(payload.id);
      state.masters[idx].isPendingResetPassword = false;
      if (payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.masters.filter(master => master.id !== payload.id);
    },
    //#endregion

    //#region Resend master email confirmation
    [resendEmailConfirmationMaster.pending]: (state, { meta }) => {
      const idx = state.masters.map(master => master.id).indexOf(meta.arg);
      state.masters[idx].isPendingResendEmailConfirmation = true;
      state.error = initEmptyError();
    },
    [resendEmailConfirmationMaster.fulfilled]: (state, { payload }) => {
      const idx = state.masters.map(master => master.id).indexOf(payload);
      state.masters[idx].isPendingResendEmailConfirmation = false;
      state.error = initEmptyError();
    },
    [resendEmailConfirmationMaster.rejected]: (state, { payload }) => {
      const idx = state.masters.map(master => master.id).indexOf(payload.id);
      state.masters[idx].isPendingResendEmailConfirmation = false;
      if (payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.masters.filter(master => master.id !== payload.id);
    },
    //#endregion
  },
});

export const {
  changeVisibilityAddMasterForm,
  changeNewMasterField,
  resetMasters,
  changeMasterCurrentPage,
  changeMasterPageSize,
  changeMasterSortFieldName,
  changeMasterSortOrder,
} = masterSlice.actions;
export default masterSlice.reducer;
