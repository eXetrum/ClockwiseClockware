import React from 'react';
import {Navigate, BrowserRouter, Route, Routes} from "react-router-dom";

import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import LogIn from './components/Login';
import LogOut from './components/Logout';
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
		<Route exact path="/profile" element={
			<ProtectedRoute>
				<UserProfile />
			</ProtectedRoute>
		} />
		<Route exact path="/admin/cities" element={
			<ProtectedRoute>
				<AdminDashboardCities />
			</ProtectedRoute>
		} />
		<Route path="/admin/cities/:id" element={
			<ProtectedRoute >
				<AdminEditCity />
			</ProtectedRoute>
		} />

		<Route exact path="/admin/clients" element={
			<ProtectedRoute>
				<div>Client route</div>
			</ProtectedRoute>
		} />
		<Route exact path="/admin/masters" element={
			<ProtectedRoute>
				<AdminDashboardMasters  />
			</ProtectedRoute>
		} />
		<Route path="/admin/masters/:id" element={
			<ProtectedRoute >
				<AdminEditMaster />
			</ProtectedRoute>
		} />
		<Route exact path="/admin/booking" element={
			<ProtectedRoute>
				<div>Booking route</div>
			</ProtectedRoute>
		} />
		<Route path="*" element={<Navigate to="/" />} />
	</Routes>
	</BrowserRouter>
	);
};

export default App;