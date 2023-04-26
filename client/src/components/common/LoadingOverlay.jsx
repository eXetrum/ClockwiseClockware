/* eslint-disable */
import React from 'react';
import { PuffLoader } from 'react-spinners';
import Stack from '@mui/material/Stack';

const LoadingOverlay = () => {
  return (
    <Stack
      height="100%"
      alignItems="center"
      justifyContent="center"
      sx={{
        color: 'white',
        background:
          'repeating-linear-gradient(\
                    45deg, \
                    rgba(96, 109, 188, 0.035),\
                    rgba(96, 109, 188, 0.035) 10px,\
                    rgba(70, 82, 152, 0.035) 10px,\
                    rgba(70, 82, 152, 0.035) 20px\
                  )',
      }}
    >
      <PuffLoader color="#36d7b7" />
    </Stack>
  );
};

export default LoadingOverlay;
