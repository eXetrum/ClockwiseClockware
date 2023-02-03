import React, { useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Button, Alert, Spinner
} from 'react-bootstrap';
import StarRating from '../StarRating';
import Header from '../Header';
import ApiService from '../../services/api.service';


const AdminEditMaster = () => {
    const {id} = useParams();
    
    // Initial
	const [cities, setCities] = useState([]);
    const [cityCheck, setCityCheck] = useState({});
    const [master, setMaster] = useState(null);
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

	// 'componentDidMount'
    useEffect(() => {
        console.log('useEffect');
        const getCities = async () => {
            try {
                const response = await ApiService.getCities();
                if(response && response.data && response.data.cities) {
                    const { cities } = response.data;
                    setCities(cities);
                    let curCityCheck = [];
                    cities.forEach((item, index) => { curCityCheck[item.id] = false; });
                    setCityCheck(curCityCheck);
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };
        
        setPending(true);
        getCities();
    }, []);

    useEffect(() => {
        const getMasterById = async (id) => {
            try {
                const response = await ApiService.getMasterById(id);
                if(response && response.data && response.data.master) {
                    const { master } = response.data;
                    let curCityCheck = [];
                    master.cities.forEach((item, index) => { curCityCheck[item.id] = true; });
                    setCityCheck(curCityCheck);
                    setMaster(master);
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };

        setPending(true);
        getMasterById(id);
    }, []);

	// Callbacks
	const handleSubmit = (e) => {
		e.preventDefault()
        // Reset to default		
        const updateMasterById = async (id, master) => {
            try {
                const response = await ApiService.updateMasterById(id, master);
                if(response && response.data && response.data.master) {
                    const { master } = response.data;
                    let curCityCheck = [];
                    master.cities.forEach((item, index) => { curCityCheck[item.id] = true; });
                    setCityCheck(curCityCheck);
                    setMaster(master);
                    setInfo('success');
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };

        setPending(true);
        updateMasterById(id, master);

        cities.map((item, index) => { cityCheck[item.id] = false; });
		setCityCheck(cityCheck);
		setMaster({ name: '', email: '', rating: 0, cities: [] });
        
		setInfo(null);
		setError(null);
	};


    const validateNewMasterForm = () => { return !master.name || !master.email || !master.cities.length; };

	// 'render'
    return (
        <Container>
			<Header />
			<Container>            
				<center>
					<h1>Admin: Edit Master</h1>
				</center>
                <hr/>
                {(!master && pending) && <center><Spinner animation="grow" /> </center>}
				{master &&
                <Row className="justify-content-md-center">
                	<Col xs>
                    <Form inline="true" className="d-flex align-items-end" onSubmit={handleSubmit}>
                        <FormGroup>
                            <Form.Label>Master name:</Form.Label>
                            <FormControl type="text" name="masterName" 
                                value={master.name}
                                onChange={(event) => {
									setMaster((prevState) => ({...prevState, name: event.target.value }));
                                }}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Form.Label>Master email:</Form.Label>
                            <FormControl type="email" name="masterEmail" 
                                value={master.email}
                                onChange={(event) => {
									setMaster((prevState) => ({...prevState, email: event.target.value }));
                                }}
                            />
                        </FormGroup>
                        <FormGroup className="ms-3">
                            <Form.Label>Rating:</Form.Label>
                            <StarRating
                                total={5}
                                value={master.rating}
                                onRatingChange={(value) => {
                                    console.log('onRatingChange: ', value);
									setMaster((prevState) => ({...prevState, rating: value }));
                                }}
                                onRatingReset={(value) => {
                                    console.log('onRatingReset: ', value);
									setMaster((prevState) => ({...prevState, rating: value }));
                                }}      
                            />
                        </FormGroup>                        
                        <FormGroup className="ms-3">
                            <Form.Label>Master work cities:</Form.Label>
                            {cities.map((city, index) => {
                                return (
                                    <Form.Check 
                                        key={"city_id_" + city.id + "_" + index}
                                        type='checkbox'
                                        defaultChecked={cityCheck[city.id]}
                                        id={"city_id_" + city.id}
                                        label={city.name}
                                        onClick={
											(event) => {
												cityCheck[city.id] = event.target.checked;
												let curCities = [];
												cities.forEach(item => {
													if(cityCheck[item.id]) curCities.push(item.id);
												});
												setCityCheck(cityCheck);
												setMaster((prev) => ({...prev, cities: curCities}));
											}
										}
                                    />
                                )
                            })
                            }
                        </FormGroup>

                        <Button type="submit" className="ms-2" disabled={validateNewMasterForm()} >Update</Button>
                    </Form>
                	</Col>
              	</Row>
                }

            <hr/>
			<Row className="justify-content-md-center">
                <Col md="auto">
                    {info && <Alert key='success' variant='success'>{info}</Alert>}
                    {error && <Alert key='danger' variant='danger'>{error.toString()}</Alert>}
                </Col>
            </Row>
            
			</Container>
		</Container>
    );
};

export default AdminEditMaster;