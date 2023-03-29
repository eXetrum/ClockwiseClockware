/* eslint-disable */
import { createSlice } from '@reduxjs/toolkit';
import { loginAuth, registerAuth } from '../thunks';
import { isGlobalErrorType, parseToken } from '../../utils';
import { USER_ROLES, ERROR_TYPE } from '../../constants';

const initEmptyUser = () => ({ email: '', password: '', name: '', role: USER_ROLES.CLIENT, isTosAccepted: false, cities: [] });
const initEmptyAuth = (token = null) => ({
  user: { ...(token ? parseToken(token) : { role: USER_ROLES.GUEST }) },
  accessToken: token,
});

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
    changeNewUserField(state, action) {
      state.newUser[action.payload.name] = action.payload.value;
    },
    destroyAuth(state, _) {
      state.authUser = initEmptyAuth();
    },
  },
  extraReducers: {
    //#region Login
    [loginAuth.pending]: (state, _) => {
      state.isPending = true;
      state.error = initEmptyError();
      state.authUser = initEmptyAuth();
    },
    [loginAuth.fulfilled]: (state, action) => {
      state.authUser = initEmptyAuth(action.payload);
      console.log('auth user: ', initEmptyAuth(action.payload));
      state.newUser = initEmptyUser();
      state.error = initEmptyError();
      state.isPending = false;
    },
    [loginAuth.rejected]: (state, action) => {
      state.isPending = false;
      state.error = action.payload;
    },
    //#endregion
    //#region Register
    [registerAuth.pending]: (state, _) => {
      state.error = initEmptyError();
      state.isPending = true;
    },
    [registerAuth.fulfilled]: (state, action) => {
      state.error = initEmptyError();
      state.isPending = false;
      state.newUser = initEmptyUser();
    },
    [registerAuth.rejected]: (state, action) => {
      state.error = action.payload;
      state.isPending = false;
    },
    //#endregion
  },
});

export const { changeNewUserField } = authSlice.actions;
export default authSlice.reducer;
