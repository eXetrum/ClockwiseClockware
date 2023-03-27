import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { watchReducer, cityReducer, masterReducer, clientReducer, orderReducer } from './reducers';

const rootReducer = combineReducers({
  watchReducer,
  cityReducer,
  masterReducer,
  clientReducer,
  orderReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
