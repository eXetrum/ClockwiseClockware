import React from 'react';
import {
    Row, Col, Alert
} from 'react-bootstrap';
import CloudOffIcon from '@mui/icons-material/CloudOff';

const ErrorServiceOffline = ({pending=false, error=null}) => {
    if(pending || error == null || error.code == null || error.code !== 'ERR_NETWORK') return null;

    return (<>
    <Row className="justify-content-md-center">
        <Col md="auto" >
            <Alert key='danger' variant='danger'>
                <CloudOffIcon fontSize="large" />
                &nbsp;Network Error
            </Alert>
        </Col>
    </Row>
    </>);
};

export default ErrorServiceOffline;