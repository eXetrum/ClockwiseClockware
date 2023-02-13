import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Button, Spinner
} from 'react-bootstrap';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Header from '../Header';
import ErrorServiceOffline from '../ErrorServiceOffline';
import ErrorNotFound from '../ErrorNotFound';

import { getCityById, updateCityById } from '../../api/cities';
import { useSnackbar } from 'notistack';

const AdminEditCity = () => {
    const {id} = useParams();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    // Initial
    const [city, setCity] = useState(null);
    const [originalCity, setOriginalCity] = useState(null);
	const [newCityName, setNewCityName] = useState('');
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);

    const resetBeforeApiCall = () => {
        setPending(true);
        setError(null);
    };

    const fetchCityById = async (id, abortController) => {
        try {
            const response = await getCityById(id, abortController)
            if (response && response.data && response.data.city) {                    
                const { city } = response.data;
                setCity(city);
                setOriginalCity(city);
                setNewCityName(city.name);
            }
        } catch (e) {
            setError(e);
        } finally {
            setPending(false);
        }
    };

    const doUpdateCityById = async (id, newCityName) => {
        try {
            const response = await updateCityById(id, newCityName);
            if (response && (response.status == 200 || response.status == 204)) {
                setCity({...city, name: newCityName});
                setOriginalCity({...city, name: newCityName});
                enqueueSnackbar(`City updated`, { variant: 'success'});
            }
        } catch(e) {
            setError(e);
            if(e && e.response && e.response.status && e.response.status === 404) {
                setCity(null);
                setOriginalCity(null);
            } else {
                setCity(originalCity);
                setNewCityName(originalCity.name);
            }
            enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
        } finally {
            setPending(false);
        }
    };

    // 'componentDidMount'
    useEffect(() => {
        const abortController = new AbortController();
        console.log('"componentDidMount" getCityById');
        
        resetBeforeApiCall();
        fetchCityById(id, abortController);
        
        return () => {
            abortController.abort();
            closeSnackbar();
        };
    }, [id]);


    const handleSubmit = (e) => {
        e.preventDefault();
        resetBeforeApiCall();
        doUpdateCityById(id, newCityName);        
    }

    return (
    <Container>
        <Header />
        <Container>              
            <center>
                <h1>Admin: Edit city</h1>
                <Link to={"/admin/cities"} ><ArrowLeftIcon/>Back</Link>
            </center>
            <hr/>
            {(!city && pending) && <center><Spinner animation="grow" /> </center>}
            
            <ErrorServiceOffline error={error} pending={pending} />
            <ErrorNotFound error={error} pending={pending} />

            {city &&
            <Row className="justify-content-md-center">
                <Col md="auto">
                    <Form inline="true" className="d-flex align-items-end" onSubmit={handleSubmit}>
                        <FormGroup>
                            <Form.Label>City:</Form.Label>{' '}
                            <FormControl type="text" name="city" 
                                disabled={pending}
                                value={newCityName}
                                onChange={(event) => {
                                    setNewCityName(event.target.value);
                                    setError(null);
                                }}
                            />
                        </FormGroup>
                        <Button className="ms-2" type="submit" variant="success" disabled={!newCityName || pending}>Save</Button>
                    </Form>
                </Col>
            </Row>
            }
            <hr />
        </Container>
    </Container>
    );
};

export default AdminEditCity;