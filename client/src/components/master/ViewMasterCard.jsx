import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import StarRating from '../common/StarRating';

const ViewMasterCard = ({ master }) => {
  if (master == null) return;

  return (
    <Card
      className="d-flex justify-content-center"
      style={{
        width: '18rem',
        minHeight: '12rem',
        border: 'solid 1px #ccc',
        color: '#333',
        borderRadius: '20px 20px 20px 20px',
      }}
    >
      <Card.Body>
        <Card.Title>{master.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{master.email}</Card.Subtitle>
        <StarRating value={master.rating} readonly={true} />
        <Card.Text>
          {master.cities.map(city => (
            <Badge bg="info" className="p-2 m-1" pill={true} key={city.id}>
              {city.name}
            </Badge>
          ))}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ViewMasterCard;
