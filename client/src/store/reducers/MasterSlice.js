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
} from './ActionCreators';
import { isGlobalErrorType } from '../../utils';
import { ERROR_TYPE } from '../../constants';

const initEmptyMaster = () => ({ name: '', email: '', password: '', rating: 0, isApprovedByAdmin: false, cities: [] });
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
  },
  extraReducers: builder => {
    //#region Fetch all masters
    builder.addCase(fetchMasters.pending, (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    }),
      builder.addCase(fetchMasters.fulfilled, (state, action) => {
        state.masters = action.payload.map(master => {
          master.isPendingResetPassword = false;
          master.isPendingResendEmailConfirmation = false;
          return master;
        });
        state.isInitialLoading = false;
        state.error = initEmptyError();
      }),
      builder.addCase(fetchMasters.rejected, (state, action) => {
        state.isInitialLoading = false;
        state.error = action.payload;
      });
    //#endregion
    //#region Fetch all but available masters
    builder.addCase(fetchAllAvailable.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(fetchAllAvailable.fulfilled, (state, action) => {
        state.masters = action.payload;
        state.isPending = false;
        state.error = initEmptyError();
      }),
      builder.addCase(fetchAllAvailable.rejected, (state, action) => {
        state.isPending = false;
        state.error = action.payload;
      });
    //#endregion
    //#region Create new master
    builder.addCase(addMaster.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(addMaster.fulfilled, (state, action) => {
        state.masters = [{ ...action.payload, isPendingResetPassword: false, isPendingResendEmailConfirmation: false }, ...state.masters];
        state.isPending = false;
        state.isShowAddForm = false;
        state.newMaster = initEmptyMaster();
        state.error = initEmptyError();
      }),
      builder.addCase(addMaster.rejected, (state, action) => {
        state.isPending = false;
        if (isGlobalErrorType(action.payload.type)) state.error = action.payload;
      });
    //#endregion

    //#region Delete master by id
    builder.addCase(deleteMaster.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(deleteMaster.fulfilled, (state, action) => {
        state.masters = state.masters.filter(master => master.id !== action.payload);
        state.isPending = false;
        state.error = initEmptyError();
      }),
      builder.addCase(deleteMaster.rejected, (state, action) => {
        state.isPending = false;

        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) {
          state.masters = state.masters.filter(master => master.id !== action.payload.id);
        }

        if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.ENTRY_NOT_FOUND])) state.error = action.payload;
      });
    //#endregion

    //#region Get master by id
    builder.addCase(fetchMaster.pending, (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
      state.newMaster = initEmptyMaster();
      state.oldMaster = initEmptyMaster();
    }),
      builder.addCase(fetchMaster.fulfilled, (state, action) => {
        state.isInitialLoading = false;
        state.error = initEmptyError();
        state.newMaster = action.payload;
        state.oldMaster = action.payload;
      }),
      builder.addCase(fetchMaster.rejected, (state, action) => {
        state.isInitialLoading = false;
        state.error = action.payload;
      });
    //#endregion

    //#region Update master by id
    builder.addCase(updateMaster.pending, (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
    }),
      builder.addCase(updateMaster.fulfilled, (state, action) => {
        state.isPending = false;
        state.error = initEmptyError();
        state.newMaster = action.payload;
        state.oldMaster = action.payload;
      }),
      builder.addCase(updateMaster.rejected, (state, action) => {
        state.isPending = false;
        state.newMaster = state.oldMaster;
        if (isGlobalErrorType(action.payload.type, [ERROR_TYPE.BAD_REQUEST])) state.error = action.payload;
      });
    //#endregion

    //#region Reset password master
    builder.addCase(resetPasswordMaster.pending, (state, action) => {
      const userId = action.meta.arg;
      const idx = state.masters.map(master => master.id).indexOf(userId);
      state.masters[idx].isPendingResetPassword = true;
      state.error = initEmptyError();
    }),
      builder.addCase(resetPasswordMaster.fulfilled, (state, action) => {
        const userId = action.payload;
        const idx = state.masters.map(master => master.id).indexOf(userId);
        const master = state.masters[idx];
        state.masters[idx].isPendingResetPassword = false;
        state.error = initEmptyError();
      }),
      builder.addCase(resetPasswordMaster.rejected, (state, action) => {
        const idx = state.masters.map(master => master.id).indexOf(action.payload.id);
        state.masters[idx].isPendingResetPassword = false;
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.masters.filter(master => master.id !== action.payload.id);
      });
    //#endregion

    //#region Resend master email confirmation
    builder.addCase(resendEmailConfirmationMaster.pending, (state, action) => {
      const userId = action.meta.arg;
      const idx = state.masters.map(master => master.id).indexOf(userId);
      state.masters[idx].isPendingResendEmailConfirmation = true;
      state.error = initEmptyError();
    }),
      builder.addCase(resendEmailConfirmationMaster.fulfilled, (state, action) => {
        const userId = action.payload;
        const idx = state.masters.map(master => master.id).indexOf(userId);
        const master = state.masters[idx];
        state.masters[idx].isPendingResendEmailConfirmation = false;
        state.error = initEmptyError();
      }),
      builder.addCase(resendEmailConfirmationMaster.rejected, (state, action) => {
        const idx = state.masters.map(master => master.id).indexOf(action.payload.id);
        state.masters[idx].isPendingResendEmailConfirmation = false;
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) state.masters.filter(master => master.id !== action.payload.id);
      });
    //#endregion
  },
});

export const { changeVisibilityAddForm, changeNewMasterField } = masterSlice.actions;
export default masterSlice.reducer;
