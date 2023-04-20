/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { loginBasicAuth, loginGoogleAuth, registerAuth } from '../thunks';
import { isGlobalErrorType, parseToken } from '../../utils';
import { USER_ROLES, ERROR_TYPE } from '../../constants';

const initEmptyAuth = (token = null) => ({
  user: { ...(token ? parseToken(token) : { role: USER_ROLES.GUEST }) },
  accessToken: token,
});
const initEmptyUser = () => ({ email: '', password: '', name: '', role: USER_ROLES.CLIENT, isTosAccepted: false, cities: [] });
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });

const initialState = {
  authUser: initEmptyAuth(),
  newUser: initEmptyUser(),
  error: initEmptyError(),
  isPending: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    changeNewUserField(state, { payload }) {
      state.newUser[payload.name] = payload.value;
    },
    clearNewUser(state) {
      state.newUser = initEmptyUser();
    },
    destroyAuth(state) {
      state.authUser = initEmptyAuth();
    },
  },
  extraReducers: {
    //#region Login via form
    [loginBasicAuth.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
      state.authUser = initEmptyAuth();
    },
    [loginBasicAuth.fulfilled]: (state, { payload }) => {
      state.authUser = initEmptyAuth(payload);
      state.newUser = initEmptyUser();
      state.error = initEmptyError();
      state.isPending = false;
    },
    [loginBasicAuth.rejected]: (state, { payload }) => {
      state.isPending = false;
      state.error = payload;
    },
    //#endregion
    //#region Register
    [registerAuth.pending]: state => {
      state.error = initEmptyError();
      state.isPending = true;
    },
    [registerAuth.fulfilled]: state => {
      state.error = initEmptyError();
      state.isPending = false;
      state.newUser = initEmptyUser();
    },
    [registerAuth.rejected]: (state, { payload }) => {
      state.error = payload;
      state.isPending = false;
    },
    //#endregion
    //#region Login via google
    [loginGoogleAuth.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
      state.authUser = initEmptyAuth();
    },
    [loginGoogleAuth.fulfilled]: (state, { payload }) => {
      state.authUser = initEmptyAuth(payload);
      state.newUser = initEmptyUser();
      state.error = initEmptyError();
      state.isPending = false;
    },
    [loginGoogleAuth.rejected]: (state, { payload }) => {
      state.isPending = false;
      state.error = payload;
    },
    //#endregion
  },
});

export const { clearNewUser, changeNewUserField } = authSlice.actions;
export default authSlice.reducer;
