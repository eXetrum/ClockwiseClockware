import React, { useState, useEffect } from 'react';
import { 
    Container, Row, Col, Form, FormGroup, FormControl, Button, Alert, Spinner 
} from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';
//import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import Header from './Header';
import { getCities } from '../api/cities';
import { getWatchTypes, getAvailableMasters } from '../api/booking';


const Order = () => {
    const [client, setClient] = useState({
        name: '',
        email: '',
        watchType: null,
        cities: [],
    });
    const [watchTypes, setWatchTypes] = useState(null);
    const [cities, setCities] = useState(null);
    const [dateTime, onChange] = useState(new Date());

    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect( () => {
        const fetchWachTypes = async() => {
            try {
                const response = await getWatchTypes();
                if(response && response.data && response.data.watchTypes) {
                    const { watchTypes } = response.data;
                    setWatchTypes(watchTypes);
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };

        fetchWachTypes();
    }, []);

    useEffect( () => {
        const fetchCities = async() => {
            try {
                const response = await getCities();
                if(response && response.data && response.data.cities) {
                    const { cities } = response.data;
                    setCities(cities);
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };

        fetchCities();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('handleSubmit', client);

    };

    const onSelect = (selectedList, selectedItem)=> {
        console.log('OnSelect: ', selectedList, selectedItem);
        setClient((prevState) => ({...prevState, cities: selectedList }));
    };

    const onRemove = (selectedList, removedItem) => {
        console.log('OnRemove: ', selectedList, removedItem);
        setClient((prevState) => ({...prevState, cities: selectedList }));
    };

	return (
		<Container>
        <Header />
        <Container>              
            <center>
                <h1>Order page</h1>
            </center>
            <hr/>
            <Row className="justify-content-md-center">
                <Col xs lg="4">
                    {((!cities && pending) || (!watchTypes && pending)) && <center><Spinner animation="grow" /> </center>}
                    {cities && watchTypes &&
                    <Form onSubmit={handleSubmit}>
                        <FormGroup className="mb-3">
                            <Form.Label>Name:</Form.Label>
                            <FormControl type="text" name="name" 
                                disabled={pending}
                                value={client.name}
                                onChange={(event) => {
                                    setClient( (prev) => ({
                                        ...prev,
                                        name: event.target.value
                                    }));
                                    setInfo(null);
                                    setError(null);
                                }}
                            />
                        </FormGroup>
                        <FormGroup className="mb-3">
                            <Form.Label>Email:</Form.Label>
                            <FormControl type="email" name="email" 
                                disabled={pending}
                                value={client.email}
                                onChange={(event) => {
                                    setClient( (prev) => ({
                                        ...prev,
                                        email: event.target.value
                                    }));
                                    setInfo(null);
                                    setError(null);
                                }}
                            />
                        </FormGroup>
                        <FormGroup className="mb-3">
                            <>
                            {watchTypes && watchTypes.map(( item, index ) => {
                                return (
                                    <Form.Check
                                        inline
                                        key={"watch_type_" + item.id}
                                        label={item.name}
                                        name="watchType"
                                        type="radio"
                                        onClick={(event) => {
                                            console.log('check: ', event);
                                            setClient((prev) => ({
                                                ...prev,
                                                watchType: item
                                            }));
                                        }}
                                    />
                                )
                            })
                            }
                            </>
                        
                        </FormGroup>
                        <FormGroup className="mb-3">
                            <Multiselect
                                selectionLimit={1}
                                options={cities} // Options to display in the dropdown
                                selectedValues={client.cities} // Preselected value to persist in dropdown
                                onSelect={onSelect} // Function will trigger on select event
                                onRemove={onRemove} // Function will trigger on remove event
                                displayValue="name" // Property name to display in the dropdown options
                            />
                        </FormGroup>
                        <FormGroup className="mb-3">
                            
                            
                                <DateTimePicker
                                    renderInput={(props) => <TextField {...props} />}
                                    label="DateTimePicker"
                                    value={value}
                                    onChange={(newValue) => {
                                    setValue(newValue);
                                    }}
                                />
                            
                        </FormGroup>
                        <Button className="mb-3" type="submit" variant="success" disabled={client.name.length < 3 || !client.email || !client.watchType || !client.cities.length || pending}>
                            Next
                        </Button>
                    </Form>
                    }
                </Col>
            </Row>
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

export default Order;