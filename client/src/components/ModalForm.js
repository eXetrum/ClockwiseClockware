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
    title,
    formRef, formContent, 
    pending,
    // Call on submit and on validation
    onSubmit, isFormValid,
    ...props}) => {
    return (
        <Modal
            {...props}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            animation={true}
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Container>
                    <Row className="align-items-center">
                        <Col>
                            <Form ref={formRef} onSubmit={onSubmit} disabled={pending}>
                                {formContent}
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </Modal.Body>
            <Modal.Footer>
                <Container>
                    <Row className="align-items-center">
                        <Col xs>
                            <Button variant="success" disabled={!isFormValid() || pending} onClick={() => {
                                console.log('success'); 
                                formRef.current.dispatchEvent(
                                    new Event("submit", { cancelable: true, bubbles: true })
                                );
                            }}>
                            {pending && <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                            Create
                            </Button>
                        </Col>
                        <Col md="auto">
                            <Button variant="secondary" onClick={props.onHide}>
                            Cancel
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </Modal.Footer>
        </Modal>
    );
};



export default ModalForm;