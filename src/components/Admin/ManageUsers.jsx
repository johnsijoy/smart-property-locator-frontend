import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingSpinner from '../Common/LoadingSpinner';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming your backend has an admin-only endpoint for listing all users
      // This might be /api/users/ or /api/admin/users/
      const response = await axiosInstance.get('/users/');
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users.");
      console.error("Failed to fetch users:", err.response?.data || err.message);
      setSnackbarMessage('Error fetching users!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdminStatus = async (userId, isStaff) => {
    try {
      await axiosInstance.patch(`/users/${userId}/`, { is_staff: !isStaff });
      setSnackbarMessage(`User's admin status updated successfully!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Error updating user admin status:", err.response?.data || err.message);
      setSnackbarMessage('Error updating user admin status!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleToggleOwnerStatus = async (userId, isPropertyOwner) => {
    try {
      // Assuming your user model has an `is_property_owner` field
      await axiosInstance.patch(`/users/${userId}/`, { is_property_owner: !isPropertyOwner });
      setSnackbarMessage(`User's property owner status updated successfully!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Error updating user owner status:", err.response?.data || err.message);
      setSnackbarMessage('Error updating user owner status!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await axiosInstance.delete(`/users/${userId}/`);
        setSnackbarMessage('User deleted successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        fetchUsers(); // Refresh the list
      } catch (err) {
        console.error("Error deleting user:", err.response?.data || err.message);
        setSnackbarMessage('Error deleting user!');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error && !snackbarOpen) return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Manage Users
      </Typography>
      {users.length === 0 ? (
        <Typography variant="body1" color="text.secondary">No users found.</Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table aria-label="manage users table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Is Admin</TableCell>
                <TableCell align="center">Is Property Owner</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell align="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.is_staff}
                          onChange={() => handleToggleAdminStatus(user.id, user.is_staff)}
                          color="primary"
                        />
                      }
                      label={user.is_staff ? 'Yes' : 'No'}
                      labelPlacement="end"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={user.is_property_owner || false} // Ensure it's never undefined
                          onChange={() => handleToggleOwnerStatus(user.id, user.is_property_owner || false)}
                          color="secondary"
                        />
                      }
                      label={user.is_property_owner ? 'Yes' : 'No'}
                      labelPlacement="end"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      aria-label="delete user"
                      color="error"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageUsers;