import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Modal, Form, FormGroup, FormControl, Container, Row, Col, Button, Spinner
} from 'react-bootstrap';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import Header from './Header';
import AdminCitiesList from './admin/AdminCitiesList';
//import ModalBox from './ModalBox';
import NotificationBox from './NotificationBox';
import { getCities, createCity, deleteCityById } from '../api/cities';


const ModalForm = ({
    formContent, 
    pending,
    // Call on submit and on validation
    onSubmit, isFormValid,    
    title,
    okText='Ok', cancelText='Cancel',
    ...props}) => {
    return (
        <Modal
            {...props}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            animation={true}
            backdrop="static"
            keyboard={false}
        >
            <>
            <Form onSubmit={onSubmit} disabled={pending}>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row className="align-items-center">
                        <Col>
                            
                                {formContent}
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Container>
                    <Row className="align-items-center">
                        <Col xs>
                            <Button variant="success" disabled={!isFormValid() || pending} type="submit" onClick={() => {
                                console.log('success'); 
                            }}>
                            {pending && <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                            {okText}
                            </Button>
                        </Col>
                        <Col md="auto">
                            <Button variant="secondary" onClick={props.onHide}>
                            {cancelText}
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </Modal.Footer>
            </Form></>
        </Modal>
    );
};



export default ModalForm;