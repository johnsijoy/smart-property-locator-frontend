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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingSpinner from '../Common/LoadingSpinner';

const ManageAmenities = () => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openAmenityDialog, setOpenAmenityDialog] = useState(false);
  const [currentAmenity, setCurrentAmenity] = useState(null); // For editing
  const [formState, setFormState] = useState({
    name: '',
    icon: '', // Assuming 'icon' is a string for the icon class/name
  });
  const [dialogLoading, setDialogLoading] = useState(false);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/amenities/');
      setAmenities(response.data);
    } catch (err) {
      setError("Failed to fetch amenities.");
      console.error("Failed to fetch amenities:", err.response?.data || err.message);
      setSnackbarMessage('Error fetching amenities!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddAmenity = () => {
    setCurrentAmenity(null);
    setFormState({ name: '', icon: '' });
    setOpenAmenityDialog(true);
    setError(null);
  };

  const handleOpenEditAmenity = (amenity) => {
    setCurrentAmenity(amenity);
    setFormState({ name: amenity.name, icon: amenity.icon || '' });
    setOpenAmenityDialog(true);
    setError(null);
  };

  const handleCloseAmenityDialog = () => {
    setOpenAmenityDialog(false);
    setError(null);
    setCurrentAmenity(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitAmenity = async (event) => {
    event.preventDefault();
    setDialogLoading(true);
    setError(null);

    try {
      if (currentAmenity) {
        await axiosInstance.put(`/amenities/${currentAmenity.id}/`, formState);
        setSnackbarMessage('Amenity updated successfully!');
        setSnackbarSeverity('success');
      } else {
        await axiosInstance.post('/amenities/', formState);
        setSnackbarMessage('Amenity added successfully!');
        setSnackbarSeverity('success');
      }
      fetchAmenities(); // Refresh amenities list
      handleCloseAmenityDialog();
    } catch (err) {
      console.error("Error saving amenity:", err.response?.data || err.message);
      setError("Failed to save amenity. " + (err.response?.data?.detail || "Please check your input."));
      setSnackbarMessage('Error saving amenity!');
      setSnackbarSeverity('error');
    } finally {
      setDialogLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteAmenity = async (amenityId) => {
    if (window.confirm("Are you sure you want to delete this amenity? This will affect properties linked to it.")) {
      try {
        await axiosInstance.delete(`/amenities/${amenityId}/`);
        setSnackbarMessage('Amenity deleted successfully!');
        setSnackbarSeverity('success');
        fetchAmenities(); // Refresh amenities list
      } catch (err) {
        console.error("Error deleting amenity:", err.response?.data || err.message);
        setSnackbarMessage('Error deleting amenity!');
        setSnackbarSeverity('error');
      } finally {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Manage Amenities
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddAmenity}
        >
          Add New Amenity
        </Button>
      </Box>

      {amenities.length === 0 ? (
        <Typography variant="body1" color="text.secondary">No amenities found.</Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table aria-label="manage amenities table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Icon (e.g., MUI Icon Name)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {amenities.map((amenity) => (
                <TableRow key={amenity.id}>
                  <TableCell>{amenity.id}</TableCell>
                  <TableCell>{amenity.name}</TableCell>
                  <TableCell>{amenity.icon || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      aria-label="edit amenity"
                      color="primary"
                      onClick={() => handleOpenEditAmenity(amenity)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete amenity"
                      color="error"
                      onClick={() => handleDeleteAmenity(amenity.id)}
                      sx={{ ml: 1 }}
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

      {/* Amenity Add/Edit Dialog */}
      <Dialog open={openAmenityDialog} onClose={handleCloseAmenityDialog} fullWidth maxWidth="xs">
        <DialogTitle>{currentAmenity ? 'Edit Amenity' : 'Add New Amenity'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmitAmenity} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Amenity Name"
              name="name"
              value={formState.name}
              onChange={handleFormChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Icon (e.g., 'School', 'LocalHospital')"
              name="icon"
              value={formState.icon}
              onChange={handleFormChange}
              helperText="Enter a string that can identify an icon (e.g., for mapping to MUI Icons later)"
            />
            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={handleCloseAmenityDialog}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={dialogLoading}>
                {dialogLoading ? <CircularProgress size={24} /> : (currentAmenity ? 'Update Amenity' : 'Add Amenity')}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

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

export default ManageAmenities;