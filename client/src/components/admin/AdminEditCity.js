import React, {Component} from 'react';
import Container from 'react-bootstrap/Container';
import {Form, FormGroup, FormControl} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';


import ApiService from '../../services/api.service';
import Header from './../Header';



class AdminEditCity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            city: null,
            id: this.props.id,
            newCityName: '',
        };
    }

    componentDidMount() {
        const id = this.state.id;
        console.log('componentDidMount: ', id);

        ApiService.getCityById(id)
        .then(response => {
            console.log('ApiService.getCityById(): ', response.data.city);
            if(response && response.data) {
                this.setState({city: response.data.city, newCityName: response.data.city?.city_name });
            }
        },
        error => { });
    }


    handleSubmit = (e) => {
        e.preventDefault()
        const { id, newCityName } = this.state;
        this.setState({error: '', newCityName: ''});
        
        ApiService.updateCityById(id, newCityName)
        .then(response => {
            if(response && response.data) {
                this.setState({city: response.data.city, newCityName: response.data.city?.city_name });
            }
        }, error => {});
    }


    render() {

        return (
        <Container>
          <Header />
          <Container>              
              <center>
                <h1>Admin Cities</h1>
              </center>
              <Form inline={true} className="d-flex align-items-end" onSubmit={this.handleSubmit}>
                <FormGroup controlId="formInlineCityName">
                    <Form.Label>City:</Form.Label>{' '}
                    <FormControl type="text" name="city" 
                        value={this.state.newCityName}
                        onChange={(event) => {this.setState({newCityName: event.target.value}); }}
                    />
                </FormGroup>{' '}
                <Button type="submit" variant="success" disabled={!this.state.newCityName}>Save</Button>
              </Form>
            <hr/>
          </Container>
        </Container>
        );
    }
}

export default AdminEditCity;