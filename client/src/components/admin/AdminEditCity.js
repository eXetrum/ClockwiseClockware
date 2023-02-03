import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Button, Alert, Spinner
} from 'react-bootstrap';

import ApiService from '../../services/api.service';
import Header from '../Header';

const AdminEditCity = () => {
    const {id} = useParams();
    // Initial
    const [city, setCity] = useState(null);
	const [newCityName, setNewCityName] = useState('');
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

    // 'componentDidMount'
    useEffect(() => {
        console.log('"componentDidMount" getCityById');
        const getCityById = async (id) => {
            try {
                const response = await ApiService.getCityById(id)
                if (response && response.data && response.data.city) {                    
                    const { city } = response.data;
                    setCity(city);
                    setNewCityName(city.name);
                }
            } catch (e) {
                setError(e);
            } finally {
                setPending(false);
            }
        }
        getCityById(id);
    }, [id]);


    const handleSubmit = (e) => {
        e.preventDefault();
        const curCityName = newCityName;
        setPending(true);
        setNewCityName('');
        setInfo(null);
        setError(null);

        const updateCityById = async (id, newCityName) => {
            try {
                const response = await ApiService.updateCityById(id, newCityName);
                if(response && response.data && response.data.city) {
                    const { city } = response.data;
                    setCity(city);
                    setNewCityName(city.name);
                    setInfo('success');
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        }

        updateCityById(id, curCityName);        
    }

    return (
    <Container>
        <Header />
        <Container>              
            <center>
                <h1>Admin: Edit city</h1>
            </center>
            <hr/>
            {!city && <center><Spinner animation="grow" /> </center>}
            {city &&
            <Form inline="true" className="d-flex align-items-end" onSubmit={handleSubmit}>
                <FormGroup>
                    <Form.Label>City:</Form.Label>{' '}
                    <FormControl type="text" name="city" 
                        disabled={pending}
                        value={newCityName}
                        onChange={(event) => {
                            setNewCityName(event.target.value);
                            setInfo('');
                            setError('');
                        }}
                    />
                </FormGroup>
                <Button className="ms-2" type="submit" variant="success" disabled={!newCityName || pending}>Save</Button>
            </Form>
            }
        <hr/>
        <Row className="justify-content-md-center">
            <Col md="auto">
                {info && <Alert key='success' variant='success'>{info}</Alert>}
                {error && <Alert key='danger' variant='danger'>{error}</Alert>}
            </Col>
        </Row>
        </Container>
    </Container>
    );
};

export default AdminEditCity;