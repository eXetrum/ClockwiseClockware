import React, { useState, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Button, Spinner
} from 'react-bootstrap';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Multiselect from 'multiselect-react-dropdown';
import StarRating from '../StarRating';
import Header from '../Header';
import ErrorServiceOffline from '../ErrorServiceOffline';
import ErrorNotFound from '../ErrorNotFound';

import { getCities } from '../../api/cities';
import { getMasterById, updateMasterById } from '../../api/masters';
import { useSnackbar } from 'notistack';

const AdminEditMaster = () => {
    const {id} = useParams();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    // Initial
	const [cities, setCities] = useState([]);
    const [originalMaster, setOriginalMaster] = useState(null);
    const [master, setMaster] = useState(null);
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);

    const fetchCities = async (abortController) => {
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

    const fetchMasterById = async (id, abortController) => {
        try {
            const response = await getMasterById(id, abortController);
            if(response && response.data && response.data.master) {
                let { master } = response.data;
                setMaster(master);
                setOriginalMaster(master);
            }
        } catch(e) {
            setError(e);
        } finally {
            setPending(false);
        }
    };

    const doUpdateMasterById = async (id, master) => {
        try {
            const response = await updateMasterById(id, master);
            if(response && (response.status == 200 || response.status == 204)) {
                setMaster(master);
                setOriginalMaster(master);
                enqueueSnackbar(`Master updated`, { variant: 'success'});
            }
        } catch(e) {
            setError(e);
            if(e && e.response && e.response.status && e.response.status === 404) {
                setMaster(null);
                setOriginalMaster(null);
            } else {
                setMaster(originalMaster);
            }
            enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
        } finally {
            setPending(false);
        }
    };

	// 'componentDidMount'
    useEffect(() => {
        const abortController = new AbortController();
        
        setPending(true);
        fetchCities(abortController);
        
        return () => {
            abortController.abort();
            closeSnackbar();
        };
    }, [id]);

    useEffect(() => {
        const abortController = new AbortController();
        setPending(true);
        fetchMasterById(id, abortController);
        
        return () => {
            abortController.abort();
            closeSnackbar();
        };
    }, [id]);

	// Callbacks
	const handleSubmit = (e) => {
		e.preventDefault()
        console.log('handleSubmit: ', master);
        setPending(true);
		setError(null);
        doUpdateMasterById(id, master);		
	};

    const validateNewMasterForm = () => { return !master.name || !master.email; }// || !master.cities.length; };

    const onSelect = (selectedList, selectedItem)=> {
        console.log('OnSelect: ', selectedList, selectedItem);
        setMaster((prevState) => ({...prevState, cities: selectedList }));
    };

    const onRemove = (selectedList, removedItem) => {
        console.log('OnRemove: ', selectedList, removedItem);
        setMaster((prevState) => ({...prevState, cities: selectedList }));
    };

	// 'render'
    return (
        <Container>
			<Header />
			<Container>            
				<center>
					<h1>Admin: Edit Master</h1>
                    <Link to={"/admin/masters"} ><ArrowLeftIcon/>Back</Link>
				</center>
                <hr/>
                {(!master && pending) && <center><Spinner animation="grow" /> </center>}

                <ErrorServiceOffline error={error} pending={pending} />
                <ErrorNotFound error={error} pending={pending} />

				{master &&
                <Row className="justify-content-md-center">
                	<Col xs>
                    <Form inline="true" className="d-flex align-items-end" onSubmit={handleSubmit}>
                        <FormGroup>
                            <Form.Label>Master name:</Form.Label>
                            <FormControl type="text" name="masterName" 
                                value={master.name}
                                onChange={(event) => {
									setMaster((prevState) => ({...prevState, name: event.target.value }));
                                    setError(null);
                                }}
                                disabled={pending}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Form.Label>Master email:</Form.Label>
                            <FormControl type="email" name="masterEmail" 
                                value={master.email}
                                onChange={(event) => {
									setMaster((prevState) => ({...prevState, email: event.target.value }));
                                    setError(null);
                                }}
                                disabled={pending}
                            />
                        </FormGroup>
                        <FormGroup className="ms-3">
                            <Form.Label>Rating:</Form.Label>
                            <StarRating
                                total={5}
                                value={master.rating}
                                onRatingChange={(value) => {
                                    console.log('onRatingChange: ', value);
									setMaster((prevState) => ({...prevState, rating: value }));
                                }}
                                onRatingReset={(value) => {
                                    console.log('onRatingReset: ', value);
									setMaster((prevState) => ({...prevState, rating: value }));
                                }} 
                                readonly={pending}
                            />
                        </FormGroup>                        
                        <FormGroup className="ms-3">
                            <Form.Label>Master work cities:</Form.Label>
                            <Multiselect
                                options={cities} // Options to display in the dropdown
                                selectedValues={master.cities} // Preselected value to persist in dropdown
                                onSelect={onSelect} // Function will trigger on select event
                                onRemove={onRemove} // Function will trigger on remove event
                                displayValue="name" // Property name to display in the dropdown options
                            />
                            
                        </FormGroup>

                        <Button type="submit" className="ms-2 btn btn-success" disabled={validateNewMasterForm()} >Save</Button>
                    </Form>
                	</Col>
              	</Row>
                }
                <hr />
			</Container>
		</Container>
    );
};

export default AdminEditMaster;