import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';

import { getIconByErrorType, isGlobalErrorType } from '../../utils';

const ErrorContainer = ({ error = null }) => {
  if (error === null || !isGlobalErrorType(error?.type)) return null;

  const ErrorIcon = getIconByErrorType(error?.type);
  if (!ErrorIcon) return null;

  return (
    <>
      <Row className="justify-content-md-center">
        <Col md="auto">
          <Alert key="danger" variant="danger" className="m-0">
            {ErrorIcon}
            &nbsp;
            {error.message}
          </Alert>
        </Col>
      </Row>
    </>
  );
};

export default ErrorContainer;
