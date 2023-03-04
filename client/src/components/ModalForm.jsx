import React from 'react';
import { Modal, Form, Container, Row, Col, Button, Spinner } from 'react-bootstrap';

const ModalForm = ({ formContent, pending, onSubmit, isFormValid, title, okText = 'Ok', cancelText = 'Cancel', ...props }) => {
  return (
    <Modal {...props} aria-labelledby='contained-modal-title-vcenter' centered animation={true} backdrop='static' keyboard={false}>
      <>
        <Form onSubmit={onSubmit} disabled={pending}>
          <Modal.Header closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <Row className='align-items-center'>
                <Col>{formContent}</Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Container>
              <Row className='align-items-center'>
                <Col xs>
                  <Button variant='success' type='submit' disabled={!isFormValid() || pending}>
                    {pending && <Spinner className='me-2' as='span' animation='grow' size='sm' role='status' aria-hidden='true' />}
                    {okText}
                  </Button>
                </Col>
                <Col md='auto'>
                  <Button variant='secondary' onClick={props.onHide}>
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
