import { createAction } from '@reduxjs/toolkit';

export const DESTROY_AUTH = 'auth/destroyAuth';

export const destroyAuth = createAction(DESTROY_AUTH);
