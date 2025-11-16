// src/pages/AdminLogin.jsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';

const AdminLogin = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      // Context login with "Admin" role
      const success = await handleLogin(username.trim(), password, 'Admin');
      setLoading(false);

      if (success) {
        // Navigate to React Home page
        navigate('/'); // React Home page
      } else {
        setError('Invalid admin credentials or unauthorized role.');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: 'background.paper',
          position: 'relative',
        }}
      >
        {/* Back Arrow */}
        <IconButton
          onClick={() => window.history.back()}
          sx={{ position: 'absolute', top: 8, left: 8, color: 'black' }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Close Icon */}
        <IconButton
          onClick={() => navigate('/')}
          sx={{ position: 'absolute', top: 8, right: 8, color: 'black' }}
        >
          <CloseIcon />
        </IconButton>

        {/* Admin Login Title */}
        <Typography variant="h5" sx={{ mb: 2, mt: 2, fontWeight: 'bold', color: 'black' }}>
          Admin Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="Admin Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login as Admin'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminLogin;
