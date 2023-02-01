import React, {Component} from 'react';
import {Link, Navigate } from 'react-router-dom';
import ReactStars from "react-rating-stars-component";

import Container from 'react-bootstrap/Container';
import {Form, FormGroup, FormControl} from 'react-bootstrap';
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
            newMasterName: '',
            newMasterEmail: '',
            newMasterRating: 0,
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


    handleSubmit = (e) => {
        e.preventDefault()
        const { newCityName } = this.state;
        this.setState({error: '', newCityName: ''});
        
        ApiService.createCity(newCityName)
        .then(response => {
            if(response && response.data) {
                this.setState({cities: response.data.cities });
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

    
    ratingChanged = (newRating) => {
        console.log(newRating);
    };

    render() {        
        const { cities, masters } = this.state;
        console.log(this.state.newMasterName, this.state.newMasterEmail, this.state.newMasterRating);
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
                                value={this.state.newMasterName}
                                onChange={(event) => {this.setState({newMasterName: event.target.value }); }}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Form.Label>Master email:</Form.Label>
                            <FormControl type="email" name="masterEmail" 
                                value={this.state.newMasterEmail}
                                onChange={(event) => {this.setState({newMasterEmail: event.target.value }); }}
                            />
                        </FormGroup>
                        <FormGroup className="ms-3">
                            <Form.Label>Rating:</Form.Label>
                            <ReactStars
                                count={5}
                                onChange={(value) => { this.setState({newMasterRating: value}); }}
                                size={24}
                                activeColor="#ffd700"
                            />
                        </FormGroup>

                        
                        <FormGroup className="ms-3">
                            <Form.Label>Master work cities:</Form.Label>
                            {cities.map((item, index) => {
                                return (
                                    <Form.Check 
                                    key={index}
                                        type='checkbox'
                                        id={"city" + item.city_id}
                                        label={item.city_name}
                                    />
                                )
                            })
                            }
                        </FormGroup>
                        

                        <Button type="submit" disabled={!this.state.newMasterName || !this.state.newMasterEmail} >Create</Button>
                    </Form>
                </Col>
              </Row>
              
              <hr/>
              <Table bordered hover responsive size="sm">
                <thead>
                    <tr>
                        <th>id</th><th>name</th><th></th><th></th>
                    </tr>
                </thead>
                <tbody>
                {masters.map(( item, index ) => {
                    return (
                    <tr key={index}>
                        <td>{item.master_id}</td>
                        <td>
                            <Form.Control
                                type='text'
                                disabled
                                value={item.master_name} />
                        </td>
                        <td>
                            <Form.Control
                                type='text'
                                disabled
                                value={item.master_email} />
                        </td>
                        <td>
                            <ReactStars
                                count={5}
                                value={item.master_rating}
                                edit={false}
                                size={24}
                                activeColor="#ffd700"
                            />
                        </td>
                        <td className="text-center">
                            <Link to={"/admin/masters/" + item.master_id} >
                                <Button variant="warning">edit</Button>
                            </Link>
                        </td>
                        <td className="text-center">
                            <Button variant="danger" onClick={() => {this.handleRemove(item.master_id) }}>x</Button>
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