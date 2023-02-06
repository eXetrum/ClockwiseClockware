import React from 'react';
import {
    Row, Col, Alert
} from 'react-bootstrap';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

const ErrorBox = ({pending=false, info=null, error=null}) => {
    return (<>
    <Row className="justify-content-md-center">
        <Col md="auto" >
            {!pending && info && <Alert key='success' variant='success'>{info}</Alert>}
            {!pending && error && 
            <>
            <Alert key='danger' variant='danger'>
                {error?.code === 'ERR_NETWORK' && <CloudOffIcon fontSize="large" />}
                {error?.code !== 'ERR_NETWORK' && <ErrorOutlineOutlinedIcon fontSize="large" />}
                
                &nbsp;{
                    error?.response?.data?.detail?.toString()
                    || error?.response?.statusText 
                    || error?.message 
                    || error?.toString()
                }
            </Alert>
            </>}
        </Col>
    </Row>
    </>);
};

export default ErrorBox;