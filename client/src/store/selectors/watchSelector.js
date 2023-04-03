import { createSelector } from '@reduxjs/toolkit';

const stateAllWatches = state => state.watchReducer.watches;
const stateWatchError = state => state.watchReducer.error;
const stateWatchInitialLoading = state => state.watchReducer.isInitialLoading;

export const selectAllWatches = createSelector([stateAllWatches], allWatches => allWatches);
export const selectWatchError = createSelector([stateWatchError], watchError => watchError);
export const selectWatchInitialLoading = createSelector([stateWatchInitialLoading], loading => loading);
