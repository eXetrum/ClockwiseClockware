import React, {Component} from 'react';
import {Link, Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import {Form, FormGroup, FormControl} from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import ApiService from '../../services/api.service';
import Header from './../Header';


class AdminDashboardCities extends Component {

    constructor() {
        super();
        this.state = {
            cities: [],
            newCityName: '',
            error: '',
        };
    }

    componentDidMount() {
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

        ApiService.deleteCityById(id)
        .then(response => {
            if(response && response.data) {
                this.setState({cities: response.data.cities });
            }
        }, error => {});
    }

    render() {        
        const { cities } = this.state;

        return (
        <Container>
          <Header />
          <Container>              
              <center>
                <h1>Admin: Cities Dashboard</h1>
              </center>
              <Form inline="true" className="d-flex align-items-end" onSubmit={this.handleSubmit}>
                <FormGroup controlId="formInlineCityName">
                    <Form.Label>City:</Form.Label>{' '}
                    <FormControl type="text" name="city" 
                        value={this.state.newCityName}
                        onChange={(event) => {this.setState({newCityName: event.target.value}); }}
                    />
                </FormGroup>{' '}
                <Button type="submit" disabled={!this.state.newCityName} >Add</Button>
              </Form>
              
              <hr/>
              <Table bordered hover responsive size="sm">
                <thead>
                    <tr>
                        <th>id</th><th>name</th><th></th><th></th>
                    </tr>
                </thead>
                <tbody>
                {cities.map(( item, index ) => {
                    return (
                    <tr key={index}>
                        <td>{item.city_id}</td>
                        <td>
                            <Form.Control
                                type='text'
                                disabled
                                value={item.city_name} />
                        </td>
                        <td className="text-center">
                            <Link to={"/admin/cities/" + item.city_id} >
                                <Button variant="warning">edit</Button>
                            </Link>
                        </td>
                        <td className="text-center">
                            <Button variant="danger" onClick={() => {this.handleRemove(item.city_id) }}>x</Button>
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

export default AdminDashboardCities;