import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import {
  Box,
  Grid,
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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingSpinner from '../Common/LoadingSpinner';

const ManageProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [openPropertyDialog, setOpenPropertyDialog] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null); // For editing
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    property_type: '',
    latitude: '',
    longitude: '',
    amenities: [],
  });
  const [allAmenities, setAllAmenities] = useState([]);
  const [dialogLoading, setDialogLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
    fetchAllAmenities();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/properties/');
      setProperties(response.data.results || response.data);
    } catch (err) {
      setError("Failed to fetch properties.");
      console.error("Failed to fetch properties:", err.response?.data || err.message);
      setSnackbarMessage('Error fetching properties!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAmenities = async () => {
    try {
      const response = await axiosInstance.get('/amenities/');
      setAllAmenities(response.data);
    } catch (err) {
      console.error("Failed to fetch amenities:", err);
    }
  };

  const handleOpenEditProperty = (property) => {
    setCurrentProperty(property);
    setFormState({
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location,
      property_type: property.property_type,
      latitude: property.latitude || '',
      longitude: property.longitude || '',
      amenities: property.amenities.map(amenity => amenity.id),
    });
    setOpenPropertyDialog(true);
    setError(null);
  };

  const handleClosePropertyDialog = () => {
    setOpenPropertyDialog(false);
    setError(null);
    setCurrentProperty(null); // Clear current property
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (e) => {
    setFormState(prev => ({ ...prev, amenities: e.target.value }));
  };

  const handleSubmitProperty = async (event) => {
    event.preventDefault();
    setDialogLoading(true);
    setError(null);

    const propertyData = {
      ...formState,
      price: parseFloat(formState.price),
      latitude: formState.latitude ? parseFloat(formState.latitude) : null,
      longitude: formState.longitude ? parseFloat(formState.longitude) : null,
      // Admin might not explicitly set owner, but for PUT, it's fine if not changed
      // For creating a new property as admin, you'd need to select an owner ID
    };

    try {
      await axiosInstance.put(`/properties/${currentProperty.id}/`, propertyData);
      setSnackbarMessage('Property updated successfully!');
      setSnackbarSeverity('success');
      fetchProperties(); // Refresh properties list
      handleClosePropertyDialog();
    } catch (err) {
      console.error("Error updating property:", err.response?.data || err.message);
      setError("Failed to update property. " + (err.response?.data?.detail || "Please check your input."));
      setSnackbarMessage('Error updating property!');
      setSnackbarSeverity('error');
    } finally {
      setDialogLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      try {
        await axiosInstance.delete(`/properties/${propertyId}/`);
        setSnackbarMessage('Property deleted successfully!');
        setSnackbarSeverity('success');
        fetchProperties(); // Refresh properties list
      } catch (err) {
        console.error("Error deleting property:", err.response?.data || err.message);
        setSnackbarMessage('Error deleting property!');
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
      <Typography variant="h5" component="h2" gutterBottom>
        Manage Properties
      </Typography>
      {properties.length === 0 ? (
        <Typography variant="body1" color="text.secondary">No properties found.</Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table aria-label="manage properties table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.id}</TableCell>
                  <TableCell>{property.title}</TableCell>
                  <TableCell>{property.property_type}</TableCell>
                  <TableCell>${property.price?.toLocaleString()}</TableCell>
                  <TableCell>{property.location}</TableCell>
                  <TableCell>{property.owner?.username || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      aria-label="edit property"
                      color="primary"
                      onClick={() => handleOpenEditProperty(property)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      aria-label="delete property"
                      color="error"
                      onClick={() => handleDeleteProperty(property.id)}
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

      {/* Property Edit Dialog */}
      <Dialog open={openPropertyDialog} onClose={handleClosePropertyDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Property</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmitProperty} sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Title"
              name="title"
              value={formState.title}
              onChange={handleFormChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formState.description}
              onChange={handleFormChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formState.price}
              onChange={handleFormChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Location"
              name="location"
              value={formState.location}
              onChange={handleFormChange}
            />
             <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  name="latitude"
                  type="number"
                  value={formState.latitude}
                  onChange={handleFormChange}
                  inputProps={{ step: "any" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  name="longitude"
                  type="number"
                  value={formState.longitude}
                  onChange={handleFormChange}
                  inputProps={{ step: "any" }}
                />
              </Grid>
            </Grid>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="property-type-label">Property Type</InputLabel>
              <Select
                labelId="property-type-label"
                id="property_type"
                name="property_type"
                value={formState.property_type}
                label="Property Type"
                onChange={handleFormChange}
              >
                <MenuItem value=""><em>Select Type</em></MenuItem>
                <MenuItem value="House">House</MenuItem>
                <MenuItem value="Apartment">Apartment</MenuItem>
                <MenuItem value="Condo">Condo</MenuItem>
                <MenuItem value="Land">Land</MenuItem>
                {/* Add more types as needed */}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="amenities-label">Amenities</InputLabel>
              <Select
                labelId="amenities-label"
                id="amenities"
                multiple
                name="amenities"
                value={formState.amenities}
                onChange={handleAmenityChange}
                label="Amenities"
                renderValue={(selected) => selected.map(id => allAmenities.find(a => a.id === id)?.name).join(', ')}
              >
                {allAmenities.map((amenity) => (
                  <MenuItem key={amenity.id} value={amenity.id}>
                    {amenity.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* TODO: Image upload handling (more complex for admin, perhaps delete/replace existing images) */}
            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={handleClosePropertyDialog}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={dialogLoading}>
                {dialogLoading ? <CircularProgress size={24} /> : 'Update Property'}
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

export default ManageProperties;