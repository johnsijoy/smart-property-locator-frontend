// src/pages/PostPropertyPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import axiosInstance from "../api/axios";
import LoadingSpinner from "../components/Common/LoadingSpinner";

// Backend property types
const propertyTypes = ["APARTMENT", "HOUSE", "CONDO", "LAND", "COMMERCIAL"];
const propertyTypeLabels = {
  APARTMENT: "Apartment",
  HOUSE: "House",
  CONDO: "Condo",
  LAND: "Land",
  COMMERCIAL: "Commercial",
};

const PostPropertyPage = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    property_type: "",
    bhk: "",
    area_sqft: "",
    latitude: "",
    longitude: "",
    owner_name: "",
    owner_email: "",
    owner_phone: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image selection
  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  // Auto fetch latitude & longitude when location changes
  useEffect(() => {
    const fetchLatLng = async () => {
      if (!form.location) return;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            form.location
          )}&countrycodes=in&limit=1`
        );
        const data = await response.json();
        if (data?.length > 0) {
          setForm((prev) => ({
            ...prev,
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            latitude: "",
            longitude: "",
          }));
        }
      } catch (err) {
        console.error("Error fetching coordinates:", err);
      }
    };

    const delayDebounce = setTimeout(fetchLatLng, 1000);
    return () => clearTimeout(delayDebounce);
  }, [form.location]);

  // Submit property
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.location || !form.price || !form.property_type || !form.description) {
      setSnackbar({ open: true, message: "⚠️ Fill all required fields!", severity: "error" });
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      // Append all other fields except latitude/longitude
      Object.keys(form).forEach((key) => {
        if (key !== "latitude" && key !== "longitude") {
          const value = form[key];
          if (value !== "" && value !== null && value !== undefined) {
            data.append(key, value);
          }
        }
      });

      // Append latitude and longitude explicitly as numbers
      if (form.latitude !== "" && form.latitude !== null) {
        data.append("latitude", Number(form.latitude));
      }
      if (form.longitude !== "" && form.longitude !== null) {
        data.append("longitude", Number(form.longitude));
      }

      // Append images
      images.forEach((file) => data.append("images", file));

      // POST request
      await axiosInstance.post("/properties/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSnackbar({ open: true, message: "✅ Property added successfully!", severity: "success" });

      // Reset form
      setForm({
        title: "",
        description: "",
        location: "",
        price: "",
        property_type: "",
        bhk: "",
        area_sqft: "",
        latitude: "",
        longitude: "",
        owner_name: "",
        owner_email: "",
        owner_phone: "",
      });
      setImages([]);
    } catch (err) {
      console.error("Error posting property:", err.response?.data || err.message);
      setSnackbar({
        open: true,
        message: "❌ Failed to post property. Check fields & images.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ bgcolor: "background.paper", p: 4, borderRadius: 3, boxShadow: 4 }}>
        <Typography variant="h4" color="primary" gutterBottom align="center">
          Add New Property
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField label="Property Title" name="title" value={form.title} onChange={handleChange} fullWidth required margin="normal" />
          <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth required margin="normal" multiline rows={3} />
          <TextField label="Location" name="location" value={form.location} onChange={handleChange} fullWidth required margin="normal" />

          <TextField
            label="Latitude"
            name="latitude"
            value={form.latitude}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Longitude"
            name="longitude"
            value={form.longitude}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />

          <TextField label="Price (₹)" name="price" value={form.price} onChange={handleChange} type="number" fullWidth required margin="normal" />
          <TextField label="Area (SqFt)" name="area_sqft" value={form.area_sqft} onChange={handleChange} type="number" fullWidth margin="normal" />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Property Type</InputLabel>
            <Select name="property_type" value={form.property_type} onChange={handleChange}>
              {propertyTypes.map((type) => (
                <MenuItem key={type} value={type}>{propertyTypeLabels[type]}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField label="BHK" name="bhk" value={form.bhk} onChange={handleChange} type="number" fullWidth margin="normal" />
          <TextField label="Owner Name" name="owner_name" value={form.owner_name} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Owner Email" name="owner_email" value={form.owner_email} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Owner Phone" name="owner_phone" value={form.owner_phone} onChange={handleChange} fullWidth margin="normal" />

          <Button variant="outlined" component="label" fullWidth sx={{ py: 1.5, mt: 2 }}>
            Upload Property Images
            <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
          </Button>

          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
            {images.map((img, idx) => (
              <img key={idx} src={URL.createObjectURL(img)} alt={`preview-${idx}`} style={{ width: 100, height: 100, borderRadius: 8, objectFit: "cover", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
            ))}
          </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ mt: 3 }}>
            Submit Property
          </Button>
        </form>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default PostPropertyPage;
