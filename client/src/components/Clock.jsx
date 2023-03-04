import React, { useState, useEffect } from 'react';
import { Row } from 'react-bootstrap';
import './Clock.css';

const Clock = () => {
  const CLOCK_TIMEOUT = 1000;
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setCurrentDateTime(new Date()), CLOCK_TIMEOUT);
    return () => clearInterval(interval);
  }, []);

  return (
    <Row className='justify-content-md-center'>
      <Row className='justify-content-md-center'></Row>
      <div className='clockBox'>
        <div className='Time'>
          <p>{currentDateTime.toLocaleTimeString()}</p>
        </div>
      </div>
    </Row>
  );
};

export default Clock;
