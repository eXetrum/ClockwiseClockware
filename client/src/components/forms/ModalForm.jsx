import React from 'react';
import { Modal, Form, Container, Row, Col, Button } from 'react-bootstrap';
import SpinnerButton from '../common/SpinnerButton';

const ModalForm = ({ formContent, isPending, onSubmit, isFormValid, title, okText = 'Ok', cancelText = 'Cancel', ...props }) => {
  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered animation={true} backdrop="static" keyboard={false}>
      <>
        <Form onSubmit={onSubmit} disabled={isPending}>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row className="align-items-center">
                <Col>{formContent}</Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Container>
              <Row className="align-items-center">
                <Col xs>
                  <SpinnerButton variant="success" type="submit" loading={isPending} disabled={isPending || !isFormValid} text={okText} />
                </Col>
                <Col md="auto">
                  <Button variant="secondary" onClick={props.onHide}>
                    {cancelText}
                  </Button>
                </Col>
              </Row>
            </Container>
          </Modal.Footer>
        </Form>
      </>
    </Modal>
  );
};

export default ModalForm;
