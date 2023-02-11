import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Form, FormGroup, FormControl, Container, Button, Spinner
} from 'react-bootstrap';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { getCityById, updateCityById } from '../../api/cities';
import Header from '../Header';
import NotificationBox from '../NotificationBox';

const AdminEditCity = () => {
    const {id} = useParams();
    // Initial
    const [city, setCity] = useState(null);
	const [newCityName, setNewCityName] = useState('');
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

    // 'componentDidMount'
    useEffect(() => {
        console.log('"componentDidMount" getCityById');
        const fetchCityById = async (id) => {
            try {
                const response = await getCityById(id)
                if (response && response.data && response.data.city) {                    
                    const { city } = response.data;
                    setCity(city);
                    setNewCityName(city.name);
                }
            } catch (e) {
                setError(e);
            } finally {
                setPending(false);
            }
        }
        fetchCityById(id);
    }, [id]);


    const handleSubmit = (e) => {
        e.preventDefault();
        setPending(true);
        setInfo(null);
        setError(null);

        const doUpdateCityById = async (id, newCityName) => {
            try {
                const response = await updateCityById(id, newCityName);
                if(response && response.data && response.data.city) {
                    const { city } = response.data;
                    setCity(city);
                    setNewCityName(city.name);
                    setInfo('success');
                }
            } catch(e) {
                setError(e);
            } finally {
                setPending(false);
            }
        }

        doUpdateCityById(id, newCityName);        
    }

    return (
    <Container>
        <Header />
        <Container>              
            <center>
                <h1>Admin: Edit city</h1>
                <Link to={"/admin/cities"} ><ArrowLeftIcon/>Back</Link>
            </center>
            <hr/>
            {(!city && pending) && <center><Spinner animation="grow" /> </center>}
            {city &&
            <Form inline="true" className="d-flex align-items-end" onSubmit={handleSubmit}>
                <FormGroup>
                    <Form.Label>City:</Form.Label>{' '}
                    <FormControl type="text" name="city" 
                        disabled={pending}
                        value={newCityName}
                        onChange={(event) => {
                            setNewCityName(event.target.value);
                            setInfo('');
                            setError('');
                        }}
                    />
                </FormGroup>
                <Button className="ms-2" type="submit" variant="success" disabled={!newCityName || pending}>Save</Button>
            </Form>
            }
        {city && <hr />}
        <NotificationBox info={info} error={error} pending={pending} />
        {!city && <hr />}  
        </Container>
    </Container>
    );
};

export default AdminEditCity;