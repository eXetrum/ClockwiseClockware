import React from 'react';
import { Col, Card } from 'react-bootstrap';
import Rating from '@mui/material/Rating';
import { MAX_RATING_VALUE, RATING_PRECISION_STEP } from '../../constants';

const regularStyle = {
  width: '14rem',
  color: '#333',
};

const selectedStyles = {
  ...regularStyle,
  border: 'solid 1px #ccc',
  backgroundColor: '#eee',

  padding: '5px',
  borderRadius: '7px',
  boxShadow: '0 1px 1px rgba(0,0,0,0.08),0 2px 2px rgba(0,0,0,0.12),0 4px 4px rgba(0,0,0,0.16),0 8px 8px rgba(0,0,0,0.2)',
};

const ViewMasterCard = ({ master, onClick, isSelected = false }) => {
  if (master == null) return;

  return (
    <Col
      md="auto"
      className="m-2"
      onClick={() => (onClick != null ? onClick(master) : null)}
      style={isSelected ? selectedStyles : regularStyle}
    >
      <Card className="d-flex justify-content-center" style={{ minHeight: '100%' }}>
        <Card.Body>
          <Card.Title className="text-center">{master.name}</Card.Title>
          <Col className="d-flex justify-content-center mb-3">
            <Rating name="rating" value={master.rating} defaultValue={MAX_RATING_VALUE} precision={RATING_PRECISION_STEP} readOnly={true} />
          </Col>

          <Card.Text className="text-center text-muted" style={{ fontSize: '12px' }}>
            <small>{master.email}</small>
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default ViewMasterCard;
