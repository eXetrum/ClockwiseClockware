import React from 'react';
import { Button, Spinner } from 'react-bootstrap';

const SpinnerButton = ({ text = 'Button', loading = false, ...props }) => {
  return (
    <Button variant="primary" type="submit" {...props}>
      {loading ? <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" /> : null}
      {text}
    </Button>
  );
};

export default SpinnerButton;
