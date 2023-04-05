import React from 'react';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import ViewMasterCard from './ViewMasterCard';

const MasterCardList = ({ masters, onSelect, currentSelectedMaster = null }) => {
  if (!masters.length) {
    return (
      <Container>
        <Row className="justify-content-md-center mt-3">
          <Col md="auto">
            <Alert variant="warning">No masters available</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="d-flex justify-content-md-center mt-4">
        <>
          {masters.map(master => (
            <ViewMasterCard key={master.id} onClick={onSelect} master={master} isSelected={currentSelectedMaster?.id === master.id} />
          ))}
        </>
      </Row>
    </Container>
  );
};

export default MasterCardList;
