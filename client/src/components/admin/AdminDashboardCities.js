import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Table, Button, Alert, Spinner
} from 'react-bootstrap';

import Header from '../Header';
//import ApiService from '../../api/api.service';
import { getCities, createCity, deleteCityById } from '../../api/cities';


const AdminDashboardCities = () => {
    const [cities, setCities] = useState(null);
    const [newCityName, setNewCityName] = useState('');
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

    // 'componentDidMount'
    useEffect(() => {
        console.log('"componentDidMount" getCityById');
        const fetchCities = async () => {
            try {
                const response = await getCities();
                if (response && response.data && response.data.cities) {                    
                    const { cities } = response.data;
                    setCities(cities);
                }
            } catch (e) {
                setError(e);
            } finally {
                setPending(false);
            }
        }
		fetchCities();
    }, []);

	const handleSubmit = (e) => {
		e.preventDefault()
        const curCityName = newCityName;
		setPending(true);
        setNewCityName('');
        setInfo(null);
        setError(null);

        const doCreateCity = async (cityName) => {
			try {
				const response = await createCity(cityName);
				if (response && response.data && response.data.cities) {                    
                    const { cities } = response.data;
                    setCities(cities);
                }
			} catch(e) {
				setError(e);
			} finally {
				setPending(false);
			}
		};

        doCreateCity(curCityName);
	};

	const handleRemove = (cityId) => {
		console.log('handleRemove');
        if (!window.confirm("Delete?")) { return; }

		setPending(true);
        setNewCityName('');
        setInfo(null);
        setError(null);

		const doDeleteCityById = async (id) => {
			try {
				const response = await deleteCityById(id);
				if (response && response.data && response.data.cities) {                    
                    const { cities } = response.data;
                    setCities(cities);
                }
			} catch(e) {
				setError(e);
			} finally {
				setPending(false);
			}
		};

        doDeleteCityById(cityId);
	};

    return (
	<Container>
		<Header />
		<Container>              
			<center>
				<h1>Admin: Cities Dashboard</h1>
			</center>
			<hr/>			
			<>
			<Form inline="true" className="d-flex align-items-end" onSubmit={handleSubmit}>
				<FormGroup>
					<Form.Label>City:</Form.Label>
					<FormControl type="text" name="city" 
						value={newCityName}
						onChange={(event) => { 
							setNewCityName(event.target.value); 
							setInfo(null);
							setError(null);
						}}
					/>
				</FormGroup>
				<Button type="submit" className="ms-2" disabled={!newCityName} >Add</Button>
		  	</Form>
			<hr/>
			<Row className="justify-content-md-center">
                <Col md="auto">
                    {info && <Alert key='success' variant='success'>{info}</Alert>}
                    {error && <Alert key='danger' variant='danger'>{error.toString()}</Alert>}
                </Col>
            </Row>			
			</>
			{(!cities && pending) && <center><Spinner animation="grow" /> </center>}
			{cities && 
			<Table bordered hover responsive size="sm">
				<thead>
					<tr>
						<th>id</th><th>name</th><th></th><th></th>
					</tr>
				</thead>
			  	<tbody>
				{cities.map(( city, index ) => {
					return (
					<tr key={index}>
						<td>{city.id}</td>
						<td>
							<Form.Control
								type='text'
								disabled
								value={city.name} />
						</td>
						<td className="text-center">
							<Link to={"/admin/cities/" + city.id} >
								<Button variant="warning">edit</Button>
							</Link>
						</td>
						<td className="text-center">
							<Button variant="danger" onClick={() => { handleRemove(city.id) }}>x</Button>
						</td>
					</tr>
					);
				})}
			  	</tbody>
		  	</Table>
			}
			<hr/>		
		</Container>
	</Container>
    );
};



export default AdminDashboardCities;