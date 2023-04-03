import { createSelector } from '@reduxjs/toolkit';

const stateAuthCurrentUser = state => state.authReducer.authUser;
const stateAuthNewUser = state => state.authReducer.newUser;
const stateAuthError = state => state.authReducer.error;
const stateAuthPending = state => state.authReducer.isPending;

export const selectAuthenticatedUser = createSelector([stateAuthCurrentUser], authUser => authUser);
export const selectNewUser = createSelector([stateAuthNewUser], newUser => newUser);
export const selectUserError = createSelector([stateAuthError], userError => userError);
export const selectUserPending = createSelector([stateAuthPending], pending => pending);
