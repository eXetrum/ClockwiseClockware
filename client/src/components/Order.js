import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './Header';

const Order = () => {
	return (
		<Container>
			<Header />
			<Container>
				<Row className="justify-content-md-center">
					<Col md="auto">
						<h1>Order page</h1>
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default Order;