import React from 'react';
import Stack from '@mui/material/Stack';

import ErrorContainer from './ErrorContainer';
import { isGlobalErrorType } from '../../utils';

const NoRowsOverlay = ({ error }) => {
  return isGlobalErrorType(error?.type) ? (
    <ErrorContainer error={error} />
  ) : (
    <Stack height="100%" alignItems="center" justifyContent="center">
      No records
    </Stack>
  );
};

export default NoRowsOverlay;
