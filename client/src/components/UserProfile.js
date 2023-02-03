import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './Header';
import AuthService from '../services/auth.service';

const UserProfile = () =>  {
	const [user, setUser] = useState(null);

	useEffect( () => {
		const user = AuthService.getCurrentUser();
		setUser(user);
	}, []);

    return (
	<Container>
		<Header />
		{user && <Container>
			<Row className="justify-content-md-center">
				<Col md="auto">
					<h1>User Profile</h1>
					<div>Email: {user.email}</div>
					<div>Password: {user.password}</div>
				</Col>
			</Row>
		</Container>
		}
	</Container>
    );
};

export default UserProfile;