import React, { useCallback } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';
import { StarRating } from '../common';
import ModalForm from './ModalForm';

import { useDispatch, useSelector } from 'react-redux';
import { masterSlice } from '../../store/reducers';

import { validateEmail } from '../../utils';

const MasterForm = ({ onSubmit, okButtonText = 'Save', titleText = '', isModal = false, isHidePassword = false }) => {
  const dispatch = useDispatch();

  const { changeVisibilityAddForm, changeNewMasterField } = masterSlice.actions;
  const { newMaster, isShowAddForm, isPending } = useSelector((state) => state.masterReducer);

  const { cities } = useSelector((state) => state.cityReducer);

  const isFormValid = useCallback(
    () =>
      newMaster.email &&
      validateEmail(newMaster.email) &&
      (isHidePassword ? true : newMaster.password) &&
      newMaster.name &&
      newMaster.cities.length > 0,
    [newMaster, isHidePassword],
  );

  const formBody = (
    <>
      <Form.Group>
        <Row className="mt-2">
          <Col sm={4}>
            <Form.Label>
              <b>Email:</b>
            </Form.Label>
          </Col>
          <Col>
            <Form.Control
              type="email"
              name="email"
              autoFocus
              required
              value={newMaster.email}
              disabled={isPending}
              onChange={({ target: { name, value } }) => dispatch(changeNewMasterField({ name, value }))}
            />
          </Col>
        </Row>
      </Form.Group>
      {!isHidePassword ? (
        <Form.Group>
          <Row className="mt-2">
            <Col sm={4}>
              <Form.Label>
                <b>Password:</b>
              </Form.Label>
            </Col>
            <Col>
              <Form.Control
                type="password"
                name="password"
                required
                value={newMaster.password}
                disabled={isPending}
                onChange={({ target: { name, value } }) => dispatch(changeNewMasterField({ name, value }))}
              />
            </Col>
          </Row>
        </Form.Group>
      ) : null}
      <Form.Group>
        <Row className="mt-2">
          <Col sm={4}>
            <Form.Label>
              <b>Name:</b>
            </Form.Label>
          </Col>
          <Col>
            <Form.Control
              type="text"
              name="name"
              required
              value={newMaster.name}
              disabled={isPending}
              onChange={({ target: { name, value } }) => dispatch(changeNewMasterField({ name, value }))}
            />
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
              total={5}
              value={newMaster.rating}
              readonly={isPending}
              onRatingChange={(value) => dispatch(changeNewMasterField({ name: 'rating', value }))}
              onRatingReset={(value) => dispatch(changeNewMasterField({ name: 'rating', value }))}
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
              options={cities}
              selectedValues={newMaster.cities}
              displayValue="name"
              disable={isPending}
              onSelect={(selectedList, selectedItem) => dispatch(changeNewMasterField({ name: 'cities', value: selectedList }))}
              onRemove={(selectedList, removedItem) => dispatch(changeNewMasterField({ name: 'cities', value: selectedList }))}
            />
          </Col>
        </Row>
      </Form.Group>

      <Form.Group>
        <Row className="mt-4">
          <Col sm={4}>
            <Form.Label>
              <b>approved:</b>
            </Form.Label>
          </Col>
          <Col>
            <Form.Check
              type="checkbox"
              name="isApprovedByAdmin"
              checked={newMaster.isApprovedByAdmin}
              disabled={isPending}
              onChange={({ target: { name, checked: value } }) => dispatch(changeNewMasterField({ name, value }))}
            />
          </Col>
        </Row>
      </Form.Group>
    </>
  );

  if (isModal) {
    return (
      <ModalForm
        title={titleText}
        okText={okButtonText}
        show={isShowAddForm}
        isFormValid={isFormValid}
        isPending={isPending}
        formContent={formBody}
        onHide={() => dispatch(changeVisibilityAddForm(false))}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <Row className="justify-content-md-center">
      <Col xs lg="6">
        <Form onSubmit={onSubmit}>
          {formBody}
          <Form.Group>
            <Row>
              <Col sm={4}></Col>
              <Col className="d-flex justify-content-md-end">
                <Button className="ms-2" type="submit" variant="success" disabled={isPending || !isFormValid()}>
                  {okButtonText}
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
