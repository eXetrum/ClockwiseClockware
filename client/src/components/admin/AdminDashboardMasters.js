import React, { useState, useEffect } from 'react';

import {
    Container, Row, Col, Form, FormGroup, FormControl, Button, Spinner
} from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';
import StarRating from '../StarRating';
import Header from '../Header';
import AdminMastersList from './AdminMastersList';
import ErrorBox from '../ErrorBox';
import { getMasters, createMaster, deleteMasterById } from '../../api/masters';
import { getCities } from '../../api/cities';


const AdminDashboardMasters = () => {

    const multiselectRef = React.createRef();

    const [cities, setCities] = useState(null);
    const [masters, setMasters] = useState(null);
    const [newMaster, setNewMaster] = useState({
        name: '',
        email: '',
        rating: 0,
        cities: [],
    });
    const [pending, setPending] = useState(false);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

    const resetBeforeApiCall = () => {
        setPending(true);
        setInfo(null);
        setError(null);
    };

    const fetchMasters = async () => {
        try {
            const response = await getMasters();
            if(response && response.data && response.data.masters) {
                const { masters } = response.data;
                setMasters(masters);
                console.log(masters);
            }
        } catch(e) {
            setError(e);
        } finally {
            setPending(false);
        }
    };

    const fetchCities = async () => {
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

    const doCreateMaster = async (master) => {
        try {
            const response = await createMaster(master);
            if(response && response.data && response.data.masters) {
                const { masters } = response.data;
                setMasters(masters);
            }
        } catch(e) {
            console.log(e);
            setError(e);
        } finally {
            setPending(false);
        }
    };

    const doDeleteMasterById = async (id) => {
        try {
            const response = await deleteMasterById(id);
            if(response && response.data && response.data.masters) {
                const { masters } = response.data;
                setMasters(masters);
                // TODO: backend, no point to return entire collection, just check 201/200
            }
        } catch(e) {
            setError(e);
        } finally {
            setPending(false);
        }
    };

    useEffect(async () => {
        resetBeforeApiCall();
        await fetchMasters();
    }, []);

    useEffect(async () => {
        resetBeforeApiCall();
        await fetchCities();
    }, []);

    const validateNewMasterForm = () => {
        return !newMaster || !newMaster.name || !newMaster.email || !newMaster.cities.length;
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('submit: ', newMaster, cities);
        
        setNewMaster({
            name: '',
            email: '',
            rating: 0,
            cities: []
        });

        multiselectRef.current.resetSelectedValues();
        
        resetBeforeApiCall();
        doCreateMaster(newMaster);
    };

    const handleRemove = (id) => {
        console.log('handleRemove');
        if (!window.confirm("Delete?")) {
            return;
        }
        

        resetBeforeApiCall();
        doDeleteMasterById(id);
    }

    const onSelect = (selectedList, selectedItem)=> {
        console.log('OnSelect: ', selectedList, selectedItem);
        setNewMaster((prevState) => ({...prevState, cities: selectedList }));
    };

    const onRemove = (selectedList, removedItem) => {
        console.log('OnRemove: ', selectedList, removedItem);
        setNewMaster((prevState) => ({...prevState, cities: selectedList }));
    };

    return (
    <Container>
        <Header />
        <Container>              
            <center>
                <h1>Admin: Masters Dashboard</h1>
            </center>
            <hr/>
            {(!cities && pending) && <center><Spinner animation="grow" /> </center>}
            {cities &&
            <>
            <Row className="justify-content-md-center mb-3">
                <Col xs>
                    <Form inline="true" className="d-flex align-items-end" onSubmit={handleSubmit}>
                        <FormGroup>
                            <Form.Label>Master name:</Form.Label>
                            <FormControl type="text" name="masterName" 
                                value={newMaster.name}
                                onChange={(event) => {
                                    setNewMaster((prev) => ({...prev, name: event.target.value}));
                                }}
                                disabled={pending}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Form.Label>Master email:</Form.Label>
                            <FormControl type="email" name="masterEmail" 
                                value={newMaster.email}
                                onChange={(event) => {
                                    setNewMaster((prev) => ({...prev, email: event.target.value}));
                                }}
                                disabled={pending}
                            />
                        </FormGroup>
                        <FormGroup className="ms-3">
                            <Form.Label>Rating:</Form.Label>
                            <StarRating
                                total={5}
                                value={newMaster.rating}
                                onRatingChange={(value) => {
                                    console.log('rating change: ', value);
                                    setNewMaster((prev) => ({...prev, rating: value}));
                                }}
                                onRatingReset={(value) => {
                                    console.log('rating reset: ', value);
                                    setNewMaster((prev) => ({...prev, rating: value}));
                                }}
                                readonly={pending}
                            />
                        </FormGroup>

                        
                        <FormGroup className="ms-3">
                            <Form.Label>Master work cities:</Form.Label>
                            <Multiselect
                                options={cities} // Options to display in the dropdown
                                selectedValues={newMaster.cities} // Preselected value to persist in dropdown
                                onSelect={onSelect} // Function will trigger on select event
                                onRemove={onRemove} // Function will trigger on remove event
                                displayValue="name" // Property name to display in the dropdown options
                                ref={multiselectRef}
                            />
                        </FormGroup>

                        <Button type="submit" className="ms-2" disabled={validateNewMasterForm()} >Create</Button>
                    </Form>
                </Col>
            </Row>
            <hr/>
            </>
            }


            {(!masters && pending) && <center><Spinner animation="grow" /> </center>}
			<AdminMastersList masters={masters} onRemove={handleRemove} />
			{masters && <hr />}
            <ErrorBox info={info} error={error} pending={pending} />
            {!masters && <hr />}                        
        </Container>
    </Container>
    );
};

export default AdminDashboardMasters;