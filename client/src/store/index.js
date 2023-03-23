import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { cityReducer, masterReducer, clientReducer } from './reducers';

const rootReducer = combineReducers({
  cityReducer,
  masterReducer,
  clientReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
