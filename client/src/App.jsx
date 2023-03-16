import React from 'react';
import { Navigate, BrowserRouter, Route, Routes } from 'react-router-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import './logo.svg';

import { HomePage, LoginPage, LogoutPage, RegisterPage, OrderPage, UserProfilePage } from './pages/common';
import {
  AdminDashboardCitiesPage,
  AdminDashboardMastersPage,
  AdminDashboardClientsPage,
  AdminDashboardOrdersPage,
} from './pages/admin/dashboard';
import { AdminEditCityPage, AdminEditMasterPage, AdminEditClientPage, AdminEditOrderPage } from './pages/admin/edit';

import { AxiosInterceptor } from './api/axios.interceptor';
import { RouteGuard } from './providers';

import { ACCESS_SCOPE } from './constants';

const protect = (child, scope = ACCESS_SCOPE.AnyAuth) => <RouteGuard scope={scope}>{child}</RouteGuard>;

const App = () => {
  return (
    <BrowserRouter>
      <AxiosInterceptor>
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route exact path="/login" element={<LoginPage />} />
          <Route exact path="/logout" element={<LogoutPage />} />
          <Route exact path="/register" element={<RegisterPage />} />
          <Route exact path="/order" element={<OrderPage />} />
          <Route exact path="/profile" element={protect(<UserProfilePage />)} />
          <Route exact path="/admin/cities" element={protect(<AdminDashboardCitiesPage />, ACCESS_SCOPE.AdminOnly)} />
          <Route exact path="/admin/masters" element={protect(<AdminDashboardMastersPage />, ACCESS_SCOPE.AdminOnly)} />
          <Route exact path="/admin/clients" element={protect(<AdminDashboardClientsPage />, ACCESS_SCOPE.AdminOnly)} />
          <Route exact path="/admin/orders" element={protect(<AdminDashboardOrdersPage />, ACCESS_SCOPE.AdminOnly)} />
          <Route exact path="/admin/cities/:id" element={protect(<AdminEditCityPage />, ACCESS_SCOPE.AdminOnly)} />
          <Route exact path="/admin/masters/:id" element={protect(<AdminEditMasterPage />, ACCESS_SCOPE.AdminOnly)} />
          <Route exact path="/admin/clients/:id" element={protect(<AdminEditClientPage />, ACCESS_SCOPE.AdminOnly)} />
          <Route exact path="/admin/orders/:id" element={protect(<AdminEditOrderPage />, ACCESS_SCOPE.AdminOnly)} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AxiosInterceptor>
    </BrowserRouter>
  );
};

export default App;
