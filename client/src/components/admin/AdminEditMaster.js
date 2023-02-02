import React, {Component} from 'react';
import Container from 'react-bootstrap/Container';
import {Form, FormGroup, FormControl} from 'react-bootstrap';
import ReactStars from "react-rating-stars-component";

import Badge from 'react-bootstrap/Badge';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

import ApiService from '../../services/api.service';
import Header from './../Header';



class AdminEditMaster extends Component {

    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            master: {
                name: '',
                email: '',
                rating: 0,
                cities: [],
            },
            cityCheck: {},
            cities: [],
            info: '',
            error: '',
        };
    }

    componentDidMount() {
        const id = this.state.id;
        console.log('componentDidMount: ', id);

        ApiService.getCities()
        .then(response => {
            console.log('ApiService.getCities(): ', response.data.cities);
            if(response && response.data) {
                this.setState({cities: response.data.cities});
                //let cityCheck = {};
                //response.data.cities.map((item, index) => { cityCheck[item.id] = false; });
                //this.setState({cityCheck: cityCheck });
            }
        },
        error => {});

        ApiService.getMasterById(id)
        .then(response => {
            console.log('ApiService.getMasterById(): ', response.data.master);
            if(response && response.data) {
                this.setState({master: response.data.master});
                let cityCheck = {};
                response.data.master.cities.map((item, index) => { cityCheck[item.id] = true; });
                this.setState({cityCheck: cityCheck });
            }
        },
        error => { });
    }


    handleSubmit = (e) => {
        e.preventDefault()
        const { id, master, cities } = this.state;
        let cityCheck = this.state.cityCheck;
        console.log('submit: ', master);
        cities.map((item, index) => { cityCheck[item.id] = false; });
        this.setState({
            error: '', 
            info: '', 
            master: {
                name: '',
                email: '',
                rating: 0,
                cities: [],
            }, cityCheck: cityCheck });
        this.setState({cities: []});
        ApiService.updateMasterById(id, master)
        .then(response => {
            if(response && response.data) {
                this.setState({master: response.data.master});
                let cityCheck = {};
                console.log('received: ', response.data.master);
                response.data.master.cities.map((item, index) => { cityCheck[item.id] = true; });
                //cities = Object.assign({});
                //this.setState({cities: cities});
                this.setState({cityCheck: cityCheck });
                this.setState({info: 'success'});
                this.setState({cities: cities});
            }
        }, error => {
            this.setState({error: 'error'});
            this.setState({cities: cities});
        });
    }

    handleChecks = (event, city) => {
        console.log('handleChecks: ', event, city);
        let { master, cityCheck, cities } = this.state;
        console.log(cityCheck );
        cityCheck[city.id] = event.target.checked;
        master.cities = [];
        cities.forEach(item => {
            if(cityCheck[item.id]) master.cities.push(item.id);
        });
        this.setState({ master: master, cityCheck: cityCheck});
    }

    validateNewMasterForm = () => {
        const { master } = this.state;
        return !master.name || !master.email || !master.cities.length;
    }

    render() {
        
        const { master, cities, cityCheck } = this.state;
        console.log('render:', master, cities, cityCheck);

        return (
        <Container>
          <Header />
          <Container>              
              <center>
                <h1>Admin: Edit Master</h1>
              </center>
              {master && <Row className="justify-content-md-center">
                <Col xs>
                    <Form inline="true" className="d-flex align-items-end" onSubmit={this.handleSubmit}>
                        <FormGroup>
                            <Form.Label>Master name:</Form.Label>
                            <FormControl type="text" name="masterName" 
                                value={master.name}
                                onChange={(event) => {
                                    this.setState(prevState => ({
                                        master: {...prevState.newMaster, name: event.target.value}
                                    }))
                                }}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Form.Label>Master email:</Form.Label>
                            <FormControl type="email" name="masterEmail" 
                                value={master.email}
                                onChange={(event) => {
                                    this.setState(prevState => ({
                                        master: {...prevState.master, email: event.target.value}
                                    }))
                                }}
                            />
                        </FormGroup>
                        <FormGroup className="ms-3">
                            <Form.Label>Rating:</Form.Label>
                            <ReactStars
                                count={5}
                                value={master.rating}
                                onChange={(value) => {
                                    this.setState(prevState => ({
                                        master: {...prevState.master, rating: value}
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
                                        defaultChecked={cityCheck[city.id]}
                                        id={"city_id_" + city.id}
                                        label={city.name}
                                        onChange={(event) => {this.handleChecks(event, city)}}
                                    />
                                )
                            })
                            }
                        </FormGroup>

                        <Button type="submit" disabled={this.validateNewMasterForm()} >Update</Button>
                    </Form>
                </Col>
              </Row>
            }
            <hr/>
            
            {this.state.info && <Alert key='success' variant='success'>{this.state.info}</Alert>}
            {this.state.error && <Alert key='danger' variant='danger'>{this.state.error}</Alert>}
          </Container>
        </Container>
        );
    }
}

export default AdminEditMaster;