import React, { useCallback, useMemo } from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Multiselect from 'multiselect-react-dropdown';
import { StarRating, SpinnerButton } from '../common';
import ModalForm from './ModalForm';

import { useDispatch, useSelector } from 'react-redux';
import { changeVisibilityAddForm, changeNewMasterField } from '../../store/actions/masterActions';

import { validateEmail } from '../../utils';

const MasterForm = ({ onSubmit, okButtonText = 'Save', titleText = '', isModal = false, isHidePassword = false }) => {
  const dispatch = useDispatch();

  const { newMaster, isShowAddForm, isPending } = useSelector(state => state.masterReducer);
  const { cities } = useSelector(state => state.cityReducer);

  const isFormValid = useMemo(
    () =>
      newMaster.email &&
      validateEmail(newMaster.email) &&
      (isHidePassword ? true : newMaster.password) &&
      newMaster.name &&
      newMaster.cities.length > 0,
    [newMaster, isHidePassword],
  );

  const onHide = useCallback(() => dispatch(changeVisibilityAddForm(false)), [dispatch]);
  const onFormFieldChange = useCallback(({ target: { name, value } }) => dispatch(changeNewMasterField({ name, value })), [dispatch]);
  const onFormFieldChangeRating = useCallback(value => dispatch(changeNewMasterField({ name: 'rating', value })), [dispatch]);
  const onFormFieldChangeCityList = useCallback(
    (selectedList, selectedItem) => dispatch(changeNewMasterField({ name: 'cities', value: selectedList })),
    [dispatch],
  );
  const onFormFieldChangeApproved = useCallback(
    ({ target: { name, checked: value } }) => dispatch(changeNewMasterField({ name, value })),
    [dispatch],
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
              onChange={onFormFieldChange}
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
                onChange={onFormFieldChange}
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
            <Form.Control type="text" name="name" required value={newMaster.name} disabled={isPending} onChange={onFormFieldChange} />
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
              onRatingChange={onFormFieldChangeRating}
              onRatingReset={onFormFieldChangeRating}
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
              onSelect={onFormFieldChangeCityList}
              onRemove={onFormFieldChangeCityList}
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
              onChange={onFormFieldChangeApproved}
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
        onHide={onHide}
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
                <SpinnerButton
                  className="ms-2"
                  type="submit"
                  variant="success"
                  loading={isPending}
                  disabled={isPending || !isFormValid}
                  text={okButtonText}
                />
              </Col>
            </Row>
          </Form.Group>
        </Form>
      </Col>
    </Row>
  );
};

export default MasterForm;
