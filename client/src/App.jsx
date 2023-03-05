import React from 'react';
import { Navigate, BrowserRouter, Route, Routes } from 'react-router-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import './logo.svg';

import { SnackbarProvider } from 'notistack';

import RouteGuard from './components/RouteGuard';
import Home from './components/Home';
import Login from './components/Login';
import Logout from './components/Logout';
import Order from './components/Order';
import UserProfile from './components/UserProfile';
import AdminDashboardCities from './components/admin/AdminDashboardCities';
import AdminEditCity from './components/admin/AdminEditCity';
import AdminDashboardMasters from './components/admin/AdminDashboardMasters';
import AdminEditMaster from './components/admin/AdminEditMaster';
import AdminDashboardClients from './components/admin/AdminDashboardClients';
import AdminEditClient from './components/admin/AdminEditClient';
import AdminDashboardOrders from './components/admin/AdminDashboardOrders';
import AdminEditOrder from './components/admin/AdminEditOrder';

import { AxiosInterceptor } from './api/axios.interceptor';

const protect = (child) => <RouteGuard>{child}</RouteGuard>;

const App = () => {
  const SNACKBAR_AUTOHIDE_TIMEOUT = 6000;
  return (
    <SnackbarProvider maxSnack={5} autoHideDuration={SNACKBAR_AUTOHIDE_TIMEOUT}>
      <BrowserRouter>
        <AxiosInterceptor>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/logout" element={<Logout />} />
            <Route exact path="/order" element={<Order />} />
            <Route exact path="/profile" element={protect(<UserProfile />)} />
            <Route exact path="/admin/cities" element={protect(<AdminDashboardCities />)} />
            <Route exact path="/admin/cities/:id" element={protect(<AdminEditCity />)} />
            <Route exact path="/admin/masters" element={protect(<AdminDashboardMasters />)} />
            <Route exact path="/admin/masters/:id" element={protect(<AdminEditMaster />)} />
            <Route exact path="/admin/clients" element={protect(<AdminDashboardClients />)} />
            <Route exact path="/admin/clients/:id" element={protect(<AdminEditClient />)} />
            <Route exact path="/admin/orders" element={protect(<AdminDashboardOrders />)} />
            <Route exact path="/admin/orders/:id" element={protect(<AdminEditOrder />)} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AxiosInterceptor>
      </BrowserRouter>
    </SnackbarProvider>
  );
};

export default App;
