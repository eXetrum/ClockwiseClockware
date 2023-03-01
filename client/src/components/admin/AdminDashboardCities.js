import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Form, FormGroup, FormControl, Container, Row, Col, Spinner } from 'react-bootstrap';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import Header from '../Header';
import AdminCitiesList from './AdminCitiesList';
import ModalForm from '../ModalForm';
import LoadingContainer from '../LoadingContainer';
import ErrorContainer from '../ErrorContainer';
import { getCities, createCity, deleteCityById } from '../../api/cities';

const AdminDashboardCities = () => {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const [cities, setCities] = useState(null);
    const [newCityName, setNewCityName] = useState('');
    const [pending, setPending] = useState(true);
    const [error, setError] = useState(null);    
	const [showAddForm, setShowAddForm] = useState(false);

    const isLoading = useMemo(() => cities === null && pending, [cities, pending]);

    const resetBeforeApiCall = () => {
        setPending(true);
        setError(null);
    };

    const fetchCities = async (abortController) => {
        try {
            const response = await getCities({ abortController });
            if (response?.data?.cities) {
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
            const response = await createCity({ cityName });
            if (response?.data?.city) {
                const { city } = response.data;
                setCities([city, ...cities]);
                setNewCityName('');
                setShowAddForm(false);
                enqueueSnackbar(`City "${city.name}" created`, { variant: 'success' });
            }
        } catch(e) {
            console.log('doCreateCity error: ', e);
            setError(e);
            enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
        } finally {
            setPending(false);
        }
    };

    const doDeleteCityById = async (id) => {
        try {
            const response = await deleteCityById({ id });
            if ([200, 204].includes(response?.status)) {
                const removedCity = cities.find(item => item.id === id);
                setCities(cities.filter(item => item.id !== id));
                enqueueSnackbar(`City "${removedCity.name}" removed`, { variant: 'success' });
            }
        } catch(e) {
            console.log('doDeleteCityById error: ', e);
            setError(e);
            // Looks like we trying to remove city which already removed or not exists at all
            if(e?.response?.status === 404) {
                setCities(cities.filter(item => item.id !== id));
            }
            enqueueSnackbar(`Error: ${e.response.data.detail}`, { variant: 'error' });
        } finally {
            setPending(false);
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        console.log('"componentDidMount" getCityById');
        resetBeforeApiCall();
		fetchCities(abortController);

        return () => {
            console.log('[AdminDashboardCities] ABORT FETCH');
            abortController.abort();
            closeSnackbar();
        }
    }, []);

	const handleRemove = async (cityId) => {
		console.log('handleRemove');
        
        const city = cities.find(item => item.id === cityId);

        const result = await confirm(`Do you want to delete "${city.name}" city ?`, {title: 'Confirm', okText: 'Delete', okButtonStyle: 'danger' });
        if(!result) return;

        resetBeforeApiCall();
        doDeleteCityById(cityId);
	};

    return (
    <Container>
		<Header />
		<Container>              
			<center><h1>Admin: Cities Dashboard</h1></center>
            <hr />

            {cities &&
            <>
                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <Link to="#">
                            <AddCircleOutlineOutlinedIcon onClick={ () => setShowAddForm(true) } />
                        </Link>
                    </Col>
                </Row>
                <hr />
            </>}

            <LoadingContainer condition={isLoading} />
            <ErrorContainer error={error} />

            <AdminCitiesList cities={cities} onRemove={handleRemove} />
            <hr />

            <ModalForm size="sm" show={showAddForm} title={'Add New City'} okText={'Create'}
                onHide={()=>{
                    console.log('cancel X'); 
                    setNewCityName(''); 
                    setError(null);
                    setShowAddForm(false);
                }}
                pending={pending}
                // Call on submit and on validation
                onSubmit={(event) => {
                    event.preventDefault();
                    console.log('handleSubmit');
                    resetBeforeApiCall();
                    doCreateCity(newCityName);
                }}
                isFormValid={() => newCityName}
                formContent={
                    <FormGroup>
                        <Form.Label>City:</Form.Label>
                        <FormControl type="text" name="city" disabled={pending}
                            autoFocus
                            value={newCityName}
                            onChange={(event) => { 
                                setNewCityName(event.target.value); 
                                setError(null);
                            }}
                        />
                    </FormGroup>
                }                
            />
		</Container>
	</Container>
    );
};



export default AdminDashboardCities;