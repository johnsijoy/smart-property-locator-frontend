// src/pages/PropertyListings.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Container,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axiosInstance from "../api/axios";
import PropertyCard from "../components/Common/PropertyCard";

const PropertyListings = () => {
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);

  const [searchParams, setSearchParams] = useState({
    location: "",
    min_price: "",
    max_price: "",
    property_type: "",
    bhk: "",
  });

  // ✅ Fetch properties from backend
  const fetchProperties = async () => {
    try {
      const res = await axiosInstance.get("/properties/");
      setProperties(res.data);
      setFilteredProperties(res.data);
    } catch (err) {
      console.error("Failed to load properties:", err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // ✅ Handle Input Change
  const handleSearchChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  // ✅ Apply Filters
  const applyFilters = () => {
    let filtered = properties;

    if (searchParams.location) {
      filtered = filtered.filter((p) =>
        p.location?.toLowerCase().includes(searchParams.location.toLowerCase())
      );
    }

    if (searchParams.min_price) {
      filtered = filtered.filter(
        (p) => p.price >= Number(searchParams.min_price)
      );
    }

    if (searchParams.max_price) {
      filtered = filtered.filter(
        (p) => p.price <= Number(searchParams.max_price)
      );
    }

    if (searchParams.property_type) {
      filtered = filtered.filter(
        (p) =>
          p.property_type?.toLowerCase() ===
          searchParams.property_type.toLowerCase()
      );
    }

    if (searchParams.bhk) {
      filtered = filtered.filter(
        (p) => String(p.bhk) === String(searchParams.bhk)
      );
    }

    setFilteredProperties(filtered);
  };

  // ✅ Clear All Filters
  const clearFilters = () => {
    setSearchParams({
      location: "",
      min_price: "",
      max_price: "",
      property_type: "",
      bhk: "",
    });
    setFilteredProperties(properties);
  };

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        align="center"
        sx={{ my: 4, fontWeight: "bold", color: "#800000" }}
      >
        Property Listings
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 6, p: 3, bgcolor: "background.paper", borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
          Filter Properties
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Location"
              name="location"
              size="small"
              value={searchParams.location}
              onChange={handleSearchChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Min Price"
              name="min_price"
              size="small"
              value={searchParams.min_price}
              onChange={handleSearchChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="number"
              label="Max Price"
              name="max_price"
              size="small"
              value={searchParams.max_price}
              onChange={handleSearchChange}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Property Type</InputLabel>
              <Select
                name="property_type"
                value={searchParams.property_type}
                onChange={handleSearchChange}
                label="Property Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Apartment">Apartment</MenuItem>
                <MenuItem value="Villa">Villa</MenuItem>
                <MenuItem value="Independent House">Independent House</MenuItem>
                <MenuItem value="Plot">Plot</MenuItem>
                <MenuItem value="Commercial Space">Commercial Space</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>BHK</InputLabel>
              <Select
                name="bhk"
                value={searchParams.bhk}
                onChange={handleSearchChange}
                label="BHK"
              >
                <MenuItem value="">All</MenuItem>
                {[1, 2, 3, 4, 5].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num} BHK
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
          <Button variant="contained" onClick={applyFilters}>
            Apply Filters
          </Button>
          <Button variant="contained"  onClick={clearFilters}>
            Clear Filters
          </Button>
        </Box>
      </Box>

      {/* Property Cards */}
      <Grid container spacing={4} justifyContent="center">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
              <PropertyCard property={property} />
            </Grid>
          ))
        ) : (
          <Typography align="center" sx={{ width: "100%", mt: 4 }}>
            No properties found.
          </Typography>
        )}
      </Grid>
    </Container>
  );
};

export default PropertyListings;
