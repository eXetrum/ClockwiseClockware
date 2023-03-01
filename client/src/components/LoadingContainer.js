import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingContainer = ({ condition=false }) => {
    if(!condition) return null;
    return (<center><Spinner animation="grow" /></center>);
};

export default LoadingContainer;