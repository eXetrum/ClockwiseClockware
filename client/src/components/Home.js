import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './Header';

const Home = () => {
	return (
		<Container>
			<Header />
			<Container>
				<Row className="justify-content-md-center">
					<Col md="auto">
						<h1>Home page</h1>
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default Home;