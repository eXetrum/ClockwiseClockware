import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import Home from './components/Home';
import LogIn from './components/Login';
import LogOut from './components/Logout';
import UserProfile from './components/UserProfile';

class App extends Component {

  constructor() {
    super();
	console.log('ctor');
	this.state = {
		user: {
			email: '',
			password: '',
		},
	};
    /*this.state = {
      accountBalance: 0,//14568.27,
      currentUser: {
        userName: 'joe_shmo',
        memberSince: '07/23/96',
      },
	  debits: [],
	  credits: []
    }
	
	this.addDebit = this.addDebit.bind(this);
	this.addCredit = this.addCredit.bind(this);
	this.updateAccountBalance = this.updateAccountBalance.bind(this);*/
  }
  
  componentDidMount() {
	  console.log('componentDidMount');
	  /*fetch(this.DEBITS_API_URL)
	  .then(response => response.json())
	  .then(data => {
		  console.log('Debits: ', data);
		  this.setState({ debits: data});
		  this.updateAccountBalance();
	  });
	  
	  fetch(this.CREDITS_API_URL)
	  .then(response => response.json())
	  .then(data => {
		  console.log('Credits: ', data);
		  this.setState({ credits: data});
		  this.updateAccountBalance();
	  });*/
  }
  mockLogIn = (logInInfo) => {
    const newUser = {...this.state.user}
    newUser.email = logInInfo.email;
	newUser.password = logInInfo.password;
    this.setState({user: newUser})
  }
  /*
  updateAccountBalance() {
	  const debits = this.state.debits;
	  const credits = this.state.credits;
	  var totalDebit = 0;
	  var totalCredit = 0;
	  for(let i = 0; i < debits.length; ++i) totalDebit += debits[i].amount;	  
	  for(let i = 0; i < credits.length; ++i) totalCredit += credits[i].amount;
	  console.log('Update: ', totalDebit, totalCredit, totalDebit - totalCredit);
	  this.setState({accountBalance: totalDebit - totalCredit});
  }
  
  addDebit(newDebit) {
	  var debits = this.state.debits;
	  newDebit.id = debits.length + "";	 
	  debits.push(newDebit);
	  this.setState({debits: debits});
	  this.updateAccountBalance();
  }
  
  addCredit(newCredit) {
	  var credits = this.state.credits;
	  newCredit.id = credits.length + "";
	  credits.push(newCredit);
	  this.setState({credits: credits});
	  this.updateAccountBalance();
  }
  
  mockLogIn = (logInInfo) => {
    const newUser = {...this.state.currentUser}
    newUser.userName = logInInfo.userName
    this.setState({currentUser: newUser})
  }

  render() {

    const HomeComponent = () => (<Home accountBalance={this.state.accountBalance}/>);
    const UserProfileComponent = () => ( <UserProfile userName={this.state.currentUser.userName} memberSince={this.state.currentUser.memberSince}  /> );
	const LogInComponent = () => (<LogIn user={this.state.currentUser} mockLogIn={this.mockLogIn} />);
	const DebitsComponent = () => (<Debits accountBalance={this.state.accountBalance} debits={this.state.debits} addDebit={this.addDebit} />);
	const CreditsComponent = () => (<Credits accountBalance={this.state.accountBalance} credits={this.state.credits} addCredit={this.addCredit} />);

    return (
        <Router>
          <div>
            <Route exact path="/" render={HomeComponent} />
            <Route exact path="/userProfile" render={UserProfileComponent} />
			<Route exact path="/login" render={LogInComponent} />
			<Route exact path="/debits" render={DebitsComponent} />
			<Route exact path="/credits" render={CreditsComponent} />
          </div>
        </Router>
    );
  }*/

  render() {
	const HomeComponent = () => (<Home user={this.state.user} />);
	const LogInComponent = () => (<LogIn user={this.state.user} mockLogIn={this.mockLogIn} />);
	const LogOutComponent = () => (<LogOut />);
    const ProfileComponent = () => ( <UserProfile user={this.state.user} /> );
	return (
		<Router>
          <div>
            <Route exact path="/" render={HomeComponent} />
            <Route exact path="/login" render={LogInComponent} />
			<Route exact path="/logout" render={LogOutComponent} />
			<Route exact path="/profile" render={ProfileComponent} />
          </div>
        </Router>
	);
  }

}

export default App;