import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h1" component="h2" color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h4" component="h1" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      <Button variant="contained" component={RouterLink} to="/" sx={{ mt: 3 }}>
        Go to Home
      </Button>
    </Container>
  );
};

export default NotFound;