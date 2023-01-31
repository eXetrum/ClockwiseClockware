import React, {Component} from 'react';
import {Link, Navigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import FormControl from 'react-bootstrap/FormControl';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
//import { Edit, Delete } from '@mui/icons-material';

import AuthService from '../../services/auth.service';
import ApiService from '../../services/api.service';
import Header from './../Header';


class AdminDashboard extends Component {

    constructor() {
        super();
        this.state = {
            user: AuthService.getCurrentUser(),
            items: [],
            cities: [],
            clients: [],
            masters: [],
            booking: [],
        };
    }

    componentDidMount() {
        ApiService.getItems()
        .then(response => {
            console.log('ApiService.getItems(): ', response.data.items);            
            if(response.data) {
                this.setState({items: response.data.items });
            }
        }, 
        error => { });

        ApiService.getCities()
        .then(response => {
            console.log('ApiService.getCities(): ', response.data.cities);
            if(response.data) {
                response.data.cities.forEach(city => {
                    city['disabled'] = true;
                    city['temp_name'] = city.name;
                });
                this.setState({cities: response.data.cities });
            }
        },
        error => { });
    }

    editCity(id) {
        console.log('editCity click');
        const { cities } = this.state;
        let itemIdx = cities.map(item => item.id).indexOf(id);
        console.log('editCity click itemIdx', itemIdx, id);
        if(itemIdx == -1) return;
        console.log('editCity click disabled', cities[itemIdx].disabled);
        
        if(cities[itemIdx].disabled) {
            cities[itemIdx].disabled = false;
            cities[itemIdx].temp_name = cities[itemIdx].name;
            this.setState({cities: cities});
            return;
        }
    }

    handleChange(event) {
        let fieldName = event.target.name;
        let fleldVal = event.target.value;
        console.log('handleChange: ', fieldName, fleldVal);
        this.setState({form: {...this.state.form, [fieldName]: fleldVal}})
    }
    
    updateCity(event, id) {
        const { cities } = this.state;
        console.log('updateCity:', id, event.target.value);  
        let itemIdx = cities.map(item => item.id).indexOf(id);
        console.log('updateCity itemIdx', itemIdx);
        if(itemIdx == -1) return;
        cities[itemIdx].temp_name = event.target.value;
        this.setState({cities: cities});
        //console.log('updateCity'
    }

    render() {        
        const { items, cities } = this.state;
        console.log('render: ', cities);

        return (
        <Container>
          <Header />
          <Container>              
              <center>
                <h1>Admin Dashboard</h1>
                <Row>
                    <Link to='/admin/cities'>Cities</Link>
                </Row>
                <Row>
                    <Link to='/admin/clients'>Clients</Link>
                </Row>
                <Row>
                    <Link to='/admin/masters'>Masters</Link>
                </Row>
                <Row>
                    <Link to='/admin/booking'>Booking</Link>
                </Row>
              </center>
              <Tab.Container id="left-tabs-example" defaultActiveKey="cities">
                <Row>
                    <Col sm={3}>
                    <Nav variant="pills" className="flex-column">
                        <Nav.Item>
                            <Nav.Link eventKey="cities">Cities</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="clients">Clients</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="masters">Masters</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="booking">Booking</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    </Col>
                    <Col sm={9}>
                    <Tab.Content>
                        <Tab.Pane eventKey="cities">
                            <div>Cities</div>
                            <Table striped bordered hover responsive size="sm">
                                <thead>
                                    <tr>
                                        <th>id</th>
                                        <th>name</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                {cities.map(( item, index ) => {
                                    return (
                                    <tr key={index}>
                                        <td>{item.id}</td>
                                        <td>
                                            <FormControl
                                            type='text'
                                            //this.handleChange.bind(this)
                                            onChange={(event) => {this.updateCity(event, item.id)}}
                                            disabled={item.disabled}
                                            value={item.disabled ? item.name: item.temp_name} />
                                        </td>
                                        <td><Button variant={item.disabled ? "warning": "success" }
                                        onClick={ () => this.editCity(item.id) }>e</Button></td>
                                        <td><Button variant="danger">x</Button></td>
                                    </tr>
                                    );
                                })}
                                </tbody>
                            </Table>
                        </Tab.Pane>
                        <Tab.Pane eventKey="clients">
                            <div>Clients</div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="masters">
                            <div>Masters</div>
                        </Tab.Pane>
                        <Tab.Pane eventKey="booking">
                            <div>Booking</div>
                        </Tab.Pane>
                    </Tab.Content>
                    </Col>
                </Row>
              </Tab.Container>
          </Container>
        </Container>
        );
    }
}

export default AdminDashboard;