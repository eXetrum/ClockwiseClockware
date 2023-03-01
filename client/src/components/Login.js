import React, { useState, useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import Header from './Header';
import ErrorContainer from './ErrorContainer';
import { isLoggedIn, login, setToken } from '../api/auth';

const Login = () => {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const location = useLocation();
	const fromPage = location.state?.from?.pathname || '/';

	const [user, setUser] = useState({email: '', password: ''});
	const [pending, setPending] = useState(false);
	const [redirect, setRedirect] = useState(isLoggedIn());
	const [error, setError] = useState(null);

    const isFormValid = useCallback(() => /\w{1,}@\w{1,}\.\w{2,}/ig.test(user?.email) && user.password, [user]);

	const doLogin = async (email, password) => {
		try {
			const response = await login(email, password);
			if(response?.data?.accessToken) {
				const { accessToken } = response.data;
				setToken(accessToken);
				enqueueSnackbar(`Success`, { variant: 'success' });
				setRedirect(true);
			}
		} catch(e) {
			console.log("doLogin: ", e);
			setError(e);
			if(e?.response?.data?.detail) {
				enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
			}
		} finally {
			setPending(false);
		}
	};

	const onFormFieldChange = (event) => {
		const inputField = event.target.name
		const inputValue = event.target.value
		
		setUser((prev) => ({...prev, [inputField]: inputValue }));
		setError(null);
	};

	const onFormSubmit = (event) => {
		event.preventDefault();

		setPending(true);
		setError(null);
		
		doLogin({ ...user });
	};

	if(redirect) {
		return (<Navigate to={fromPage} />);
	}

	return (
		<Container>
			<Header />
			<Container>
				<hr/>
				<Row className="justify-content-md-center">
					<Col xs lg="4" md="auto">
						<h1>Login page</h1>
						<Form onSubmit={onFormSubmit}>
							<Form.Group className="mb-3">
							<Form.Label>Email address</Form.Label>
							<Form.Control type="email" placeholder="Enter email" name="email" autoFocus
								onChange={onFormFieldChange}							
								value={user.email}
								disabled={pending}
							/>
							</Form.Group>
							<Form.Group className="mb-3">
							<Form.Label>Password</Form.Label>
							<Form.Control type="password" placeholder="Password" name="password"
								onChange={onFormFieldChange} 			
								value={user.password}
								disabled={pending}
							/>
							</Form.Group>
							<Button variant="primary" type="submit" disabled={!isFormValid()}>
							{pending && <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
							Login
							</Button>                
						</Form>
					</Col>
				</Row>
				
				<hr/>
				<ErrorContainer error={error} />
			</Container>
      	</Container>
	);
};

export default Login;