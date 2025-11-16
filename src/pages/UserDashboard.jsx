import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../api/axios';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import PropertyCard from '../components/Common/PropertyCard';
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const UserDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [userProperties, setUserProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [error, setError] = useState(null);
  const [openPropertyDialog, setOpenPropertyDialog] = useState(false);
  const [currentProperty, setCurrentProperty] = useState(null); // For editing
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    property_type: '',
    latitude: '', // Assuming these fields exist in your model
    longitude: '', // Assuming these fields exist in your model
    // images: null, // For file input, handle separately
    amenities: [], // Array of amenity IDs
  });
  const [allAmenities, setAllAmenities] = useState([]);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');


  useEffect(() => {
    if (user) {
      fetchUserProperties();
      fetchAllAmenities();
    }
  }, [user]);

  const fetchUserProperties = async () => {
    setLoadingProperties(true);
    try {
      // Assuming your backend has an endpoint for owner's properties or a filter
      const response = await axiosInstance.get(`/properties/?owner=${user.id}`);
      setUserProperties(response.data.results || response.data);
    } catch (err) {
      setError("Failed to fetch your properties.");
      console.error("Failed to fetch user properties:", err);
    } finally {
      setLoadingProperties(false);
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

  const handleOpenAddProperty = () => {
    setCurrentProperty(null);
    setFormState({
      title: '', description: '', price: '', location: '', property_type: '',
      latitude: '', longitude: '', amenities: []
    });
    setOpenPropertyDialog(true);
    setError(null);
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
      amenities: property.amenities.map(amenity => amenity.id), // Assuming amenities are objects with 'id'
    });
    setOpenPropertyDialog(true);
    setError(null);
  };

  const handleClosePropertyDialog = () => {
    setOpenPropertyDialog(false);
    setError(null);
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
      owner: user.id // Assign current user as owner
    };

    try {
      if (currentProperty) {
        await axiosInstance.put(`/properties/${currentProperty.id}/`, propertyData);
        setSnackbarMessage('Property updated successfully!');
        setSnackbarSeverity('success');
      } else {
        await axiosInstance.post('/properties/', propertyData);
        setSnackbarMessage('Property added successfully!');
        setSnackbarSeverity('success');
      }
      fetchUserProperties(); // Refresh properties list
      handleClosePropertyDialog();
    } catch (err) {
      console.error("Error saving property:", err.response?.data || err.message);
      setError("Failed to save property. " + (err.response?.data?.detail || "Please check your input."));
      setSnackbarMessage('Error saving property!');
      setSnackbarSeverity('error');
    } finally {
      setDialogLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await axiosInstance.delete(`/properties/${propertyId}/`);
        fetchUserProperties(); // Refresh properties list
        setSnackbarMessage('Property deleted successfully!');
        setSnackbarSeverity('success');
      } catch (err) {
        console.error("Error deleting property:", err.response?.data || err.message);
        setError("Failed to delete property.");
        setSnackbarMessage('Error deleting property!');
        setSnackbarSeverity('error');
      } finally {
        setSnackbarOpen(true);
      }
    }
  };

  if (authLoading || loadingProperties) return <LoadingSpinner />;
  if (error && !snackbarOpen) return <Typography color="error" align="center" sx={{ mt: 4 }}>{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {user?.username}'s Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddProperty}
        >
          Add New Property
        </Button>
      </Box>

      {userProperties.length === 0 ? (
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 8 }}>
          You haven't listed any properties yet.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {userProperties.map(property => (
            <Grid item xs={12} sm={6} md={4} key={property.id}>
              <PropertyCard property={property} /> {/* Re-use PropertyCard */}
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => handleOpenEditProperty(property)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteProperty(property.id)}
                >
                  Delete
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Property Add/Edit Dialog */}
      <Dialog open={openPropertyDialog} onClose={handleClosePropertyDialog} fullWidth maxWidth="sm">
        <DialogTitle>{currentProperty ? 'Edit Property' : 'Add New Property'}</DialogTitle>
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
            {/* TODO: Image upload handling */}
            <DialogActions sx={{ mt: 3 }}>
              <Button onClick={handleClosePropertyDialog}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={dialogLoading}>
                {dialogLoading ? <CircularProgress size={24} /> : (currentProperty ? 'Update Property' : 'Add Property')}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserDashboardPage;