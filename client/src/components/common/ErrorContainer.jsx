import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { getIconByError, getErrorText } from '../../utils/error';

const ErrorContainer = ({ error = null }) => {
  if (error == null) return null;

  const ErrorIcon = getIconByError(error);
  if (!ErrorIcon) return null;

  const ErrorText = getErrorText(error);

  return (
    <>
      <Row className="justify-content-md-center">
        <Col md="auto">
          <Alert key="danger" variant="danger" className="m-0">
            {ErrorIcon}
            &nbsp;
            {ErrorText}
          </Alert>
        </Col>
      </Row>
    </>
  );
};

export default ErrorContainer;
