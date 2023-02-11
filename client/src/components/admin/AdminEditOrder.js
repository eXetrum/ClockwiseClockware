import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Card, Badge, Alert, Button, Spinner
} from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { getWatchTypes, getOrderById, updateOrderById, getAvailableMasters } from '../../api/orders';
import { getMasterById } from '../../api/masters';
import { getCities } from '../../api/cities';
import Header from '../Header';
import StarRating from '../StarRating';
import NotificationBox from '../NotificationBox';

const AdminEditOrder = () => {
    const {id} = useParams();
    // Initial
    const multiselectRef = React.createRef();
    const [watchTypes, setWatchTypes] = useState(null);
    const [cities, setCities] = useState(null);
    const [masters, setMasters] = useState(null);

    const [originalOrder, setOriginalOrder] = useState(null);
    const [order, setOrder] = useState(null);
    const [lastAssignedCity, setLastAssignedCity] = useState(null);
    const [showMasters, setShowMasters] = useState(false);
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

    const roundMinutes = (date) => {
        let rounded = new Date(date);
        rounded.setHours(date.getHours() + Math.ceil(date.getMinutes()/60));
        rounded.setMinutes(0, 0, 0); // Resets also seconds and milliseconds
        return rounded;
    };

    const addHours = (date, hours) => {
        date.setHours(date.getHours() + hours);
        return date;
    };

    const dateRangesOverlap = (start1, end1, start2, end2) => {
        const min = (a, b) => { return a < b ? a : b; }
        const max = (a, b) => { return a > b ? a : b; }
        return max(start1, start2) < min(end1, end2);
    };


    // 'Component Did Mount' watch types
    useEffect( () => {
        const fetchWachTypes = async() => {
            try {
                const response = await getWatchTypes();
                if(response && response.data && response.data.watchTypes) {
                    const { watchTypes } = response.data;
                    setWatchTypes(watchTypes);
                }
            } catch(e) {
                console.log('ERROR: ', e);
                setError(e);
            } finally {
                setPending(false);
            }
        };

        fetchWachTypes();
    }, []);

    // 'Component Did Mount' cities
    useEffect( () => {
        const fetchCities = async() => {
            try {
                const response = await getCities();
                if(response && response.data && response.data.cities) {
                    const { cities } = response.data;
                    setCities(cities);
                }
            } catch(e) {
                console.log('ERROR: ', e);
                setError(e);
            } finally {
                setPending(false);
            }
        };

        fetchCities();
    }, []);

    useEffect(() => {
        console.log('"componentDidMount" getOrderById');
        const fetchOrderById = async (id) => {
            try {
                const response = await getOrderById(id)
                if (response && response.data && response.data.order) {
                    let { order } = response.data;
                    console.log('order: ', order);
                    order.cities = [order.city];
                    setOrder(order);
                    setOriginalOrder(order);
                    setLastAssignedCity(order.city);
                }
            } catch (e) {
                console.log('ERROR: ', e);
                setError(e);
            } finally {
                setPending(false);
            }
        }
        fetchOrderById(id);
    }, [id]);



    const submitForm = (e) => {
        e.preventDefault();

        console.log(order);

        

        const doUpdateOrderById = async (id, order) => {
            try {
                const response = await updateOrderById(id, {...order, dateTime: new Date(order.dateTime.startDate).getTime() });
                if(response && response.data && response.data.order) {
                    const { order } = response.data;
                    setOrder(order);
                    setOriginalOrder(order);
                    setInfo('success');
                }
            } catch(e) {
                setError(e);
                setOrder(originalOrder);
            } finally {
                setPending(false);
            }
        }

        doUpdateOrderById(id, order);

        setPending(true);
        setOrder(null);        
        setInfo(null);
        setError(null);
    }

    const fetchAvailableMasters = async (cityId, watchTypeId, dateTime) => {
        console.log('dateTime: ', dateTime);
        try {
            const response = await getAvailableMasters(cityId, watchTypeId, dateTime);
            console.log(response.data);
            if(response && response.data && response.data.masters) {
                let { masters } = response.data;
                // Collection does not contains original master order (which is currently stored in db)
                console.log('append result: ', order);
                if(originalOrder != null && order != null
                    && masters.find(item => item.id == originalOrder.master.id) == null
                    && order.city && order.watchType 
                    
                    // But master actually can handle this order
                    && masterCanHandleOrder(originalOrder.master, order.id, order.city, order.watchType, order.dateTime.startDate)) {
                    
                    masters.push(originalOrder.master);
                }

                setMasters(masters);
                /*if(masters.length > 0) {
                    setOrder((prev) => ({
                        ...prev,
                        master: null
                    }))
                }*/
            }
        } catch(e) {
            console.log('ERROR: ', e);
            setError(e);
        } finally {
            setPending(false);
        }
    };

    useEffect( () => {
        console.log('useEffect order: ', order);
        if(!order || !order.city || !order.watchType || !order.dateTime.startDate) return;

        fetchAvailableMasters(order.city.id, order.watchType.id, new Date(order.dateTime.startDate).getTime());
    }, [order]);
    
    const onSelect = (selectedList, selectedItem)=> {
        console.log('OnSelect: ', selectedList, selectedItem);
        setMasters(null);
        setShowMasters(false);
        setInfo(null);
        setError(null);
        if(order.master == null) {
            setOrder( (prev) => ({...prev, master: null, city: selectedItem, cities: [selectedItem] }));
            
        } else if(!masterCanHandleOrder(order.master, order.id, selectedItem, order.watchType, order.dateTime.startDate)) {
            if (!window.confirm("Current master is cant handle this order due lack of time or specified city is not supported by master. \n\
                Do you want to search new master?")) {
                console.log('Revert to prev city: ', order, lastAssignedCity);
                setOrder( (prev) => ({...prev, master: order.master, city: lastAssignedCity, cities: [lastAssignedCity] }));
                return;
            }

            setMasters(null);
            setShowMasters(true);
            setOrder( (prev) => ({...prev, master: null, city: selectedItem, cities: [selectedItem] }));
        } else {
            console.log('SUCCESS');
            setOrder( (prev) => ({...prev, city: selectedItem, cities: [selectedItem] }));
        }
    };

    const onRemove = (selectedList, removedItem) => {
        console.log('OnRemove: ', selectedList, removedItem);
        setLastAssignedCity(removedItem);
        setMasters(null);
        setShowMasters(false);
        setInfo(null);
        setError(null);
        setOrder( (prev) => ({...prev, city: null, cities: [] }));
    };

    const isFormValid = () => {
        return order 
        && order.master
        && order.city
        && order.watchType         
        && order.dateTime
        && !pending;
    };

    // master is not null, city is not null, watchType is not null, dateTime is not null
    const masterCanHandleOrder = (master, orderId, city, watchType, dateTime) => {
        console.log('test masterCanHandleOrder: ', master, orderId, city, watchType, dateTime);
        
        // Master cant handle specified city
        if(master.cities.find(item => item.id == city.id) == null) {
            console.log('NO CANT HANDLE due city');
            return false;
        }

        // Now check if master schedule (already assigned orders except maybe this one is overlaps with current order)
        const schedule = master.orders.filter(item => item.id != orderId);
        console.log('masterCanHandleOrder: ', schedule);

        let startDate = new Date(dateTime);
        let endDate = addHours(new Date(dateTime), watchType.repairTime);
        
        for(let i = 0; i < schedule.length; ++i) {
            const sch = schedule[i];
            // At least one order is overlaps with current thus master cant handle this order
            if(dateRangesOverlap(startDate, endDate, new Date(sch.dateTime.startDate), new Date(sch.dateTime.endDate))) {
                console.log('NO CANT HANDLE due schedule: ');
                console.log("Current order: ", order, startDate, endDate);
                console.log("Order which overlaps with current: ", sch, sch.dateTime.startDate, sch.dateTime.endDate);
                return false;
            }
        }

        console.log('YES CAN HANDLE');
        return true;
    };
    
    return (
    <Container>
        <Header />
        <Container>              
            <center>
                <h1>Admin: Edit order</h1>
                <Link to={"/admin/orders"} ><ArrowLeftIcon/>Back</Link>
            </center>
            <hr/>
            {(!originalOrder && pending) && <center><Spinner animation="grow" /> </center>}
            {originalOrder  &&
            <>
            
            <Row className="justify-content-md-center">
                <Col xs lg="6">
                    {((!cities || !watchTypes || !order) && pending) && <center><Spinner animation="grow" /> </center>}
                    {order && cities && watchTypes &&
                    <>
                    
                    <Form onSubmit={submitForm}>
                    <hr />
                        <FormGroup className="mb-3">
                            <Row xs={1} md={2}>
                                <Col>
                                    <Form.Label>Client:</Form.Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <FormControl type="text" name="client_name" 
                                        disabled={true}
                                        value={order.client.name}
                                    />
                                </Col>
                                <Col>
                                    <FormControl type="email" name="client_email" 
                                        disabled={true}
                                        value={order.client.email}
                                    />
                                </Col>
                            </Row>                            
                        </FormGroup>
                        <hr />
                        <FormGroup className="mb-3">
                            <Row xs={1} md={2}>
                                <Col>
                                    <Form.Label>Watch Type:</Form.Label>
                                </Col>
                                <Col>
                            {watchTypes && watchTypes.map(( item, index ) => {
                                return (
                                    <Form.Check
                                        inline
                                        key={"watch_type_" + item.id}
                                        label={item.name}
                                        name="watchType"
                                        checked={order.watchType.id==item.id}
                                        type="radio"
                                        /*onClick={(event) => {
                                            console.log('check: ', event);
                                            setOrder( (prev) => ({
                                                ...prev,
                                                watchType: item
                                            }));
                                            setMasters(null);
                                            setInfo(null);
                                            setError(null);

                                        }}*/
                                        onChange={(event) => {
                                            const prevWatchType = order.watchType;
                                            setMasters(null);
                                            setShowMasters(false);
                                            setInfo(null);
                                            setError(null);
                                            if(order.master != null && order.city != null && order.dateTime.startDate != null) {
                                                if(!masterCanHandleOrder(order.master, order.id, order.city, item, order.dateTime.startDate)) {
                                                    if (!window.confirm("Current master cant handle this order due lack of time or specified watch type or specified city is not supported by master. \nDo you want to search new master?")) {
                                                        console.log('Revert to prev: ', order, prevWatchType);
                                                        
                                                        setOrder( (prev) => ({...prev, watchType: prevWatchType}));
                                                        return;
                                                    }
                                                    setShowMasters(true);
                                                    setOrder( (prev) => ({...prev, master: null}));                                                    
                                                }
                                            }
                                            setOrder( (prev) => ({
                                                ...prev,
                                                watchType: item
                                            }));
                                        }}
                                    />
                                )
                            })
                            }
                                </Col>
                            </Row>
                        
                        </FormGroup>
                        <hr />
                        <FormGroup className="mb-4">
                            <Row xs={1} md={2}>
                                <Col><Form.Label>City:</Form.Label></Col>
                                <Col>
                                    <Multiselect
                                        ref={multiselectRef}
                                        selectionLimit={1}
                                        options={cities} // Options to display in the dropdown
                                        selectedValues={order.cities} // Preselected value to persist in dropdown
                                        onSelect={onSelect} // Function will trigger on select event
                                        onRemove={onRemove} // Function will trigger on remove event
                                        displayValue="name" // Property name to display in the dropdown options
                                    />
                                </Col>
                            </Row>
                        </FormGroup>
                        <hr />
                        <FormGroup className="mb-3">                            
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    renderInput={(props) => <TextField {...props} />}
                                    label="DateTimePicker"
                                    value={new Date(order.dateTime.startDate)}
                                    minDate={dayjs(order.dateTime.startDate)}
                                    views={['year', 'month', 'day', 'hours']}
                                    onChange={(newValue) => {
                                        setMasters(null);
                                        setShowMasters(false);
                                        setInfo(null);
                                        setError(null);
                                        setOrder( (prev) => ({
                                            ...prev,
                                            dateTime: {
                                                ...prev.dateTime,
                                                startDate: roundMinutes(new Date(newValue)).getTime()
                                            } 
                                        }));                                        
                                    }}
                                />
                            </LocalizationProvider>
                        </FormGroup>
                        <hr />
                        {order.master &&
                        <FormGroup className="mb-4">
                            <Row xs={1} md={3}>
                                <Col>
                                    <Form.Label>Master:</Form.Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <FormControl type="text" name="master_name" 
                                        disabled={true}
                                        value={order.master.name}
                                    />
                                </Col>
                                <Col>
                                    <FormControl type="email" name="master_email" 
                                        disabled={true}
                                        value={order.master.email}
                                    />
                                </Col>
                                <Col>
                                    <StarRating value={order.master.rating} readonly={true} />
                                </Col>
                            </Row> 
                            
                            <Row xs={1} md={2} className="mt-4">
                                <Col md={{ span: 8, offset: 8 }} >
                                    <Button className="mb-2" onClick={() => {
                                        console.log('#1changeMaster[1]: ', order);
                                        if(!order.dateTime || !order.city || !order.watchType) return;

                                        console.log('#1changeMaster[2]:', order, new Date(order.dateTime.startDate));
                                        setMasters(null);
                                        setShowMasters(true);
                                        setInfo(null);
                                        setError(null);
                                        setOrder((prev) => ({
                                            ...prev,
                                            master: null
                                        }))
                                        //fetchAvailableMasters(order.city.id, order.watchType.id, new Date(order.dateTime.startDate).getTime());
                                    }}
                                    variant="warning"
                                    disabled={!order.watchType || !order.city || !order.dateTime.startDate}
                                    >
                                        Find New Master
                                    </Button>
                                </Col>
                            </Row>
                        </FormGroup>
                        }
                        {!order.master &&
                        <FormGroup className="mb-4">
                            <Row xs={1} md={3}>
                                <Col>
                                    <Form.Label>Master:</Form.Label>
                                </Col>
                            </Row>
                            <Row className="justify-content-md-center mt-4">
                                <Col>
                                <span>Not Assigned Yet</span>
                                </Col>
                            </Row> 
                            
                            <Row xs={1} md={2} className="mt-4">
                                <Col md={{ span: 8, offset: 8 }} >
                                    <Button className="mb-2" onClick={() => {
                                        console.log('#2changeMaster[1]: ', order);
                                        if(!order.dateTime || !order.city || !order.watchType) return;
                                        console.log('#2changeMaster[2]: ', order);
                                        setMasters(null);
                                        setShowMasters(true);
                                        setInfo(null);
                                        setError(null);
                                        setOrder((prev) => ({
                                            ...prev,
                                            master: null
                                        }))
                                    }}
                                    variant="warning"
                                    disabled={!order.watchType || !order.city || !order.dateTime.startDate}>
                                        Find New Master
                                    </Button>
                                </Col>
                            </Row>
                        </FormGroup>
                        }
                        <hr />
                        <FormGroup>
                            <Row xs={1} md={2} className="justify-content-md-center mt-4">
                                <Col >
                                    <Button className="mb-3" onClick={(e) => {
                                        e.preventDefault();
                                        setMasters(null);
                                        setShowMasters(false);
                                        setInfo(null);
                                        setError(null);
                                        setOrder(originalOrder);
                                    }}>Reset</Button>
                                </Col>
                                <Col >
                                    <Button className="mb-3" type="submit" variant="success" disabled={!isFormValid()} >
                                    Save
                                    </Button>
                                </Col>
                            </Row>
                        </FormGroup>
                    </Form>
                    </>
                    }
                </Col>
            </Row>
            
            {masters && showMasters &&
            <div>
                <hr/>
            <Row className="justify-content-md-center mt-4">
                {masters.map((master, index) => {
                    return (
                        <Col key={"master_id_" + master.id} md="auto" onClick={(event) => { 
        
                                if (!window.confirm("Choose this master?")) {
                                    return;
                                }

                                console.log('pickup: ', master);
                                setShowMasters(false);
                                setMasters(null);
                                setInfo(null);
                                setError(null);
                                setOrder((prev) => ({...prev, master: master}));
                        }}>
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
            
            </div>}
            </>
            }
            
        {order && <hr />}
        <NotificationBox info={info} error={error} pending={pending} />
        {!order && <hr />}          
        </Container>
    </Container>
    );
};

export default AdminEditOrder;