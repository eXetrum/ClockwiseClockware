import React, {Component} from 'react';
import {Link} from 'react-router-dom';

class UserProfile extends Component {
  render() {
    return (
        <div>
          <h1>User Profile</h1>

          <div>Email: {this.props.user.email}</div>
          <div>Password: {this.props.user.password}</div>
		      <Link to="/">Return to Home</Link>
        </div>
    );
  }
}

export default UserProfile;