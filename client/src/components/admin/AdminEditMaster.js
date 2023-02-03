import React, { useState, useEffect, useCallback, Component} from 'react';
import { useParams } from 'react-router-dom';
import {Form, FormGroup, FormControl, Container, Row, Col, Button, Alert} from 'react-bootstrap';
import StarRating from '../StarRating';
import Header from './../Header';
import ApiService from '../../services/api.service';


const AdminEditMaster = () => {
    const {id} = useParams();
    
    // Initial
	const [cities, setCities] = useState([]);
    const [cityCheck, setCityCheck] = useState({});
    const [master, setMaster] = useState({ name: '', email: '', rating: 0, cities: [] });
    const [info, setInfo] = useState('');
    const [error, setError] = useState('');

	console.log(id, master);

	// Callbacks
	const handleSubmit = (e) => {
		e.preventDefault()
        console.log('submit: ', master);
        // Reset to default
		cities.map((item, index) => { cityCheck[item.id] = false; });
		setCityCheck(cityCheck);
		setMaster({ name: '', email: '', rating: 0, cities: [] });
		setInfo('');
		setError('');
		//const oldCities = structuredClone(cities);
		//setCities([]);
        ApiService.updateMasterById(id, master)
        .then(response => {
            if(response && response.data) {
				const { master } = response.data;
                console.log('received: ', master);
                master.cities.map((item, index) => { cityCheck[item.id] = true; });
                setCityCheck(cityCheck);
                setMaster(master);
				setInfo('success');
				//setCities(oldCities);
            }
        }, error => {
            setError(error);
            //setCities(oldCities);
        });
	};

    const validateNewMasterForm = () => { return !master.name || !master.email || !master.cities.length; };

	// 'componentDidMount'
    useEffect(() => {
        console.log('useEffect');
        ApiService.getCities()
        .then(response => {
            console.log('ApiService.getCities(): ', response.data.cities);
            if(response && response.data) {
                setCities(response.data.cities);
                let cityCheck = {};
                response.data.cities.map((item, index) => { cityCheck[item.id] = false; });
                setCityCheck(cityCheck);
            }
        },
        error => { setError(error); });
        ApiService.getMasterById(id)
        .then(response => {
            console.log('ApiService.getMasterById(): ', response.data.master);
            if(response && response.data) {
                const { master } = response.data;
                master.cities.map((item, index) => { cityCheck[item.id] = true; });
                setCityCheck(cityCheck);
                setMaster(master);
            }
        },
        error => { setError(error); });
    }, []);

	// 'render'
    return (
        <Container>
			<Header />
			<Container>            
				<center>
					<h1>Admin: Edit Master</h1>
				</center>
				<Row className="justify-content-md-center">
                	<Col xs>
                    <Form inline="true" className="d-flex align-items-end" onSubmit={handleSubmit}>
                        <FormGroup>
                            <Form.Label>Master name:</Form.Label>
                            <FormControl type="text" name="masterName" 
                                value={master.name}
                                onChange={(event) => {
									setMaster((prevState) => ({...prevState, name: event.target.value }));
                                }}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Form.Label>Master email:</Form.Label>
                            <FormControl type="email" name="masterEmail" 
                                value={master.email}
                                onChange={(event) => {
									setMaster((prevState) => ({...prevState, email: event.target.value }));
                                }}
                            />
                        </FormGroup>
                        <FormGroup className="ms-3">
                            <Form.Label>Rating:</Form.Label>
                            <StarRating
                                total={5}
                                value={master.rating}
                                onRatingChange={(value) => {
                                    console.log('onRatingChange: ', value);
									setMaster((prevState) => ({...prevState, rating: value }));
                                }}
                                onRatingReset={(value) => {
                                    console.log('onRatingReset: ', value);
									setMaster((prevState) => ({...prevState, rating: value }));
                                }}      
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
                                        onChange={(event) => {
											//console.log('handleChecks: ', event, city);
											cityCheck[city.id] = event.target.checked;
											master.cities = [];
											cities.forEach(item => {
												if(cityCheck[item.id]) master.cities.push(item.id);
											});
											setMaster(master);
											setCityCheck(cityCheck);
										}}
                                    />
                                )
                            })
                            }
                        </FormGroup>

                        <Button type="submit" disabled={validateNewMasterForm()} >Update</Button>
                    </Form>
                	</Col>
              	</Row>

            <hr/>
			{info && <Alert key='success' variant='success'>{info}</Alert>}
            {error && <Alert key='danger' variant='danger'>{error}</Alert>}
			</Container>
		</Container>
    );
};

class AdminEditMaster2 extends Component {

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
                let cityCheck = {};
                response.data.cities.map((item, index) => { cityCheck[item.id] = false; });
                this.setState({cityCheck: cityCheck });
            }
        },
        error => {});

        ApiService.getMasterById(id)
        .then(response => {
            console.log('ApiService.getMasterById(): ', response.data.master);
            if(response && response.data) {
                const { master } = response.data;
                //this.setState({master: response.data.master});
                let cityCheck = this.state.cityCheck;
                response.data.master.cities.map((item, index) => { cityCheck[item.id] = true; });
                this.setState({
                    cityCheck: cityCheck,
                    master: master,
                });
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
        console.log('render:', master.rating, master, cities, cityCheck);

        return (
        <Container>
          <Header />
          <Container>              
              <center>
                <h1>Admin: Edit Master</h1>
              </center>
              <Row className="justify-content-md-center">
                <Col xs>
                    <Form inline="true" className="d-flex align-items-end" onSubmit={this.handleSubmit}>
                        <FormGroup>
                            <Form.Label>Master name:</Form.Label>
                            <FormControl type="text" name="masterName" 
                                value={master.name}
                                onChange={(event) => {
                                    this.setState(prevState => ({
                                        master: {...prevState.master, name: event.target.value}
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
                            <StarRating
                                total={5}
                                value={master.rating}
                                onRatingChange={(value) => {
                                    console.log('onRatingChange: ', value);
                                    this.setState(prevState => ({
                                        master: {...prevState.master, rating: value}
                                    }))
                                }}
                                onRatingReset={(value) => {
                                    console.log('onRatingReset: ', value);
                                    this.setState(prevState => ({
                                        master: {...prevState.master, rating: value}
                                    }))
                                }}      
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

            <hr/>
            
            {this.state.info && <Alert key='success' variant='success'>{this.state.info}</Alert>}
            {this.state.error && <Alert key='danger' variant='danger'>{this.state.error}</Alert>}
          </Container>
        </Container>
        );
    }
}

export default AdminEditMaster;