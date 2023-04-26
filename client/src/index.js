import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

import { SNACKBAR_MAX_SNACKS, SNACKBAR_AUTOHIDE_TIMEOUT } from './constants';

import { injectStore } from './axios/axios.interceptor';
injectStore(store);

const PayPalOptions = {
  'client-id': process.env.REACT_APP_PAYPAL_CLIENT_ID,
  currency: 'USD',
  components: 'buttons',
};

ReactDOM.render(
  <React.StrictMode>
    <PayPalScriptProvider options={PayPalOptions}>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <SnackbarProvider maxSnack={SNACKBAR_MAX_SNACKS} autoHideDuration={SNACKBAR_AUTOHIDE_TIMEOUT}>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <App />
            </PersistGate>
          </Provider>
        </SnackbarProvider>
      </GoogleOAuthProvider>
    </PayPalScriptProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
