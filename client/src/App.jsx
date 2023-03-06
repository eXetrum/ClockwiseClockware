import React from 'react';
import { Navigate, BrowserRouter, Route, Routes } from 'react-router-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import './logo.svg';

import { SnackbarProvider } from 'notistack';

import RouteGuard from './providers/RouteGuard';
import Home from './pages/common/Home';
import Login from './pages/common/Login';
import Logout from './pages/common/Logout';
import Order from './pages/common/Order';
import UserProfile from './pages/common/UserProfile';
import AdminDashboardCities from './pages/admin/dashboard/AdminDashboardCities';
import AdminDashboardMasters from './pages/admin/dashboard/AdminDashboardMasters';
import AdminDashboardClients from './pages/admin/dashboard/AdminDashboardClients';
import AdminDashboardOrders from './pages/admin/dashboard/AdminDashboardOrders';
import AdminEditCity from './pages/admin/edit/AdminEditCity';
import AdminEditMaster from './pages/admin/edit/AdminEditMaster';
import AdminEditClient from './pages/admin/edit/AdminEditClient';
import AdminEditOrder from './pages/admin/edit/AdminEditOrder';

import { AxiosInterceptor } from './api/axios.interceptor';

const protect = (child) => <RouteGuard>{child}</RouteGuard>;

const App = () => {
  return (
    <SnackbarProvider maxSnack={5} autoHideDuration={process.env.SNACKBAR_AUTOHIDE_TIMEOUT}>
      <BrowserRouter>
        <AxiosInterceptor>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/logout" element={<Logout />} />
            <Route exact path="/order" element={<Order />} />
            <Route exact path="/profile" element={protect(<UserProfile />)} />
            <Route exact path="/admin/cities" element={protect(<AdminDashboardCities />)} />
            <Route exact path="/admin/masters" element={protect(<AdminDashboardMasters />)} />
            <Route exact path="/admin/clients" element={protect(<AdminDashboardClients />)} />
            <Route exact path="/admin/orders" element={protect(<AdminDashboardOrders />)} />
            <Route exact path="/admin/cities/:id" element={protect(<AdminEditCity />)} />
            <Route exact path="/admin/masters/:id" element={protect(<AdminEditMaster />)} />
            <Route exact path="/admin/clients/:id" element={protect(<AdminEditClient />)} />
            <Route exact path="/admin/orders/:id" element={protect(<AdminEditOrder />)} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AxiosInterceptor>
      </BrowserRouter>
    </SnackbarProvider>
  );
};

export default App;
