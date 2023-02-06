import React, { useState, useEffect} from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Button, Alert, Spinner
} from 'react-bootstrap';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Multiselect from 'multiselect-react-dropdown';
import StarRating from '../StarRating';
import Header from '../Header';
import ErrorBox from '../ErrorBox';
import { getCities } from '../../api/cities';
import { getMasterById, updateMasterById } from '../../api/masters';


const AdminEditMaster = () => {
    const {id} = useParams();
    
    // Initial
	const [cities, setCities] = useState([]);
    const [master, setMaster] = useState(null);
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

	// 'componentDidMount'
    useEffect(() => {
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
        
        setPending(true);
        fetchCities();
    }, [id]);

    useEffect(() => {
        const fetchMasterById = async (id) => {
            try {
                const response = await getMasterById(id);
                if(response && response.data && response.data.master) {
                    let { master } = response.data;
                    setMaster(master);
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        };

        setPending(true);
        fetchMasterById(id);
    }, [id]);

	// Callbacks
	const handleSubmit = (e) => {
		e.preventDefault()
        console.log('handleSubmit: ', master);

        const doUpdateMasterById = async (id, master) => {
            try {
                const response = await updateMasterById(id, master);
                if(response && response.data && response.data.master) {
                    const { master } = response.data;
                    setMaster(master);
                    setInfo('success');
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
        doUpdateMasterById(id, master);		
	};

    const validateNewMasterForm = () => { return !master.name || !master.email || !master.cities.length; };

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
                                    setInfo(null);
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
                                    setInfo(null);
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

                        <Button type="submit" className="ms-2" disabled={validateNewMasterForm()} >Update</Button>
                    </Form>
                	</Col>
              	</Row>
                }

            {master && <hr />}
            <ErrorBox info={info} error={error} pending={pending} />
            {!master && <hr />}  
            
			</Container>
		</Container>
    );
};

export default AdminEditMaster;