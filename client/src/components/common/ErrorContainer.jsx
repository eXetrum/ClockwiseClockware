import React from 'react';
import { Alert, Stack } from '@mui/material';

import { getIconByErrorType, isGlobalErrorType } from '../../utils';

const ErrorContainer = ({ error = null }) => {
  if (error === null || !isGlobalErrorType(error?.type)) return null;

  const ErrorIcon = getIconByErrorType(error?.type);
  if (!ErrorIcon) return null;

  return (
    <Stack height="100%" alignItems="center" justifyContent="center" spacing={2}>
      <Alert icon={false} severity="error">
        {ErrorIcon}
        &nbsp;
        {error.message}
      </Alert>
    </Stack>
  );
};

export default ErrorContainer;
