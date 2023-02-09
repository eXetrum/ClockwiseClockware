import React, { useState, useEffect } from 'react';
import { Row } from 'react-bootstrap';
import './Clock.css';

const Clock = () => {
    const [curDateTime, setCutDateTime] = useState(new Date());
    useEffect( () => {
        const interval = setInterval(() => setCutDateTime(new Date()), 1000);
        return () => { clearInterval(interval); };
    }, []);

    return (
        <Row className="justify-content-md-center" >
            <Row className="justify-content-md-center"></Row>
            <div className="clockBox">
                <div className="Time">
                    <p>{curDateTime.toLocaleTimeString()}</p>
                </div>
            </div>
        </Row>
    );
};

export default Clock;