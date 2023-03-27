/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { fetchWatches } from './ActionCreators';
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
  extraReducers: (builder) => {
    //#region Fetch all watches
    builder.addCase(fetchWatches.pending, (state, _) => {
      state.isInitialLoading = true;
      state.error = initEmptyError();
    }),
      builder.addCase(fetchWatches.fulfilled, (state, action) => {
        state.watches = action.payload;
        state.isInitialLoading = false;
        state.error = initEmptyError();
      }),
      builder.addCase(fetchWatches.rejected, (state, action) => {
        state.isInitialLoading = false;
        state.error = action.payload;
      });
    //#endregion
  },
});

export default watchSlice.reducer;
