import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Container, Row, Col, Form, FormGroup, FormControl, Button, Spinner
} from 'react-bootstrap';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Multiselect from 'multiselect-react-dropdown';
import StarRating from '../StarRating';
import Header from '../Header';
import AdminMastersList from './AdminMastersList';
import ModalForm from '../ModalForm';
import ErrorServiceOffline from '../ErrorServiceOffline';

import { getMasters, createMaster, deleteMasterById } from '../../api/masters';
import { getCities } from '../../api/cities';

import { useSnackbar } from 'notistack';
import { confirm } from 'react-bootstrap-confirmation';

const AdminDashboardMasters = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [cities, setCities] = useState(null);
    const [masters, setMasters] = useState(null);
    const [newMaster, setNewMaster] = useState({
        name: '',
        email: '',
        rating: 0,
        cities: [],
    });
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false); 

    const resetBeforeApiCall = () => {
        setPending(true);
        setError(null);
    };

    const fetchMasters = async () => {
        try {
            const response = await getMasters();
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

    const fetchCities = async (abortController) => {
        try {
            const response = await getCities(abortController);
            if (response && response.data && response.data.cities) {                    
                const { cities } = response.data;
                setCities(cities);
            }
        } catch (e) {
            setError(e);
        } finally {
            setPending(false);
        }
    };

    const doCreateMaster = async (master) => {
        try {
            const response = await createMaster(master);
            if(response && response.data && response.data.master) {
                const { master } = response.data;
                setMasters([...masters, master]);
                enqueueSnackbar(`Master "${master.name}" created`, { variant: 'success'});
                setNewMaster({
                    name: '',
                    email: '',
                    rating: 0,
                    cities: [],
                });
                setShowAddForm(false);
            }
        } catch(e) {
            console.log('ERROR: ', e);
            setError(e);
            enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
        } finally {
            setPending(false);
        }
    };

    const doDeleteMasterById = async (id) => {
        try {
            const response = await deleteMasterById(id);
            if (response && (response.status == 200 || response.status == 204)) {
                const removedMaster = masters.find(item => item.id == id);
                setMasters(masters.filter(item => item.id != id));
                enqueueSnackbar(`Master "${removedMaster.email}" removed`, { variant: 'success'});
            }
        } catch(e) {
            setError(e);
            if(e && e.response && e.response.status == 404) {
                setMasters(masters.filter(item => item.id != id));
            }
            
            console.log('doDeleteCityById error: ', e);
            enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
        } finally {
            setPending(false);
        }
    };

    useEffect(() => {        
        const abortController = new AbortController();
        console.log('"componentDidMount" fetchMasters()');
        fetchMasters(abortController);

        return () => {
            console.log('[AdminDashboardMasters] ABORT FETCH1');
            abortController.abort();
            closeSnackbar();
        };
    }, []);

    useEffect(() => {
        const abortController = new AbortController();
        console.log('"componentDidMount" fetchCities()');
		fetchCities(abortController);

        return () => {
            console.log('[AdminDashboardMasters] ABORT FETCH2');
            abortController.abort();
            closeSnackbar();
        };
    }, []);    

    const handleRemove = async (masterId) => {
        console.log('handleRemove');
        
        const master = masters.find(item => item.id == masterId);

        const result = await confirm(`Do you want to delete "${master.email}" master ?`, {title: 'Confirm', okText: 'Delete', okButtonStyle: 'danger'});
        if(!result) return;
        resetBeforeApiCall();
        doDeleteMasterById(masterId);
    }

    return (
    <Container>
        <Header />
        <Container>              
            <center>
                <h1>Admin: Masters Dashboard</h1>
                <hr />
                {cities && 
                <>
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <Link to="#">
                            <AddCircleOutlineOutlinedIcon onClick={() => { setShowAddForm(true); }} />
                        </Link>
                    </Col>
                </Row>
                <hr />
                </>}
            </center>

            {((!cities || !masters) && pending) && <center><Spinner animation="grow" /> </center>}
            <ErrorServiceOffline error={error} pending={pending} />
            
            <AdminMastersList masters={masters} onRemove={handleRemove} />
            <hr />

            <ModalForm size="sm" show={showAddForm} title={'Add New Master'} okText={'Create'}
                onHide={()=>{
                    console.log('cancel X'); 
                    setNewMaster({
                        name: '',
                        email: '',
                        rating: 0,
                        cities: [],
                    });
                    setError(null);
                    setShowAddForm(false);
                }}
                pending={pending}
                // Call on submit and on validation
                onSubmit={(event) => {
                    event.preventDefault();
                    console.log('handleSubmit');
                    resetBeforeApiCall();
                    doCreateMaster(newMaster);
                }}
                isFormValid={() => newMaster != null && newMaster.name && newMaster.email }
                formContent={
                    <>
                    <FormGroup>
                            <Form.Label>Master name:</Form.Label>
                            <FormControl type="text" name="masterName" 
                                autoFocus
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
                                required
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
                                onSelect={(selectedList, selectedItem) => {
                                    console.log('OnSelect: ', selectedList, selectedItem);
                                    setNewMaster((prevState) => ({...prevState, cities: selectedList }));
                                }} // Function will trigger on select event
                                onRemove={(selectedList, removedItem) => {
                                    console.log('OnRemove: ', selectedList, removedItem);
                                    setNewMaster((prevState) => ({...prevState, cities: selectedList }));
                                }} // Function will trigger on remove event
                                displayValue="name" // Property name to display in the dropdown options
                                disable={pending}
                            />
                        </FormGroup>
                    </>
                }                
            />
        </Container>
    </Container>
    );
};

export default AdminDashboardMasters;