import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import ReactStars from "react-rating-stars-component";

import Container from 'react-bootstrap/Container';
import {Form, FormGroup, FormControl} from 'react-bootstrap';
import Badge from 'react-bootstrap/Badge';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ApiService from '../../services/api.service';
import Header from './../Header';



class AdminDashboardMasters extends Component {

    constructor() {
        super();
        this.state = {
            cities: [],
            masters: [],
            newMaster: {
                name: '',
                email: '',
                rating: 0,
                cities: []
            },
            error: '',
        };
    }

    componentDidMount() {
        ApiService.getMasters()
        .then(response => {
            console.log('ApiService.getMasters(): ', response.data.masters);
            if(response && response.data) {
                this.setState({masters: response.data.masters });
            }
        },
        error => { });

        ApiService.getCities()
        .then(response => {
            console.log('ApiService.getCities(): ', response.data.cities);
            if(response && response.data) {
                this.setState({cities: response.data.cities });
            }
        },
        error => { });
    }

    handleChecks = (event, city) => {
        console.log('handleChecks: ', event.target.checked, city);
        let { newMaster } = this.state;
        if(event.target.checked) {
            if(newMaster.cities.indexOf(city.id) == -1)
                newMaster.cities.push(city.id);
        } else {
            newMaster.cities = newMaster.cities.filter(item => item.id != city.id);
        }
        this.setState({ newMaster: newMaster });
    }

    validateNewMasterForm = () => {
        const { newMaster } = this.state;
        return !newMaster.name || !newMaster.email || !newMaster.cities.length;
    }

    handleSubmit = (e) => {
        e.preventDefault()
        const { newMaster } = this.state;
        this.setState({error: '', newMaster: {name: '', email: '', rating: 0, cities: []} });
        
        ApiService.createMaster(newMaster)
        .then(response => {
            if(response && response.data) {
                this.setState({masters: response.data.masters });
            }
        }, error => {});
    }

    handleRemove = (id) => {
        console.log('handleRemove');
        if (!window.confirm("Delete?")) {
            return;
        }

        ApiService.deleteMasterById(id)
        .then(response => {
            if(response && response.data) {
                this.setState({cities: response.data.cities });
            }
        }, error => {});
    }

    render() {        
        const { cities, masters, newMaster } = this.state;
        console.log(this.state.newMaster);
        return (
        <Container>
          <Header />
          <Container>              
              <center>
                <h1>Admin: Masters Dashboard</h1>
              </center>
              <Row className="justify-content-md-center">
                <Col xs>
                    <Form inline="true" className="d-flex align-items-end" onSubmit={this.handleSubmit}>
                        <FormGroup>
                            <Form.Label>Master name:</Form.Label>
                            <FormControl type="text" name="masterName" 
                                value={newMaster.name}
                                onChange={(event) => {
                                    this.setState(prevState => ({
                                        newMaster: {...prevState.newMaster, name: event.target.value}
                                    }))
                                }}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Form.Label>Master email:</Form.Label>
                            <FormControl type="email" name="masterEmail" 
                                value={newMaster.email}
                                onChange={(event) => {
                                    this.setState(prevState => ({
                                        newMaster: {...prevState.newMaster, email: event.target.value}
                                    }))
                                }}
                            />
                        </FormGroup>
                        <FormGroup className="ms-3">
                            <Form.Label>Rating:</Form.Label>
                            <ReactStars
                                count={5}
                                onChange={(value) => {
                                    this.setState(prevState => ({
                                        newMaster: {...prevState.newMaster, rating: value}
                                    }))
                                }}
                                size={24}
                                activeColor="#ffd700"
                            />
                        </FormGroup>

                        
                        <FormGroup className="ms-3">
                            <Form.Label>Master work cities:</Form.Label>
                            {cities.map((city, index) => {
                                return (
                                    <Form.Check 
                                    key={index}
                                        type='checkbox'
                                        id={"city_id_" + city.id}
                                        label={city.name}
                                        onChange={(event) => {this.handleChecks(event, city)}}
                                    />
                                )
                            })
                            }
                        </FormGroup>
                        

                        <Button type="submit" disabled={this.validateNewMasterForm()} >Create</Button>
                    </Form>
                </Col>
              </Row>
              
              <hr/>
              <Table bordered hover responsive size="sm">
                <thead>
                    <tr>
                        <th>id</th><th>name</th><th>email</th><th>cities</th><th>rating</th><th></th>
                    </tr>
                </thead>
                <tbody>
                {masters.map(( master, index ) => {
                    return (
                    <tr key={index}>
                        <td>{master.id}</td>
                        <td>
                            <Form.Control
                                type='text'
                                disabled
                                value={master.name} />
                        </td>
                        <td>
                            <Form.Control
                                type='text'
                                disabled
                                value={master.email} />
                        </td>
                        <td>
                        {master.cities.map((city, index2) => {
                            return <Badge bg="info" className="p-2 m-1" key={index + "_" + index2}>{city.name}</Badge>
                        })}

                        </td>
                        <td>
                            <ReactStars
                                count={5}
                                value={master.rating}
                                edit={false}
                                size={24}
                                activeColor="#ffd700"
                            />
                        </td>
                        <td className="text-center">
                            <Link to={"/admin/masters/" + master.id} >
                                <Button variant="warning">edit</Button>
                            </Link>
                        </td>
                        <td className="text-center">
                            <Button variant="danger" onClick={() => {this.handleRemove(master.id) }}>x</Button>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </Table>
            <hr/>
          </Container>
        </Container>
        );
    }
}

export default AdminDashboardMasters;