import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, FormGroup, FormControl, Container, Row, Col, Card, Badge, Alert, Button, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Multiselect from 'multiselect-react-dropdown';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Header from '../Header';
import StarRating from '../StarRating';
import ErrorContainer from '../ErrorContainer';
import { getCities } from '../../api/cities';
import { getWatches } from '../../api/watches';
import { getOrderById, updateOrderById, getAvailableMasters } from '../../api/orders';
import { dateToNearestHour, addHours, dateRangesOverlap } from '../../utils/dateTime';

const AdminEditOrder = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const { id } = useParams();

    const multiselectRef = React.createRef();
    const [watches, setWatches] = useState(null);
    const [cities, setCities] = useState(null);
    const [masters, setMasters] = useState(null);

    const [curDate, setCurDate] = useState(dateToNearestHour());

    const [originalOrder, setOriginalOrder] = useState(null);
    const [order, setOrder] = useState(null);
    const [lastAssignedCity, setLastAssignedCity] = useState(null);
    const [showMasters, setShowMasters] = useState(false);
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

    //const isLoading = useMemo(() => (cities === null || master === null) && error === null, [cities, master, error]);
    //const isError = useMemo(() => error !== null, [error]);
    //const isComponentReady = useMemo(() => !isLoading && !isError, [isLoading, isError]);

    const fetchWaches = async(abortController) => {
        try {
            const response = await getWatches(abortController);
            if(response && response.data && response.data.watches) {
                const { watches } = response.data;
                setWatches(watches);
            }
        } catch(e) {
            console.log('ERROR: ', e);
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
            console.log('ERROR: ', e);
            setError(e);
        } finally {
            setPending(false);
        }
    };

    const fetchOrderById = async (id, abortController) => {
        try {
            const response = await getOrderById(id, abortController)
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
    };

    const doUpdateOrderById = async (id, order) => {
        try {
            const orderToBackEnd = {
                watchId: order.watch.id,
                cityId: order.city.id,
                masterId: order.master.id,
                startDate: new Date(order.startDate).getTime(),
            };
            const response = await updateOrderById(id, orderToBackEnd);
            if(response && (response.status == 200 || response.status == 204)) {
                setOrder(order);
                setOriginalOrder(order);
                enqueueSnackbar(`Order updated`, { variant: 'success'});
            }
        } catch(e) {
            setError(e);            
            console.log('doDeleteOrderById error: ', e);
            if(e && e.response && e.response.status && e.response.status === 404) {
                setOrder(null);
                setOriginalOrder(null);
            } else {
                setOrder(originalOrder);
            }
            enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
        } finally {
            setPending(false);
        }
    };

    // 'Component Did Mount' watch types
    useEffect( () => {
        const abortController = new AbortController();
        console.log('"componentDidMount" fetchWaches()');
        setPending(true);
        fetchWaches(abortController);

        return () => {
            abortController.abort();
            closeSnackbar();
        };
    }, []);

    // 'Component Did Mount' cities
    useEffect( () => {
        const abortController = new AbortController();
        console.log('"componentDidMount" fetchCities');
        setPending(true);

        fetchCities(abortController);

        return () => {
            abortController.abort();
            closeSnackbar();
        };
    }, []);

    useEffect(() => {
        const abortController = new AbortController();
        console.log('"componentDidMount" fetchOrderById');
        setPending(true);
        
        fetchOrderById(id, abortController);

        return () => {
            abortController.abort();
            closeSnackbar();
        };
    }, [id]);



    const submitForm = (e) => {
        e.preventDefault();

        console.log('submit: ', order);
        

        setPending(true);
        //setOrder(null);        
        setInfo(null);
        setError(null);

        doUpdateOrderById(id, order);
    }

    const fetchAvailableMasters = async (cityId, watchTypeId, startDate) => {
        console.log('startDate: ', startDate);
        try {
            const response = await getAvailableMasters(cityId, watchTypeId, startDate);
            console.log(response.data);
            if(response && response.data && response.data.masters) {
                let { masters } = response.data;
                // Collection does not contains original master order (which is currently stored in db)
                console.log('append result: ', order);
                if(originalOrder != null && order != null
                    && masters.find(item => item.id == originalOrder.master.id) == null
                    && order.city && order.watch
                    
                    // But master actually can handle this order
                    && masterCanHandleOrder(originalOrder.master, order.id, order.city, order.watch, order.startDate)) {
                    
                    masters.push(originalOrder.master);
                }

                setMasters(masters);
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
        if(!order || !order.city || !order.watch || !order.startDate) return;

        fetchAvailableMasters(order.city.id, order.watch.id, new Date(order.startDate).getTime());
    }, [order]);
    
    const onSelect = (selectedList, selectedItem)=> {
        console.log('OnSelect: ', selectedList, selectedItem);
        setMasters(null);
        setShowMasters(false);
        setInfo(null);
        setError(null);
        if(order.master == null) {
            setOrder( (prev) => ({...prev, master: null, city: selectedItem, cities: [selectedItem] }));
            
        } else if(!masterCanHandleOrder(order.master, order.id, selectedItem, order.watch, order.startDate)) {
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
        && order.watch
        && order.startDate
        && !pending;
    };

    // master is not null, city is not null, watchType is not null, dateTime is not null
    const masterCanHandleOrder = (master, orderId, city, watch, dateTime) => {
        console.log('test masterCanHandleOrder: ', master, orderId, city, watch, dateTime);
        
        // Master cant handle specified city
        if(master.cities.find(item => item.id == city.id) == null) {
            console.log('NO CANT HANDLE due city');
            return false;
        }

        // Now check if master schedule (already assigned orders except maybe this one is overlaps with current order)
        const schedule = master.orders.filter(item => item.id != orderId);
        console.log('masterCanHandleOrder: ', schedule);

        let startDate = new Date(dateTime);
        let endDate = addHours(new Date(dateTime), watch.repairTime);
        
        for(let i = 0; i < schedule.length; ++i) {
            const sch = schedule[i];
            // At least one order is overlaps with current thus master cant handle this order
            if(dateRangesOverlap(startDate, endDate, new Date(sch.startDate), new Date(sch.endDate))) {
                console.log('NO CANT HANDLE due schedule: ');
                console.log("Current order: ", order, startDate, endDate);
                console.log("Order which overlaps with current: ", sch, sch.startDate, sch.endDate);
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
                    {((!cities || !watches || !order) && pending) && <center><Spinner animation="grow" /> </center>}
                    {order && cities && watches &&
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
                                {watches && watches.map(( item, index ) => {
                                return (
                                    <Form.Check
                                        inline
                                        key={"watch_type_" + item.id}
                                        label={item.name}
                                        name="watchType"
                                        checked={order.watch.id==item.id}
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
                                            const prevWatchType = order.watch;
                                            setMasters(null);
                                            setShowMasters(false);
                                            setInfo(null);
                                            setError(null);
                                            if(order.master != null && order.city != null && order.startDate != null) {
                                                if(!masterCanHandleOrder(order.master, order.id, order.city, item, order.startDate)) {
                                                    if (!window.confirm("Current master cant handle this order due lack of time or specified watch type or specified city is not supported by master. \nDo you want to search new master?")) {
                                                        console.log('Revert to prev: ', order, prevWatchType);
                                                        
                                                        setOrder( (prev) => ({...prev, watch: prevWatchType}));
                                                        return;
                                                    }
                                                    setShowMasters(true);
                                                    setOrder( (prev) => ({...prev, master: null}));                                                    
                                                }
                                            }
                                            setOrder( (prev) => ({
                                                ...prev,
                                                watch: item
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
                                    disabled={pending}
                                    renderInput={(props) => <TextField {...props} />}
                                    label="DateTimePicker"
                                    minDateTime={dayjs(curDate)}
                                    disablePast={true}
                                    value={order.startDate}
                                    views={['year', 'month', 'day', 'hours']}
                                    ampm={false}
                                    onChange={(newValue) => {
                                        setOrder( (prev) => ({ 
                                            ...prev,
                                            startDate: new Date(newValue)
                                        }));
                                        setMasters(null);
                                        setShowMasters(false);
                                        setInfo(null);
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
                                        console.log(curDate, order.startDate);
                                    }}
                                />
                            </LocalizationProvider>
                            {error && error.reason && ['invalidDate', 'minTime', 'disablePast'].includes(error.reason) 
                            && <strong style={{color: 'red'}}><br/>{error.detail}</strong>}
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
                                        if(!order.startDate || !order.city || !order.watch) return;

                                        console.log('#1changeMaster[2]:', order, new Date(order.startDate));
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
                                    disabled={!order.watch || !order.city || !order.startDate}
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
                                        if(!order.startDate || !order.city || !order.watch) return;
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
                                    disabled={!order.watch || !order.city || !order.startDate}>
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
        </Container>
    </Container>
    );
};

export default AdminEditOrder;