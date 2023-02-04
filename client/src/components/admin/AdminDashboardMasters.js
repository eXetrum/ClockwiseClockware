import React, { useState, useEffect } from 'react';
import { Link }  from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import {
    Container, Row, Col, Form, FormGroup, FormControl, Table, Button, Badge, Alert, Spinner
} from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';
import StarRating from '../StarRating';
import Header from '../Header';

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
    const [pending, setPending] = useState(true);
    const [info, setInfo] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
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

        setMasters(null);
        setPending(true);
        setInfo(null);
        setError(null);

        fetchMasters();
    }, []);

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

        setCities(null);
        setPending(true);
        setInfo(null);
        setError(null);

        fetchCities();
    }, []);

    const validateNewMasterForm = () => {
        return !newMaster || !newMaster.name || !newMaster.email || !newMaster.cities.length;
    };

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('submit: ', newMaster, cities);
        const doCreateMaster = async (master) => {
            try {
                const response = await createMaster(master);
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

        setNewMaster({
            name: '',
            email: '',
            rating: 0,
            cities: []
        });

        multiselectRef.current.resetSelectedValues();
        
        setPending(true);
        setInfo(null);
        setError(null);
        doCreateMaster(newMaster);
    };

    const handleRemove = (id) => {
        console.log('handleRemove');
        if (!window.confirm("Delete?")) {
            return;
        }
        const doDeleteMasterById = async (id) => {
            try {
                const response = await deleteMasterById(id);
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

        setPending(true);
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
            <Row className="justify-content-md-center">
                <Col md="auto">
                    {info && <Alert key='success' variant='success'>{info}</Alert>}
                    {error && <Alert key='danger' variant='danger'>{error.toString() }</Alert>}
                </Col>
            </Row> 
            {(!masters && pending) && <center><Spinner animation="grow" /> </center>}
            {masters && 
                <Table striped bordered responsive size="sm" className="mt-3">
                <thead>
                    <tr>
                        <th className="text-center p-3 m-0">id</th>
                        <th className="text-center p-3 m-0">name</th>
                        <th className="text-center p-3 m-0">email</th>
                        <th className="text-center p-3 m-0">cities</th>
                        <th className="text-center p-3 m-0">rating</th>
                        <th colSpan="2" className="text-center p-3 m-0"></th>
                    </tr>
                </thead>
                <tbody>
                {masters.map(( master, index ) => {
                    return (
                    <tr key={"master_id_" + index}>
                        <td className="text-center p-3 m-0">
                            {master.id}
                        </td>
                        <td className="p-3 m-0">
                            {master.name}
                        </td>
                        <td className="p-3 m-0">
                            {master.email}
                        </td>
                        <td className="pt-2 m-0">
                        {master.cities.map((city, index2) => {
                            return <Badge bg="info" className="p-2 m-1" key={index + "_" + index2}>{city.name}</Badge>
                        })}

                        </td>
                        <td className="text-center p-2 m-0">
                            <StarRating
                                total={5}
                                value={master.rating}
                                readonly={true}
                            />
                        </td>
                        <td className="text-center p-3 m-0">
                            <Link to={"/admin/masters/" + master.id} >
                                <EditIcon />
                            </Link>
                        </td>
                        <td className="text-center p-3 m-0">
                            <Link to="#">
                                <DeleteForeverIcon onClick={() => { handleRemove(master.id) }} />
                            </Link>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
                </Table>
            }
            <hr/>
                       
        </Container>
    </Container>
    );
};

export default AdminDashboardMasters;