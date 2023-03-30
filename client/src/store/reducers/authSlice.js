/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { loginAuth, registerAuth } from '../thunks';
import { isGlobalErrorType, parseToken } from '../../utils';
import { USER_ROLES, ERROR_TYPE } from '../../constants';

const initEmptyUser = () => ({ email: '', password: '', name: '', role: USER_ROLES.CLIENT, isTosAccepted: false, cities: [] });
const initEmptyAuth = (token = null) => ({ user: parseToken(token), accessToken: token });
const initEmptyError = () => ({ message: '', type: ERROR_TYPE.NONE });

const initialState = {
  newUser: initEmptyUser(),
  authUser: initEmptyAuth(),
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
    destroyAuth(state) {
      state.authUser = initEmptyAuth();
    },
  },
  extraReducers: {
    //#region Login
    [loginAuth.pending]: state => {
      state.isPending = true;
      state.error = initEmptyError();
      state.authUser = initEmptyAuth();
    },
    [loginAuth.fulfilled]: (state, { payload }) => {
      state.authUser = initEmptyAuth(payload);
      state.newUser = initEmptyUser();
      state.error = initEmptyError();
      state.isPending = false;
    },
    [loginAuth.rejected]: (state, { payload }) => {
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
      state.newUser = initEmptyUser();
      state.error = initEmptyError();
      state.isPending = false;
    },
    [registerAuth.rejected]: (state, { payload }) => {
      state.error = payload;
      state.isPending = false;
    },
    //#endregion
  },
});

export const { changeNewUserField } = authSlice.actions;
export default authSlice.reducer;
