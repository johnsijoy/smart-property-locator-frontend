import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        width: '100%',
        py: 3,
        mt: 'auto', // Pushes the footer to the bottom of the page
        bgcolor: '#800000',
        color: 'white',
        borderTop: '1px solid #e0e0e0',
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Smart Property Locator. All rights reserved.
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Link href="/privacy" color="inherit" sx={{ mx: 1, textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" color="inherit" sx={{ mx: 1, textDecoration: 'none' }}>Terms of Use</Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;