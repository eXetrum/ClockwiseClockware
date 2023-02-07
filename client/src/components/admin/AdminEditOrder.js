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
import ErrorBox from '../ErrorBox';

const AdminEditOrder = () => {
    const {id} = useParams();
    // Initial
    const multiselectRef = React.createRef();
    const [watchTypes, setWatchTypes] = useState(null);
    const [cities, setCities] = useState(null);
    const [masters, setMasters] = useState(null);

    const [originalOrder, setOriginalOrder] = useState(null);
    const [order, setOrder] = useState(null);
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

    // 'componentDidMount'
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
                }
            } catch (e) {
                setError(e);
            } finally {
                setPending(false);
            }
        }
        fetchOrderById(id);
    }, [id]);

    useEffect(() => {
        console.log('useEffect order.master: ', order);
        if(order == null || order.master == null) return;
        const fetchMasterById = async (id) => {
            try {
                const response = await getMasterById(id)
                if (response && response.data && response.data.master) {
                    let { master } = response.data;
                    console.log('master schedule: ', master.orders);
                    master.orders.forEach(order => {
                        console.log(order);
                    });
                    //order.cities = [order.city];
                    //setOrder(order);
                    //setOriginalOrder(order);
                }
            } catch (e) {
                setError(e);
            } finally {
                setPending(false);
            }
        }
        fetchMasterById(order.master.id);
    }, [order]);


    const submitForm = (e) => {
        e.preventDefault();

        console.log(order);
        return;

        setPending(true);
        setOrder(null);        
        setInfo(null);
        setError(null);

        const doUpdateOrderById = async (id, order) => {
            try {
                const response = await updateOrderById(id, order);
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
    }

    const changeMaster = () => {
        if(!order.dateTime || !order.city || !order.watchType) return;

        console.log('changeMaster', order, new Date(order.dateTime.startDate));
        
        const fetchAvailableMasters = async (cityId, watchTypeId, dateTime) => {
            console.log('dateTime: ', dateTime);
            try {
                const response = await getAvailableMasters(cityId, watchTypeId, dateTime);
                console.log(response.data);
                if(response && response.data && response.data.masters) {
                    const { masters } = response.data;
                    setMasters(masters);
                    if(masters.length > 0) {
                        setOrder((prev) => ({
                            ...prev,
                            master: null
                        }))
                    }
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        }

        fetchAvailableMasters(order.city.id, order.watchType.id, new Date(order.dateTime.startDate).getTime());
    };

    const pickUpMaster = (event, master) => {        
        
        if (!window.confirm("Choose this master?")) {
            return;
        }

        order.master = master;
        setOrder((prev) => ({...prev, master: master}));
        console.log('pickup: ', order);

        /*const doCreateOrder = async (order) => {
            try {
                const response = await createOrder(order);

                console.log('Response: ', response.data);

                if(response && response.data && response.data.masters) {
                    const { masters } = response.data;
                    setMasters(masters);
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };*/

        setPending(true);
        setInfo(null);
        setError(null);

        //doCreateOrder(order);
    };
    
    const onSelect = (selectedList, selectedItem)=> {
        console.log('OnSelect: ', selectedList, selectedItem);
        console.log('orrrrr: ', order.master.cities);
        setMasters(null);
        if(order.master.cities.find(item => item.id == selectedItem.id) == null) {
            setOrder( (prev) => ({...prev, city: null, cities: [] }));
            /*Promise.resolve(multiselectRef.current.resetSelectedValues());
            if (!window.confirm("Current master is not available for selected city. \n\
                Do you want to search new master?")) {
                return;
            }*/
            
        } else {
            console.log('SUCCESS');
            setOrder( (prev) => ({...prev, city: selectedItem, cities: [selectedItem] }));
        }
    };

    const onRemove = (selectedList, removedItem) => {
        console.log('OnRemove: ', selectedList, removedItem);
        setOrder( (prev) => ({...prev, city: null, cities: [] }));
        setMasters(null);
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
            <Row>
                    <Col className="text-center p-2 m-0">{ originalOrder.id }</Col>

                    <Col className="text-center p-2 m-0">{ originalOrder.client.name }</Col>
                    <Col className="text-center p-2 m-0">{ originalOrder.client.email }</Col>
                    
                    <Col className="text-center p-2 m-0">{ originalOrder.master.name }</Col>
                    <Col className="text-center p-2 m-0">{ originalOrder.master.email }</Col>
                    <Col className="text-center p-2 m-0"><StarRating value={originalOrder.master.rating} readonly={true} /></Col>
                    
                    <Col className="text-center p-2 m-0">{ originalOrder.city.name }</Col>

                    <Col className="text-center p-2 m-0">{ originalOrder.watchType.name }</Col>
                    <Col className="text-center p-2 m-0">{ originalOrder.watchType.repair_time }</Col>

                    <Col className="text-center p-2 m-0">{ originalOrder.dateTime.startDate }</Col>
                    <Col className="text-center p-2 m-0">{ originalOrder.dateTime.endDate }</Col>
            </Row>
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
                                        onChange={(event) => {
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
                                        setOrder( (prev) => ({
                                            ...prev,
                                            dateTime: {
                                                ...prev.dateTime,
                                                startDate: new Date(newValue).getTime()
                                            } 
                                        }));
                                        setMasters(null);
                                        setInfo(null);
                                        setError(null);
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
                                    <Button className="mb-2" onClick={changeMaster} variant="warning">
                                        Reset Master
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
                                        setOrder(originalOrder);
                                    }}>Reset</Button>
                                </Col>
                                <Col >
                                    <Button className="mb-3" type="submit" variant="success" >
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
            
            {masters &&
            <div>
                <hr/>
            <Row className="justify-content-md-center mt-4">
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
            
            </div>}
            </>
            }
            
        {order && <hr />}
        <ErrorBox info={info} error={error} pending={pending} />
        {!order && <hr />}          
        </Container>
    </Container>
    );
};

export default AdminEditOrder;