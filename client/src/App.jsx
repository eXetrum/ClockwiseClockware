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
import HomePage from './pages/common/HomePage';
import LoginPage from './pages/common/LoginPage';
import LogoutPage from './pages/common/LogoutPage';
import OrderPage from './pages/common/OrderPage';
import UserProfilePage from './pages/common/UserProfilePage';
import AdminDashboardCitiesPage from './pages/admin/dashboard/AdminDashboardCitiesPage';
import AdminDashboardMastersPage from './pages/admin/dashboard/AdminDashboardMastersPage';
import AdminDashboardClientsPage from './pages/admin/dashboard/AdminDashboardClientsPage';
import AdminDashboardOrdersPage from './pages/admin/dashboard/AdminDashboardOrdersPage';
import AdminEditCityPage from './pages/admin/edit/AdminEditCityPage';
import AdminEditMasterPage from './pages/admin/edit/AdminEditMasterPage';
import AdminEditClientPage from './pages/admin/edit/AdminEditClientPage';
import AdminEditOrderPage from './pages/admin/edit/AdminEditOrderPage';

import { AxiosInterceptor } from './api/axios.interceptor';

const protect = (child) => <RouteGuard>{child}</RouteGuard>;

const App = () => {
  return (
    <SnackbarProvider maxSnack={5} autoHideDuration={process.env.SNACKBAR_AUTOHIDE_TIMEOUT}>
      <BrowserRouter>
        <AxiosInterceptor>
          <Routes>
            <Route exact path="/" element={<HomePage />} />
            <Route exact path="/login" element={<LoginPage />} />
            <Route exact path="/logout" element={<LogoutPage />} />
            <Route exact path="/order" element={<OrderPage />} />
            <Route exact path="/profile" element={protect(<UserProfilePage />)} />
            <Route exact path="/admin/cities" element={protect(<AdminDashboardCitiesPage />)} />
            <Route exact path="/admin/masters" element={protect(<AdminDashboardMastersPage />)} />
            <Route exact path="/admin/clients" element={protect(<AdminDashboardClientsPage />)} />
            <Route exact path="/admin/orders" element={protect(<AdminDashboardOrdersPage />)} />
            <Route exact path="/admin/cities/:id" element={protect(<AdminEditCityPage />)} />
            <Route exact path="/admin/masters/:id" element={protect(<AdminEditMasterPage />)} />
            <Route exact path="/admin/clients/:id" element={protect(<AdminEditClientPage />)} />
            <Route exact path="/admin/orders/:id" element={protect(<AdminEditOrderPage />)} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AxiosInterceptor>
      </BrowserRouter>
    </SnackbarProvider>
  );
};

export default App;
