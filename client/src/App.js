import React from 'react';
import { Navigate, BrowserRouter, Route, Routes } from "react-router-dom";

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './App.css';
import './logo.svg';

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

import { SnackbarProvider } from 'notistack';
import { AxiosInterceptor } from './api/axios.interceptor';

const App = () => {
	const snackbarAutoHideTimeout = 6000;

	return (
	<SnackbarProvider maxSnack={5} autoHideDuration={snackbarAutoHideTimeout} >
		<BrowserRouter>
			<AxiosInterceptor>
				<Routes>
					<Route exact path="/" element={<Home />} />
					<Route exact path="/login" element={<Login />} />
					<Route exact path="/logout" element={<Logout />} />
					<Route exact path="/order" element={<Order />} />
					<Route exact path="/profile" element={
						<RouteGuard>
							<UserProfile />
						</RouteGuard>
					} />
					<Route exact path="/admin/cities" element={
						<RouteGuard>
							<AdminDashboardCities />				
						</RouteGuard>
					} />
					<Route path="/admin/cities/:id" element={
						<RouteGuard >
							<AdminEditCity />
						</RouteGuard>
					} />
					<Route exact path="/admin/masters" element={
						<RouteGuard>
							<AdminDashboardMasters  />
						</RouteGuard>
					} />
					<Route path="/admin/masters/:id" element={
						<RouteGuard >
							<AdminEditMaster />
						</RouteGuard>
					} />
					<Route exact path="/admin/clients" element={
						<RouteGuard>
							<AdminDashboardClients />
						</RouteGuard>
					} />
					<Route exact path="/admin/clients/:id" element={
						<RouteGuard>
							<AdminEditClient />
						</RouteGuard>
					} />
					<Route exact path="/admin/orders" element={
						<RouteGuard>
							<AdminDashboardOrders />
						</RouteGuard>
					} />
					<Route exact path="/admin/orders/:id" element={
						<RouteGuard>
							<AdminEditOrder />
						</RouteGuard>
					} />
					<Route path="*" element={<Navigate to="/" />} />
				</Routes>
			</AxiosInterceptor>
		</BrowserRouter>
	</SnackbarProvider>
	);
};

export default App;