import React from 'react';
import { Navigate, BrowserRouter, Route, Routes } from 'react-router-dom';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import './logo.svg';

import { HomePage, LoginPage, LogoutPage, RegisterPage, OrderPage, UserProfilePage, VerifyPage } from './pages/common';
import {
  AdminDashboardCitiesPage,
  AdminDashboardMastersPage,
  AdminDashboardClientsPage,
  AdminDashboardOrdersPage,
} from './pages/admin/dashboard';
import { AdminEditCityPage, AdminEditMasterPage, AdminEditClientPage, AdminEditOrderPage } from './pages/admin/edit';
import { MasterDashboardOrdersPage, MasterScheduleCalendarPage } from './pages/master';
import { ClientDashboardOrdersPage } from './pages/client/dashboard';

import { RouteGuard } from './providers';
import { ACCESS_SCOPE } from './constants';

const AnyAuthRoute = child => <RouteGuard scope={ACCESS_SCOPE.AnyAuth}>{child}</RouteGuard>;
const AdminRoute = child => <RouteGuard scope={ACCESS_SCOPE.AdminOnly}>{child}</RouteGuard>;
const MasterRoute = child => <RouteGuard scope={ACCESS_SCOPE.MasterOnly}>{child}</RouteGuard>;
const ClientRoute = child => <RouteGuard scope={ACCESS_SCOPE.ClientOnly}>{child}</RouteGuard>;
const GuestOrClientRoute = child => (
  <RouteGuard scope={ACCESS_SCOPE.GuestOrClient} redirectTo="/">
    {child}
  </RouteGuard>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<HomePage />} />
        <Route exact path="/login" element={<LoginPage />} />
        <Route exact path="/logout" element={<LogoutPage />} />
        <Route exact path="/register" element={<RegisterPage />} />
        <Route exact path="/order" element={GuestOrClientRoute(<OrderPage />)} />
        <Route exact path="/profile" element={AnyAuthRoute(<UserProfilePage />)} />
        <Route exact path="/admin/cities" element={AdminRoute(<AdminDashboardCitiesPage />)} />
        <Route exact path="/admin/masters" element={AdminRoute(<AdminDashboardMastersPage />)} />
        <Route exact path="/admin/clients" element={AdminRoute(<AdminDashboardClientsPage />)} />
        <Route exact path="/admin/orders" element={AdminRoute(<AdminDashboardOrdersPage />)} />
        <Route exact path="/admin/cities/:id" element={AdminRoute(<AdminEditCityPage />)} />
        <Route exact path="/admin/masters/:id" element={AdminRoute(<AdminEditMasterPage />)} />
        <Route exact path="/admin/clients/:id" element={AdminRoute(<AdminEditClientPage />)} />
        <Route exact path="/admin/orders/:id" element={AdminRoute(<AdminEditOrderPage />)} />
        <Route exact path="/master/orders" element={MasterRoute(<MasterDashboardOrdersPage />)} />
        <Route exact path="/master/schedule" element={MasterRoute(<MasterScheduleCalendarPage />)} />
        <Route exact path="/client/orders" element={ClientRoute(<ClientDashboardOrdersPage />)} />
        <Route exact path="/verify/:token" element={<VerifyPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
