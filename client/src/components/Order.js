import React, { useState, useEffect } from 'react';
import { 
    Container, Row, Col, Form, FormGroup, FormControl, Button, Alert, Spinner, Card, Badge
} from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';

import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import StarRating from './StarRating';
import Header from './Header';
import ErrorServiceOffline from './ErrorServiceOffline';
import ErrorNotFound from './ErrorNotFound';
import NotificationBox from './NotificationBox';

import { getCities } from '../api/cities';
import { getWatchTypes, getAvailableMasters, createOrder } from '../api/orders';
import { useSnackbar } from 'notistack';

const Order = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const roundMinutes = (date) => {
        let rounded = new Date(date);
        rounded.setHours(date.getHours() + Math.ceil(date.getMinutes()/60));
        rounded.setMinutes(0, 0, 0); // Resets also seconds and milliseconds
        return rounded;
    };

    const [order, setOrder] = useState({
        client : { name: '', email: '' },
        watchType: null,
        city: null,
        master: null,
        dateTime: roundMinutes(new Date()).getTime(),
        cities: []
    })
    const [watchTypes, setWatchTypes] = useState(null);
    const [cities, setCities] = useState(null);
    const [masters, setMasters] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
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
        console.log('handleSubmit', order);

        const fetchMasters = async (cityId, watchTypeId, dateTime) => {
            try {
                const response = await getAvailableMasters(
                    cityId, watchTypeId, dateTime
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
        setMasters(null);
        setInfo(null);
        setError(null);

        fetchMasters(order.city.id, order.watchType.id, order.dateTime);
    };

    const onSelect = (selectedList, selectedItem)=> {
        console.log('OnSelect: ', selectedList, selectedItem);
        setOrder( (prev) => ({...prev, city: selectedItem }));
        setMasters(null);
    };

    const onRemove = (selectedList, removedItem) => {
        console.log('OnRemove: ', selectedList, removedItem);
        setOrder( (prev) => ({...prev, city: null }));
        setMasters(null);
    };

    const pickUpMaster = (event, master) => {        
        
        if (!window.confirm("Choose this master?")) {
            return;
        }

        order.master = master;
        setOrder((prev) => ({...prev, master: master}));
        console.log('pickup: ', order);

        const doCreateOrder = async (order) => {
            try {
                const response = await createOrder(order);

                console.log('Response: ', response.data);

                if(response && response.data && response.data.info) {
                    const { info } = response.data;
                    //setMasters(masters);
                    console.log("info: ", info);
                    setConfirmation(info);
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };

        
        setPending(true);
        setMasters(null);
        setInfo(null);
        setError(null);

        doCreateOrder(order);
    };

    const isFormValid = () => {
        return order.client.name.length >= 3 
            && order.client.email 
            && order.watchType 
            && order.city
            && order.dateTime > new Date().getTime()
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
                    {!confirmation && cities && watchTypes &&
                    <Form onSubmit={handleSubmit}>
                        <FormGroup className="mb-3">
                            <Form.Label>Name:</Form.Label>
                            <FormControl type="text" name="name" 
                                disabled={pending}
                                value={order.client.name}
                                onChange={(event) => {
                                    setOrder( (prev) => ({
                                        ...prev,
                                        client: {
                                            ...prev.client,
                                            name: event.target.value
                                        }
                                    }));
                                    setMasters(null);
                                    setInfo(null);
                                    setError(null);
                                }}
                            />
                        </FormGroup>
                        <FormGroup className="mb-3">
                            <Form.Label>Email:</Form.Label>
                            <FormControl type="email" name="email" 
                                disabled={pending}
                                value={order.client.email}
                                onChange={(event) => {
                                    setOrder( (prev) => ({
                                        ...prev,
                                        client: {
                                            ...prev.client,
                                            email: event.target.value
                                        }
                                    }));
                                    setMasters(null);
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
                                            setOrder( (prev) => ({
                                                ...prev,
                                                watchType: item
                                            }));
                                            setMasters(null);
                                            setInfo(null);
                                            setError(null);

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
                                selectedValues={order.cities} // Preselected value to persist in dropdown
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
                                    value={new Date(order.dateTime)}
                                    minDate={dayjs(order.dateTime)}
                                    views={['year', 'month', 'day', 'hours']}
                                    onChange={(newValue) => {
                                        setOrder( (prev) => ({
                                            ...prev,
                                            dateTime: new Date(newValue).getTime()
                                        }));
                                        setMasters(null);
                                        setInfo(null);
                                        setError(null);
                                    }}
                                />
                            </LocalizationProvider>
                        </FormGroup>
                        <Button className="mb-3" type="submit" variant="success" 
                            disabled={!isFormValid()}>
                            Search
                        </Button>
                    </Form>
                    }

                    {confirmation &&
                        <Alert variant={"info"}>
                            <p>Thank you ! Confirmation message was sent to your email. </p>
                            <p>Message ID: {confirmation.messageId}</p>
                        </Alert>
                    }
                </Col>
            </Row>
        
        {cities && <hr />}
        <NotificationBox info={info} error={error} pending={pending} />
        {!cities && <hr />}  

        {(!masters && pending) && <center><Spinner animation="grow" /> </center>}
        {masters &&
        <>
        <Row className="justify-content-md-center">
            {masters.map((master, index) => {
                return (
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
                );
            })
            }
            {masters && masters.length === 0 &&
            <Row className="justify-content-md-center">
                <Col md="auto">
                    <Alert>No free masters available for specified city and date time</Alert>
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