import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
      <CircularProgress />
      <Typography variant="h6" sx={{ mt: 2 }}>Loading...</Typography>
    </Box>
  );
};

export default LoadingSpinner;