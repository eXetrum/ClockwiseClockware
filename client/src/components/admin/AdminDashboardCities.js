import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Row, Col, Button, Spinner
} from 'react-bootstrap';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Header from '../Header';
import AdminCitiesList from './AdminCitiesList';
import ModalBox from '../ModalBox';
import ErrorBox from '../ErrorBox';
import { useToasts } from 'react-toast-notifications';
import { getCities, createCity, deleteCityById } from '../../api/cities';

const AdminDashboardCities = () => {
    const { addToast } = useToasts();
    const [cities, setCities] = useState(null);
    const [newCityName, setNewCityName] = useState('');
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);
    
    
    
	const [show, setShow] = useState(false);

    const createCityFormRef = React.createRef();

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
                setShow(false);
                addToast('New city entry created', {
                    appearance: 'success',
                    autoDismiss: true,
                })
            }
        } catch(e) {
            setError(e);
            console.log("Error: ", e);
            addToast(e.toString(), {
                appearance: 'error',
                autoDismiss: true,
            })
        } finally {
            setPending(false);
        }
    };

    const doDeleteCityById = async (id) => {
        try {
            const response = await deleteCityById(id);
            if (response && response.data && response.data.cities) {                    
                const { cities } = response.data;
                setCities(cities);
            }
        } catch(e) {
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
		e.preventDefault()
        const curCityName = newCityName;
		setPending(true);
        
        setInfo(null);
        setError(null);

        

        doCreateCity(curCityName);
	};

	const handleRemove = async(cityId) => {
		console.log('handleRemove');
        if (!window.confirm("Delete?")) { return; }

		setPending(true);
        setNewCityName('');
        setInfo(null);
        setError(null);

		

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
                            <AddCircleOutlineOutlinedIcon onClick={() => { setShow(true); }} />
                        </Link>
                    </Col>
                </Row>
                <hr />
                </>
                }
			</center>
			
			{(!cities && pending) && <center><Spinner animation="grow" /> </center>}	

			
            
            <ErrorBox info={info} error={error} pending={pending} />
            

            <AdminCitiesList cities={cities} onRemove={handleRemove} />
            <hr />
            

			<ModalBox show={show} 
                size="sm"
                onHide={() => { setShow(false); }}  
                title={'Add New City'}
                body={
                    <Container>
                        <Row className="align-items-center">
                            <Col>
                                <Form ref={createCityFormRef}
                                    onSubmit={handleSubmit}>
                                    <FormGroup>
                                        <Form.Label>City:</Form.Label>
                                        <FormControl type="text" name="city" disabled={pending}
                                            autoFocus
                                            value={newCityName}
                                            onChange={(event) => { 
                                                console.log('city name: ', event.target.value);
                                                setNewCityName(event.target.value); 
                                                setInfo(null);
                                                setError(null);
                                            }}
                                        />
                                    </FormGroup>
                                </Form>
                            </Col>
                        </Row>
                    </Container>
                }
                footer={
                    <Container>
                        <Row className="align-items-center">
                            <Col xs>
                            <Button variant="success" disabled={!newCityName} 
                                onClick={() => {
                                    console.log('success'); 
                                    createCityFormRef.current.dispatchEvent(
                                        new Event("submit", { cancelable: true, bubbles: true })
                                    );
                                }}
                            >
                            {pending && <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                            Create
                            </Button>
                            </Col>
                            <Col md="auto">
                            <Button variant="secondary" 
                                onClick={() => { 
                                    console.log('cancel'); 
                                    setNewCityName(''); 
                                    setShow(false);
                                }}
                            >
                                Cancel
                            </Button>
                            </Col>
                        </Row>
                    {error && 
                    <>
                        <hr/>
                        <ErrorBox info={info} error={error} pending={pending} />
                    </>
                    }
                    </Container>
                }
            />
		</Container>
	</Container>
    );
};



export default AdminDashboardCities;