import React, { useState, useEffect } from 'react';
import {
    Form, FormGroup, FormControl, Container, Button, Spinner
} from 'react-bootstrap';
import Header from '../Header';
import CitiesList from './CitiesList';
import ErrorBox from '../ErrorBox';
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
			<hr />
			</>

			{(!cities && pending) && <center><Spinner animation="grow" /> </center>}
			<CitiesList cities={cities} onRemove={handleRemove} />
			{cities && <hr />}
            <ErrorBox info={info} error={error} pending={pending} />
            {!cities && <hr />} 
		</Container>
	</Container>
    );
};



export default AdminDashboardCities;