import React, {Component} from 'react';
import {Navigate, BrowserRouter, Route, Routes} from "react-router-dom";
import { useParams } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import LogIn from './components/Login';
import LogOut from './components/Logout';
import UserProfile from './components/UserProfile';
import AdminDashboardCities from './components/admin/AdminDashboardCities';
import AdminEditCity from './components/admin/AdminEditCity';

import AdminDashboardMasters from './components/admin/AdminDashboardMasters';

class App extends Component {

	constructor() {
		super();
		console.log('App ctor');
		//this.func = this.func.bind(this);
	}

	render() {

		const AdminEditCityWrapper = () => {
			const {id} = useParams();
			return <AdminEditCity id={id} />;
		}

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
					<AdminEditCityWrapper />
				</ProtectedRoute>
			} />

			<Route exact path="/admin/clients" element={
				<ProtectedRoute>
					<AdminDashboardCities  />
				</ProtectedRoute>
			} />
			<Route exact path="/admin/masters" element={
				<ProtectedRoute>
					<AdminDashboardMasters  />
				</ProtectedRoute>
			} />
			<Route exact path="/admin/booking" element={
				<ProtectedRoute>
					<AdminDashboardCities  />
				</ProtectedRoute>
			} />
			<Route path="*" element={<Navigate to="/" />} />
		</Routes>
		</BrowserRouter>
		);
	}
}

export default App;