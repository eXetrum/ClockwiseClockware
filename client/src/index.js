import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { SnackbarProvider } from 'notistack';
import { SNACKBAR_MAX_SNACKS, SNACKBAR_AUTOHIDE_TIMEOUT } from './constants';

import { AuthProvider } from './hooks';

import axios from 'axios';

import { store } from './store';
import { Provider } from 'react-redux';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

ReactDOM.render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={SNACKBAR_MAX_SNACKS} autoHideDuration={SNACKBAR_AUTOHIDE_TIMEOUT}>
      <Provider store={store}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Provider>
    </SnackbarProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
