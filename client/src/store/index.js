import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { watchReducer, cityReducer, masterReducer, clientReducer, orderReducer, authReducer } from './reducers';

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['watchReducer', 'cityReducer', 'masterReducer', 'clientReducer', 'orderReducer'],
};

const rootReducer = combineReducers({
  watchReducer,
  cityReducer,
  masterReducer,
  clientReducer,
  orderReducer,
  authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
