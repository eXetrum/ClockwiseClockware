import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { cityReducer, masterReducer } from './reducers';

const rootReducer = combineReducers({
  cityReducer,
  masterReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
