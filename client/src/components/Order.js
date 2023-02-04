import React, { useState, useEffect } from 'react';
import { 
    Container, Row, Col, Form, FormGroup, FormControl, Button, Alert, Spinner, Card, Badge
} from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';

import dayjs, { Dayjs } from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import StarRating from './StarRating';
import Header from './Header';
import { getCities } from '../api/cities';
import { getWatchTypes, getAvailableMasters, placeOrder } from '../api/booking';



const Order = () => {

    const roundMinutes = (date) => {
        let rounded = new Date(date);
        rounded.setHours(date.getHours() + Math.ceil(date.getMinutes()/60));
        rounded.setMinutes(0, 0, 0); // Resets also seconds and milliseconds
        return rounded;
    };

    const [client, setClient] = useState({
        name: '',
        email: '',
        watchType: null,
        city: null,
        dateTime: roundMinutes(new Date()).getTime(),
    });
    const [watchTypes, setWatchTypes] = useState(null);
    const [cities, setCities] = useState(null);
    const [masters, setMasters] = useState(null);
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
        console.log(client.dateTime);

        const fetchMasters = async (client) => {
            try {
                const response = await getAvailableMasters(
                    client.city.id, client.watchType.id, client.dateTime
                );

                if(response && response.data && response.data.masters) {
                    const { masters } = response.data;
                    setMasters(masters);
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };

        setPending(true);
        setInfo(null);
        setError(null);

        fetchMasters(client);
    };

    const onSelect = (selectedList, selectedItem)=> {
        console.log('OnSelect: ', selectedList, selectedItem);
        setClient((prevState) => ({...prevState, city: selectedItem }));
    };

    const onRemove = (selectedList, removedItem) => {
        console.log('OnRemove: ', selectedList, removedItem);
        setClient((prevState) => ({...prevState, city: null }));
    };

    const pickUpMaster = (event, master) => {
        console.log('pickup: ', client, master);
        if (!window.confirm("Confirm?")) {
            return;
        }

        const doPlaceOrder = async (client, master) => {
            try {
                const response = await placeOrder(
                    client, master
                );

                console.log('Response: ', response.data);

                if(response && response.data && response.data.masters) {
                    // TODO
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };

        setPending(true);
        setInfo(null);
        setError(null);

        doPlaceOrder(client, master);
    };

    const isFormValid = () => {
        return client.name.length >= 3 
            && client.email 
            && client.watchType 
            && client.city
            && client.dateTime > new Date().getTime()
            && !pending;
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
                        <FormGroup className="mb-4">
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
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    renderInput={(props) => <TextField {...props} />}
                                    label="DateTimePicker"
                                    value={new Date(client.dateTime)}
                                    minDate={dayjs(client.dateTime)}
                                    views={['year', 'month', 'day', 'hours']}
                                    onChange={(newValue) => {
                                        setClient((prev) => ({
                                            ...prev,
                                            dateTime: new Date(newValue).getTime()
                                        }));
                                    }}
                                />
                            </LocalizationProvider>
                        </FormGroup>
                        <Button className="mb-3" type="submit" variant="success" 
                            disabled={!isFormValid()}>
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
        {masters &&
        <>
        <Row className="justify-content-md-center">
            {masters.map((master, index) => {
                return (
                    <>
                    <Col key={"master_id_" + master.id} md="auto" onClick={(event) => { pickUpMaster(event, master); }}>
                        <Card className="mb-3" style={{ width: '18rem' }}>
                            <Card.Body>
                                <Card.Title>{master.name}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">{master.email}</Card.Subtitle>
                                <StarRating value={master.rating} readonly={true}/>
                                <Card.Text>
                                    {master.cities.map((city, index) => {
                                        return <Badge bg="info" className="p-2 m-1" key={"master_city_id_" + city.id + "_index_" + index}>{city.name}</Badge>
                                    })}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    </>
                );
            })
            }
            {masters && masters.length == 0 &&
            <Row className="justify-content-md-center">
                <Col md="auto">
                    <Alert>No free masters available for specified date time</Alert>
                </Col>
            </Row>
            }
        </Row>
        <hr/>
        </>}
        </Container>
    </Container>
	);
};

export default Order;