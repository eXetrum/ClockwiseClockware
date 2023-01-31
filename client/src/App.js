import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import Home from './components/Home';
import LogIn from './components/Login';
import LogOut from './components/Logout';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';

class App extends Component {

  constructor() {
    super();
	console.log('ctor');
	//this.func = this.func.bind(this);
  }
  
  componentDidMount() {
	  console.log('componentDidMount');
  }

  render() {
	const HomeComponent = () => (<Home />);
	const LogInComponent = () => (<LogIn />);
	const LogOutComponent = () => (<LogOut />);
  const ProfileComponent = () => ( <UserProfile /> );
	const AdminDashboardComponent = () => (<AdminDashboard />);

	return (
		<Router>
      <div>
        <Route exact path="/" render={HomeComponent} />
        <Route exact path="/login" render={LogInComponent} />
        <Route exact path="/logout" render={LogOutComponent} />
        <Route exact path="/profile" render={ProfileComponent} />
        <Route exact path="/admin/dashboard" render={AdminDashboardComponent} />
      </div>
    </Router>
	);
  }

}

export default App;