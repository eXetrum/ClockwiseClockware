import React, { useState, useEffect } from 'react';
import {
    Row, Col, Alert
} from 'react-bootstrap';
import Fade from "@mui/material/Fade";
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

const NotificationBox = ({timeout=3000, pending=false, info=null, error=null}) => {
    const [show, setShow] = useState(true)

    // On componentDidMount set the timer
    useEffect(() => {
        const timeId = setTimeout(() => {
            // After 3 seconds set the show value to false
            setShow(false)
        }, timeout);

        return () => { clearTimeout(timeId); };
    }, []);

    // If show is false the component will return null and stop here
    if (!show) {
        return null;
    }

    // If show is true this will be returned
    return (<>
    <Fade
        in={show} //Write the needed condition here to make it appear
        timeout={{ enter: 1000, exit: 1000 }} //Edit these two values to change the duration of transition when the element is getting appeared and disappeard
    >
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
    </Fade>
    </>);
};

export default NotificationBox;