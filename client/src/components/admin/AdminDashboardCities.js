import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Button, Spinner
} from 'react-bootstrap';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Header from '../Header';
import AdminCitiesList from './AdminCitiesList';
import ModalForm from '../ModalForm';
import NotificationBox from '../NotificationBox';
import { getCities, createCity, deleteCityById } from '../../api/cities';

const AdminDashboardCities = () => {
    const [cities, setCities] = useState(null);
    const [newCityName, setNewCityName] = useState('');
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);
    
    
    
	const [showAddForm, setShowAddForm] = useState(false);

    const addCityFormRef = React.createRef();

    const resetBeforeApiCall = () => {
        setPending(true);
        setInfo(null);
        setError(null);
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

    const doCreateCity = async (cityName) => {
        try {
            const response = await createCity(cityName);
            console.log(response);
            if (response && response && response.data && response.data.city) {                    
                const { city } = response.data;
                setCities([...cities, city]);
                setNewCityName('');
                setShowAddForm(false);
                setInfo('Created');
            }
        } catch(e) {
            setError(e);
            console.log("Error: ", e);

        } finally {
            setPending(false);
        }
    };

    const doDeleteCityById = async (id) => {
        try {
            const response = await deleteCityById(id);
            if (response && (response.status == 200 || response.status == 204)) {
                setCities(cities.filter(item => item.id != id));
                setInfo('Removed');
            }
        } catch(e) {
            // Looks like we trying to remove city which already removed or not exists at all
            if(e && e.response && e.response.status == 404) {
                setCities(cities.filter(item => item.id != id));
            }
            setError(e);
        } finally {
            setPending(false);
        }
    };

    // 'componentDidMount'
    useEffect(() => {
        const abortController = new AbortController();
        console.log('"componentDidMount" getCityById');
		fetchCities(abortController);

        return () => {
            console.log('ABORT FETCH');
            abortController.abort();
        }
    }, []);

	const handleSubmit = (e) => {
		e.preventDefault();
        console.log('handleSubmit');
		resetBeforeApiCall();
        doCreateCity(newCityName);
	};

	const handleRemove = async (cityId) => {
		console.log('handleRemove');
        if (!window.confirm("Delete?")) { return; }		
        resetBeforeApiCall();
        await doDeleteCityById(cityId);
	};

    return (
	<Container>
		<Header />
		<Container>              
			<center>
				<h1>Admin: Cities Dashboard</h1>
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
                </>
                }
			</center>
			
			{(!cities && pending) && <center><Spinner animation="grow" /> </center>}	

			
            {!showAddForm &&
            <NotificationBox info={info} error={error} pending={pending} />
            }

            <AdminCitiesList cities={cities} onRemove={handleRemove} />
            <hr />
            
            <ModalForm size="sm" show={showAddForm} title={'Add New City'} 
                onHide={()=>{
                    console.log('cancel XXX'); 
                    setNewCityName(''); 
                    setShowAddForm(false);
                }}
                formRef={addCityFormRef}
                formContent={
                    <FormGroup>
                        <Form.Label>City:</Form.Label>
                        <FormControl type="text" name="city" disabled={pending}
                            autoFocus
                            value={newCityName}
                            onChange={(event) => { 
                                setNewCityName(event.target.value); 
                                setInfo(null);
                                setError(null);
                            }}
                        />
                    </FormGroup>
                }
                info={info}
                error={error}
                pending={pending}
                // Call on submit and on validation
                onSubmit={(event) => {
                    event.preventDefault();
                    console.log('handleSubmit');
                    resetBeforeApiCall();
                    doCreateCity(newCityName);
                }}
                isFormValid={() => newCityName}
                // Ok/Apply/
                onAccept={() => {
                    console.log('success'); 
                    addCityFormRef.current.dispatchEvent(
                        new Event("submit", { cancelable: true, bubbles: true })
                    );
                }}
                onCancel={() => { 
                    console.log('cancel'); 
                    setNewCityName(''); 
                    setShowAddForm(false);
                }}
            />
		</Container>
	</Container>
    );
};



export default AdminDashboardCities;