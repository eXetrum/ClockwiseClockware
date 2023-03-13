import React, { useCallback } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';
import { StarRating } from '../common';

const MasterForm = ({
  master,
  cities,
  onFormSubmit,
  onMasterEmailChange,
  onMasterNameChange,
  onMasterRatingChange,
  onMasterIsActiveChange,
  onMasterCitySelect,
  onMasterCityRemove,
  isPending,
  successButtonText = 'Save',
}) => {
  const isFormValid = useCallback(() => master.name && master.email && /\w{1,}@\w{1,}\.\w{2,}/gi.test(master.email), [master]);

  return (
    <Row className="justify-content-md-center">
      <Col xs lg="6">
        <Form onSubmit={onFormSubmit}>
          <Form.Group>
            <Row className="mt-2">
              <Col sm={4}>
                <Form.Label>
                  <b>Email:</b>
                </Form.Label>
              </Col>
              <Col>
                <Form.Control type="email" name="masterEmail" onChange={onMasterEmailChange} value={master.email} disabled={isPending} />
              </Col>
            </Row>
          </Form.Group>
          <Form.Group>
            <Row className="mt-2">
              <Col sm={4}>
                <Form.Label>
                  <b>Name:</b>
                </Form.Label>
              </Col>
              <Col>
                <Form.Control type="text" name="masterName" onChange={onMasterNameChange} value={master.name} disabled={isPending} />
              </Col>
            </Row>
          </Form.Group>

          <Form.Group>
            <Row className="mt-2">
              <Col sm={4}>
                <Form.Label>
                  <b>Rating:</b>
                </Form.Label>
              </Col>
              <Col>
                <StarRating
                  onRatingChange={onMasterRatingChange}
                  onRatingReset={onMasterRatingChange}
                  value={master.rating}
                  total={5}
                  readonly={isPending}
                />
              </Col>
            </Row>
          </Form.Group>

          <Form.Group>
            <Row className="mt-3">
              <Col sm={4}>
                <Form.Label>
                  <b>Master cities:</b>
                </Form.Label>
              </Col>
              <Col>
                <Multiselect
                  onSelect={onMasterCitySelect}
                  onRemove={onMasterCityRemove}
                  options={cities}
                  selectedValues={master.cities}
                  displayValue="name"
                  disable={isPending}
                />
              </Col>
            </Row>
          </Form.Group>

          <Form.Group>
            <Row className="mt-4">
              <Col sm={4}>
                <Form.Label>
                  <b>IsActive:</b>
                </Form.Label>
              </Col>
              <Col>
                <Form.Check
                  type="checkbox"
                  name="masterIsActive"
                  checked={master.isActive}
                  onChange={onMasterIsActiveChange}
                  disabled={isPending}
                />
              </Col>
            </Row>
          </Form.Group>

          <Form.Group>
            <Row>
              <Col sm={4}></Col>
              <Col className="d-flex justify-content-md-end">
                <Button className="ms-2" type="submit" variant="success" disabled={isPending || !isFormValid()}>
                  {successButtonText}
                </Button>
              </Col>
            </Row>
          </Form.Group>
        </Form>
      </Col>
    </Row>
  );
};

export default MasterForm;
