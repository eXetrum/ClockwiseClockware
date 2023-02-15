import React, { useState, useEffect  } from 'react';
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

import { getCities } from '../api/cities';
import { getWatchTypes, getAvailableMasters, createOrder } from '../api/orders';

import { useSnackbar } from 'notistack';
import { confirm } from 'react-bootstrap-confirmation';

const Order = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    /*const toNearestHour = (date) => {
        let rounded = new Date(date);
        rounded.setHours(rounded.getHours() + Math.ceil((rounded.getMinutes() + (rounded.getSeconds() / 60))/60));
        rounded.setMinutes(0, 0, 0); // Resets also seconds and milliseconds
        return rounded;
    };*/

    const dateToNearestHour = (date = new Date()) => {
        const ms = 1000 * 60 * 60;
        return new Date(Math.ceil(date.getTime() / ms) * ms);
    };

    const [order, setOrder] = useState({
        client : { name: '', email: '' },
        watchType: null,
        city: null,
        master: null,
        curDate: dateToNearestHour(),
        startDate: dateToNearestHour(),
        cities: []
    })
    const [watchTypes, setWatchTypes] = useState(null);
    const [cities, setCities] = useState(null);
    const [masters, setMasters] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);

    const setDefaultFormState = () => {
        setOrder({
            client : { name: '', email: '' },
            watchType: null,
            city: null,
            master: null,
            curDate: dateToNearestHour(),
            startDate: dateToNearestHour(),
            cities: []
        });
        setMasters(null);
        setConfirmation(null);
    };
    
    const resetBeforeApiCall = () => {
        setPending(true);
        setError(null);
    };

    const fetchWachTypes = async(abortController) => {
        try {
            const response = await getWatchTypes(abortController);
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

    const fetchCities = async(abortController) => {
        try {
            const response = await getCities(abortController);
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

    const fetchAvailableMasters = async (cityId, watchTypeId, startDateTimestamp, startDateTimezone) => {
        try {
            const response = await getAvailableMasters(
                cityId, watchTypeId, startDateTimestamp, startDateTimezone
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

    const doCreateOrder = async (order) => {
        try {
            const response = await createOrder(order);

            console.log('Response: ', response.data);

            if(response && response.data && response.data.info) {
                const { info } = response.data;
                console.log("info: ", info);
                setConfirmation(info);
                enqueueSnackbar(`Order placed`, { variant: 'success'});
            }
        } catch(e) {
            setError(e);
            if(e && e.response && e.response.data && e.response.data.detail) {
                enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
            }
        } finally {
            setPending(false);
        }
    };

    useEffect( () => {
        const abortController = new AbortController();
        resetBeforeApiCall();
        fetchWachTypes(abortController);

        return () => {
            abortController.abort();
            closeSnackbar();
        };
    }, []);

    useEffect( () => {
        const abortController = new AbortController();
        resetBeforeApiCall();
        fetchCities(abortController);

        return () => {
            abortController.abort();
            closeSnackbar();
        };
    }, []);

    


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('handleSubmit', order);

        resetBeforeApiCall();
        setMasters(null);

        fetchAvailableMasters(order.city.id, order.watchType.id, order.startDate.getTime(), order.startDate.getTimezoneOffset());
    };

    const pickUpMaster = async (event, master) => {

        const result = await confirm(`Do you want to choose "${master.email}" as your master and submit order?`, {title: 'Confirm', okText: 'Place Order', okButtonStyle: 'success'});
        if(!result) return;

        order.master = master;
        setOrder((prev) => ({...prev, master: master}));
        console.log('pickup: ', order);

        const orderToBackEnd = {
            client: {
                name: order.client.name,
                email: order.client.email,
            },
            watchTypeId: order.watchType.id,
            cityId: order.city.id,
            masterId: master.id,
            startDateTimestamp: order.startDate.getTime(),//new Date(order.startDate.setTime(order.startDate.getTime() - order.startDate.getTimezoneOffset() * 60 * 1000 ))
            startDateTimezone: order.startDate.getTimezoneOffset()
        };
        //jsDate.setTime( jsDate.getTime() + jsDate.getTimezoneOffset() * 60 * 1000 );
        console.log('tostr: ', order.startDate.toString());
        console.log('GMT: ', order.startDate.toGMTString());
        console.log('ISO: ', order.startDate.toISOString());
        console.log('UTC: ', order.startDate.toUTCString());

        console.log('pickup2: ', orderToBackEnd);

        resetBeforeApiCall();
        setMasters(null);

        doCreateOrder(orderToBackEnd);
    };

    const isFormValid = () => {
        return order.client.name.length >= 3 
            && /\w{1,}@\w{1,}\.\w{2,}/ig.test(order.client.email)
            && order.watchType 
            && order.city
            && order.startDate >= order.curDate
            && !pending;
    };

	return (
	<Container>
        <Header />
        <Container>              
            <center>
                <h1>Order page</h1>
                <hr />
            </center>

            {(!cities && pending) && <center><Spinner animation="grow" /> </center>}
            {(!watchTypes && pending) && <center><Spinner animation="grow" /> </center>}
            <ErrorServiceOffline error={error} pending={pending} />
            
            <Row className="justify-content-md-center">
                <Col xs lg="4">                    
                    {!confirmation && cities && watchTypes &&
                    <Form onSubmit={handleSubmit}>
                        <FormGroup className="mb-3">
                            <Form.Label>Name:</Form.Label>
                            <FormControl type="text" name="name" 
                                required
                                autoFocus={true}
                                disabled={pending}
                                isValid={order.client.name.length >= 3}
                                isInvalid={order.client.name.length < 3}
                                value={order.client.name}
                                onChange={(event) => {
                                    setOrder( (prev) => ({ ...prev, client: { ...prev.client, name: event.target.value } } ));
                                    setError(null);
                                }}
                            />
                            {order.client.name && <Form.Control.Feedback type="invalid">Please provide a valid name (min length 3).</Form.Control.Feedback>}
                        </FormGroup>
                        <FormGroup className="mb-3">
                            <Form.Label>Email:</Form.Label>
                            <FormControl type="email" name="email" 
                                required
                                disabled={pending}
                                isValid={/\w{1,}@\w{1,}\.\w{2,}/ig.test(order.client.email)}
                                isInvalid={!/\w{1,}@\w{1,}\.\w{2,}/ig.test(order.client.email)}
                                value={order.client.email}
                                onChange={(event) => {
                                    setOrder( (prev) => ({ ...prev, client: { ...prev.client, email: event.target.value } } ));
                                    setError(null);
                                }}
                            />
                            {order.client.email && <Form.Control.Feedback type="invalid">Please provide a valid email (username@host.domain)</Form.Control.Feedback>}
                        </FormGroup>
                        <FormGroup className="mb-3">
                            <>
                            {watchTypes && watchTypes.map(( item, index ) => {
                                return (
                                    <Form.Check
                                        required
                                        disabled={pending}
                                        inline
                                        key={"watch_type_" + item.id}
                                        label={item.name}
                                        name="watchType"
                                        type="radio"
                                        onClick={(event) => {
                                            console.log('check: ', event);
                                            setOrder( (prev) => ({...prev, watchType: item }));
                                            setMasters(null);
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
                                disable={pending}
                                selectionLimit={1}
                                options={cities} // Options to display in the dropdown
                                selectedValues={order.cities} // Preselected value to persist in dropdown
                                onSelect={(selectedList, selectedItem) => {
                                    setOrder( (prev) => ({...prev, city: selectedItem }));
                                    setMasters(null);
                                }}
                                onRemove={(selectedList, removedItem) => {
                                    setOrder( (prev) => ({...prev, city: null }));
                                    setMasters(null);
                                }} // Function will trigger on remove event
                                displayValue="name" // Property name to display in the dropdown options                                
                                placeholder="City"
                            />
                        </FormGroup>
                        <FormGroup className="mb-3">                            
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    disabled={pending}
                                    renderInput={(props) => <TextField {...props} />}
                                    label="DateTimePicker"
                                    minDate={dayjs(order.curDate)}
                                    minTime={dayjs(order.curDate)}
                                    disablePast={true}
                                    value={order.startDate}
                                    views={['year', 'month', 'day', 'hours']}
                                    ampm={false}
                                    onChange={(newValue) => {
                                        setOrder( (prev) => ({ ...prev, startDate: new Date(newValue) }));
                                        setMasters(null);
                                        //setError(null);
                                    }}
                                    onError={(reason) => {
                                        if(reason === 'invalidDate') {
                                            setError({reason: reason, detail: reason});
                                        } else if(reason === 'minTime') {
                                            setError({reason: reason, detail: 'Time is past'});
                                        } else if(reason === 'disablePast') {
                                            setError('Unable to set past date');
                                            setError({reason: reason, detail: 'Date is past'});
                                        } else {
                                            setError(null);
                                        }
                                        console.log('datetime: ', reason, typeof reason, reason == 'minTime');
                                        console.log(order.curDate, order.startDate);
                                    }}
                                />
                            </LocalizationProvider>
                            {error && error.reason && ['invalidDate', 'minTime', 'disablePast'].includes(error.reason) && <strong style={{color: 'red'}}><br/>{error.detail}</strong>}
                        </FormGroup>
                        <Button className="mb-3" type="submit" variant="success" 
                            disabled={!isFormValid()}>
                            {pending && <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                            Search
                        </Button>
                    </Form>
                    }

                    {confirmation &&
                    <Row className="justify-content-md-center">
                        <Col md="auto">
                        <Alert variant={"info"}>
                            <p>Thank you ! Confirmation message was sent to your email. </p>
                            <p>Message ID: {confirmation.messageId}</p>
                        </Alert>
                        </Col>
                        <Col md="auto">
                            <Button variant="primary" onClick={() => { setDefaultFormState(); }}>
                                Create new order
                            </Button>
                        </Col>
                    </Row>
                    }
                </Col>
            </Row>
            <hr />

        {(!masters && cities && watchTypes && pending) && <center><Spinner animation="grow" /> </center>}
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