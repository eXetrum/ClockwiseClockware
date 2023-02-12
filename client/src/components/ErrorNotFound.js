import React from 'react';
import {
    Row, Col, Alert
} from 'react-bootstrap';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

const ErrorNotFound = ({pending=false, error=null}) => {
    if(pending || error == null || error.code == null || error.code !== 'ERR_BAD_REQUEST' 
        || error.response == null || error.response.status !== 404) return null;

    return (<>
    <Row className="justify-content-md-center">
        <Col md="auto" >
            <Alert key='danger' variant='danger'>
                <ErrorOutlineOutlinedIcon fontSize="large" />
                &nbsp;{
                    error?.response?.data?.detail?.toString()
                    || error?.response?.statusText 
                    || error?.message 
                    || error?.toString()
                }
            </Alert>
        </Col>
    </Row>
    </>);
};

export default ErrorNotFound;