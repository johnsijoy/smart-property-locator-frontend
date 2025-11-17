// src/pages/PropertyDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import LoadingSpinner from "../components/Common/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  List,
  ListItem,
  TextField,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Snackbar,
  Button,
  Link as MuiLink,
  Alert,
} from "@mui/material";

import {
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { DEFAULT_FALLBACK_IMAGE, getImageUrlFromItem } from "../utils/images";
import { isFavorite, toggleFavorite } from "../utils/favorites";

/* --------------------------- Leaflet default icon setup --------------------------- */
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* Amenity emoji icons */
const amenityIcons = {
  hospital: "🏥",
  school: "🏫",
  park: "🏞",
  supermarket: "🛒",
  gym: "🏋",
  mall: "🏬",
  default: "📍",
};

const resolveImagesArray = (images) => {
  if (!images) return [];
  if (Array.isArray(images) && images.length > 0) {
    if (typeof images[0] === "string") return images;
    if (typeof images[0] === "object") {
      return images.map((it) => it.image || it.image_url || "");
    }
  }
  return [];
};

const safeNumber = (v, fallback = null) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/* Fetch real nearby amenities using Overpass API */
const fetchNearbyAmenities = async (lat, lng, radius = 1500) => {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="school"](around:${radius},${lat},${lng});
        node["leisure"="park"](around:${radius},${lat},${lng});
        node["shop"="supermarket"](around:${radius},${lat},${lng});
        node["leisure"="fitness_centre"](around:${radius},${lat},${lng});
        node["shop"="mall"](around:${radius},${lat},${lng});
      );
      out body;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data?.elements) return [];
    return data.elements.map((el) => ({
      name: el.tags.name || el.tags.amenity || el.tags.shop || "Unknown",
      type: el.tags.amenity || el.tags.leisure || el.tags.shop || "unknown",
      lat: el.lat,
      lng: el.lon,
      icon:
        amenityIcons[el.tags.amenity?.toLowerCase()] ||
        amenityIcons[el.tags.leisure?.toLowerCase()] ||
        amenityIcons[el.tags.shop?.toLowerCase()] ||
        amenityIcons.default,
    }));
  } catch (err) {
    console.error("Error fetching nearby amenities:", err);
    return [];
  }
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarInfo, setSnackbarInfo] = useState({ severity: "info", message: "" });
  const [nearbyAmenities, setNearbyAmenities] = useState([]);

  const statusIcons = {
    Available: new L.Icon({
      iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    }),
    Sold: new L.Icon({
      iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    }),
    "Under Construction": new L.Icon({
      iconUrl: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    }),
  };

  useEffect(() => {
  const fetchPropertyAndAmenities = async () => {
    setLoading(true);
    try {
      // 1️⃣ Fetch property
      const res = await axiosInstance.get(`/properties/${id}/`);
      setProperty(res.data);

      // 2️⃣ Validate coordinates
      const lat = safeNumber(res.data.latitude);
      const lng = safeNumber(res.data.longitude);
      if (lat !== null && lng !== null) {
        // 3️⃣ Fetch nearby amenities with retry
        const fetchNearbyAmenitiesWithRetry = async (lat, lng, retries = 2) => {
          for (let i = 0; i <= retries; i++) {
            try {
              const amenities = await fetchNearbyAmenities(lat, lng);
              if (amenities.length > 0) return amenities;
            } catch (err) {
              console.warn(`Amenities fetch attempt ${i + 1} failed`, err);
            }
            await new Promise((r) => setTimeout(r, 1000)); // wait 1s before retry
          }
          return []; // fallback empty array
        };

        const amenities = await fetchNearbyAmenitiesWithRetry(lat, lng);
        setNearbyAmenities(amenities);
      } else {
        setNearbyAmenities([]); // fallback if coords invalid
      }
    } catch (err) {
      console.error("Error fetching property or amenities:", err);
      setSnackbarInfo({
        severity: "error",
        message: "Failed to load property or nearby amenities.",
      });
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setFav(isFavorite(id));
    }
  };

  fetchPropertyAndAmenities();
}, [id]);


  const handleToggleFavorite = () => {
    const newState = toggleFavorite(id);
    setFav(newState);
    setSnackbarInfo({
      severity: "success",
      message: newState ? "Added to favourites" : "Removed from favourites",
    });
    setSnackbarOpen(true);
  };

  const handleDeleteProperty = async () => {
    try {
      await axiosInstance.delete(`/properties/${id}/`);
      setSnackbarInfo({ severity: "success", message: "Property removed successfully" });
      setSnackbarOpen(true);
      setTimeout(() => navigate("/properties"), 900);
    } catch (err) {
      console.error("Delete error:", err);
      setSnackbarInfo({ severity: "error", message: "Error removing property" });
      setSnackbarOpen(true);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!property) return <Typography align="center" sx={{ mt: 4 }}>Property not found.</Typography>;

  const images = resolveImagesArray(property.images);
  const lat = safeNumber(property.latitude);
  const lng = safeNumber(property.longitude);
  const coords = lat !== null && lng !== null ? [lat, lng] : null;

  /* Price Prediction Component */
  const PricePredictionEstimator = ({ property }) => {
    const [formData, setFormData] = useState({
      location: property.location || "",
      property_type: property.property_type || "Apartment",
      bhk: property.bhk || 1,
      area_sqft: property.area_sqft || 500,
    });
    const [prediction, setPrediction] = useState(null);
    const [loadingPred, setLoadingPred] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

    const fetchPrediction = async (e) => {
      e.preventDefault();
      setError(null);
      setPrediction(null);
      if (!formData.location || !formData.property_type || !formData.bhk || !formData.area_sqft) {
        setError("All fields are required.");
        return;
      }
      setLoadingPred(true);
      try {
        const res = await axiosInstance.post("/predict-price/predict/", {
          location: formData.location,
          property_type: formData.property_type,
          bhk: Number(formData.bhk),
          area_sqft: Number(formData.area_sqft),
        });
        if (res?.data?.predicted_price !== undefined) setPrediction(res.data.predicted_price);
        else setError("Prediction failed.");
      } catch (err) {
        console.error("Prediction error:", err);
        setError(err.response?.data?.error || "Prediction service failed.");
      } finally {
        setLoadingPred(false);
      }
    };

    return (
      <Card sx={{ p: 3, mt: 4, borderLeft: "5px solid #800000" }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#800000", fontWeight: 700 }}>
          Price Prediction Estimator
        </Typography>

        <Box component="form" onSubmit={fetchPrediction}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Location" name="location" value={formData.location} onChange={handleInputChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select label="Property Type" name="property_type" value={formData.property_type} onChange={handleInputChange} fullWidth required>
                {["Apartment", "House", "Villa", "Condo", "Plot"].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="BHK" name="bhk" type="number" value={formData.bhk} onChange={handleInputChange} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Area (SqFt)" name="area_sqft" type="number" value={formData.area_sqft} onChange={handleInputChange} fullWidth required />
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, bgcolor: "#800000" }} disabled={loadingPred}>
            {loadingPred ? "Calculating..." : "Get Estimated Price"}
          </Button>
        </Box>

        {prediction !== null && (
          <Typography variant="h6" sx={{ mt: 2, color: "#800000", fontWeight: 700 }}>
            Estimated Price: ₹ {Number(prediction).toLocaleString("en-IN")}
          </Typography>
        )}

        {error && <Typography sx={{ mt: 1, color: "error.main" }}>{error}</Typography>}
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ bgcolor: "white", p: 4, borderRadius: 2, boxShadow: 3 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" sx={{ color: "#800000", fontWeight: "bold" }}>
            {property.title || "Untitled Property"}
          </Typography>
          <Box>
            {!isAdmin && (
              <IconButton onClick={handleToggleFavorite} aria-label="toggle-fav">
                {fav ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
              </IconButton>
            )}
            {isAdmin && (
              <Button variant="contained" startIcon={<DeleteIcon />} onClick={handleDeleteProperty} sx={{ ml: 2 }}>
                Remove Property
              </Button>
            )}
          </Box>
        </Box>

        <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
          <LocationOnIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          {property.location || "Location not specified"}
        </Typography>

        {/* Images */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {images.length > 0 ? (
            images.map((imgUrl, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card>
                  <CardMedia
                    component="img"
                    height="200"
                    image={getImageUrlFromItem(imgUrl)}
                    alt={`${property.title || "Property"} - ${idx}`}
                    onError={(e) => (e.target.src = DEFAULT_FALLBACK_IMAGE)}
                  />
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Card>
                <CardMedia component="img" height="300" image={DEFAULT_FALLBACK_IMAGE} />
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Details & Owner */}
        <Grid container spacing={4} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ color: "#800000" }}>Property Details</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><AttachMoneyIcon /></ListItemIcon>
                <ListItemText primary={`Price: ₹${property.price ? Number(property.price).toLocaleString("en-IN") : "N/A"}`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary={`Type: ${property.property_type || "N/A"}`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><StarIcon /></ListItemIcon>
                <ListItemText primary={`BHK: ${property.bhk ?? "N/A"}`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><StarIcon /></ListItemIcon>
                <ListItemText primary={`Area: ${property.area_sqft ?? "N/A"} sq.ft`} />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ color: "#800000" }}>Owner Details</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary={`Name: ${property.owner?.username || "N/A"}`} />
              </ListItem>
              <ListItem>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText
                  primary="Email"
                  secondary={property.owner?.email ? <MuiLink href={`mailto:${property.owner.email}`}>{property.owner.email}</MuiLink> : "N/A"}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><PhoneIcon /></ListItemIcon>
                <ListItemText primary={`Contact: ${property.owner?.contact_no || "N/A"}`} />
              </ListItem>
            </List>
          </Grid>
        </Grid>

        {/* Prediction */}
        <Box sx={{ mt: 4 }}>
          <PricePredictionEstimator property={property} />
        </Box>

        {/* Map */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ color: "#800000", mb: 1 }}>Location on Map</Typography>
          <Box sx={{ height: 420, borderRadius: 2, overflow: "hidden", boxShadow: 3 }}>
            {coords ? (
              <MapContainer key={`${coords[0]},${coords[1]}`} center={coords} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Property Marker */}
                <Marker position={coords} icon={statusIcons[property.status] || new L.Icon.Default()}>
                  <Popup>
                    <Typography variant="subtitle1">{property.title}</Typography>
                    <Typography variant="body2">{property.location}</Typography>
                    <Typography variant="body2">Status: {property.status || "N/A"}</Typography>
                  </Popup>
                </Marker>

                {/* Nearby Amenities */}
                {nearbyAmenities.map((a, i) => (
                  <Marker
                    key={`${a.name}-${i}`}
                    position={[a.lat, a.lng]}
                    icon={new L.DivIcon({
                      html: `<div style="font-size:20px">${a.icon}</div>`,
                      className: "",
                      iconSize: [24, 24],
                    })}
                  >
                    <Popup>{a.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            ) : (
              <Box sx={{ height: "100%", display: "grid", placeItems: "center" }}>
                <Typography color="text.secondary">Coordinates not available</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarInfo.severity} variant="filled">
          {snackbarInfo.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PropertyDetail;
