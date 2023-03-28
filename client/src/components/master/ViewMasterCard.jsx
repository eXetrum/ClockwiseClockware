import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import StarRating from '../common/StarRating';

const ViewMasterCard = ({ master }) => {
  if (master == null) return;

  return (
    <Card className="mb-3 justify-content-md-center" style={{ width: '18rem' }}>
      <Card.Body>
        <Card.Title>{master.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{master.email}</Card.Subtitle>
        <StarRating value={master.rating} readonly={true} />
        <Card.Text>
          {master.cities.map(city => (
            <Badge bg="info" className="p-2 m-1" key={city.id}>
              {city.name}
            </Badge>
          ))}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ViewMasterCard;
