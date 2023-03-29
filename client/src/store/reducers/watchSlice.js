/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { fetchWatches } from '../thunks';
import { ERROR_TYPE } from '../../constants';

const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });

const initialState = {
  watches: [],
  error: initEmptyError(),
  isInitialLoading: false,
  isPending: false,
};

export const watchSlice = createSlice({
  name: 'watch',
  initialState,
  reducers: {},
  extraReducers: {
    //#region Fetch all watches
    [fetchWatches.pending]: (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    },
    [fetchWatches.fulfilled]: (state, action) => {
      state.watches = action.payload;
      state.isInitialLoading = false;
      state.error = initEmptyError();
    },
    [fetchWatches.rejected]: (state, action) => {
      state.isInitialLoading = false;
      state.error = action.payload;
    },
    //#endregion
  },
});

export default watchSlice.reducer;
