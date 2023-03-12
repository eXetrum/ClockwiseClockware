import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { SnackbarProvider } from 'notistack';
import { SNACKBAR_MAX_SNACKS, SNACKBAR_AUTOHIDE_TIMEOUT } from './constants';

import { AuthProvider } from './hooks';

import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_API_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

ReactDOM.render(
  <React.StrictMode>
    <SnackbarProvider maxSnack={SNACKBAR_MAX_SNACKS} autoHideDuration={SNACKBAR_AUTOHIDE_TIMEOUT}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </SnackbarProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
