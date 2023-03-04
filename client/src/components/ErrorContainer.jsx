import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';

const ErrorContainer = ({ error = null }) => {
  if (error == null) return null;

  const getIconByError = (error) => {
    if (error?.code === 'ERR_NETWORK') return <CloudOffIcon fontSize='large' />;
    if (error?.code === 'ERR_BAD_REQUEST' && error?.response?.status === 403) return <BlockOutlinedIcon fontSize='large' />;
    if (error?.code === 'ERR_BAD_REQUEST' && error?.response?.status === 404) return <ErrorOutlineOutlinedIcon fontSize='large' />;
    if (error?.code === 'ERR_BAD_REQUEST' && error?.response?.status === 400) return <SyncProblemIcon fontSize='large' />;
    return null;
  };

  const ErrorIcon = getIconByError(error);
  if (!ErrorIcon) return null;

  return (
    <>
      <Row className='justify-content-md-center'>
        <Col md='auto'>
          <Alert key='danger' variant='danger' className='m-0'>
            {ErrorIcon}
            &nbsp;
            {error?.response?.data?.detail?.toString() || error?.response?.statusText || error?.message || error?.toString()}
          </Alert>
        </Col>
      </Row>
    </>
  );
};

export default ErrorContainer;
