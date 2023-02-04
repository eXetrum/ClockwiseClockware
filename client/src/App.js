import React from 'react';
import { Navigate, BrowserRouter, Route, Routes } from "react-router-dom";

import RouteGuard from './components/RouteGuard';
import Home from './components/Home';
import LogIn from './components/Login';
import LogOut from './components/Logout';
import Order from './components/Order';
import UserProfile from './components/UserProfile';
import AdminDashboardCities from './components/admin/AdminDashboardCities';
import AdminEditCity from './components/admin/AdminEditCity';
import AdminDashboardMasters from './components/admin/AdminDashboardMasters';
import AdminEditMaster from './components/admin/AdminEditMaster';

const App = () => {
	return (
	<BrowserRouter>
	<Routes>
		<Route exact path="/" element={<Home />} />
		<Route exact path="/login" element={<LogIn />} />
		<Route exact path="/logout" element={<LogOut />} />
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

		<Route exact path="/admin/clients" element={
			<RouteGuard>
				<div>Client route</div>
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
		<Route exact path="/admin/booking" element={
			<RouteGuard>
				<div>Booking route</div>
			</RouteGuard>
		} />
		<Route path="*" element={<Navigate to="/" />} />
	</Routes>
	</BrowserRouter>
	);
};

export default App;