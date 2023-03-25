import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { cityReducer, masterReducer, clientReducer, orderReducer } from './reducers';

const rootReducer = combineReducers({
  cityReducer,
  masterReducer,
  clientReducer,
  orderReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
