import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './Header';
import Clock from './Clock';

const Home = () => {
	return (
		<Container>
			<Header />
			<Container>
				<Row className="justify-content-md-center">
					<Col md="auto">
						<center>
							<h1>Home page</h1>
						</center>
						<Clock />
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default Home;