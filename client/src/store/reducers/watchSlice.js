/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { fetchWatches } from '../thunks';
import { ERROR_TYPE } from '../../constants';

const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });

const initialState = {
  watches: [],
  error: initEmptyError(),
  isInitialLoading: false,
};

export const watchSlice = createSlice({
  name: 'watch',
  initialState,
  reducers: {},
  extraReducers: {
    //#region Fetch all watches
    [fetchWatches.pending]: state => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    },
    [fetchWatches.fulfilled]: (state, { payload }) => {
      state.watches = payload;
      state.isInitialLoading = false;
      state.error = initEmptyError();
    },
    [fetchWatches.rejected]: (state, { payload }) => {
      state.isInitialLoading = false;
      state.error = payload;
    },
    //#endregion
  },
});

export default watchSlice.reducer;
