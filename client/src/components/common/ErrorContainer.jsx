import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';

import { getIconByError, isGlobalError, getErrorText } from '../../utils';

const ErrorContainer = ({ error = null }) => {
  if (error == null || !isGlobalError(error)) return null;

  const ErrorIcon = getIconByError(error);
  if (!ErrorIcon) return null;

  return (
    <>
      <Row className="justify-content-md-center">
        <Col md="auto">
          <Alert key="danger" variant="danger" className="m-0">
            {ErrorIcon}
            &nbsp;
            {getErrorText(error)}
          </Alert>
        </Col>
      </Row>
    </>
  );
};

export default ErrorContainer;
