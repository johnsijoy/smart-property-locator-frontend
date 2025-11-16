// src/pages/FavoritesPage.jsx
import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardMedia, CardContent, CardActions, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosInstance from '../api/axios';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { getFavoriteIds, removeFavorite } from '../utils/favorites';
import { DEFAULT_FALLBACK_IMAGE, getFirstPropertyImage } from '../utils/images';

const FavoritesPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const ids = getFavoriteIds();
      if (!ids || ids.length === 0) {
        setProperties([]);
        return;
      }

      // Fetch details for each ID. If an ID fails to fetch, it will be filtered out.
      const promises = ids.map((id) =>
        axiosInstance
          .get(`/properties/${id}/`)
          .then((res) => res.data)
          .catch((err) => {
            console.warn(`Failed to fetch property ${id}`, err);
            return null;
          })
      );

      const results = await Promise.all(promises);
      // Filter out nulls (failed fetches)
      const valid = results.filter(Boolean);
      setProperties(valid);

      // Optionally: remove stale IDs that no longer exist
      const fetchedIds = valid.map((p) => String(p.id));
      const staleIds = ids.filter((i) => !fetchedIds.includes(String(i)));
      if (staleIds.length > 0) {
        // remove stale ones from localStorage
        staleIds.forEach((sid) => removeFavorite(sid));
      }
    } catch (err) {
      console.error('loadFavorites error', err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = (id) => {
    removeFavorite(id);
    // Refresh displayed list
    setProperties((prev) => prev.filter((p) => String(p.id) !== String(id)));
  };

  if (loading) return <LoadingSpinner />;

  if (!properties || properties.length === 0) {
    return (
      <Container sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h4" color="text.primary" gutterBottom>
          ❤️ No Favorites Yet
        </Typography>
        <Typography variant="body1" color="text.secondary">
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" component={Link} to="/properties">
            View Properties
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
      </Typography>
      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} sm={6} md={4} key={property.id}>
            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="200"
                image={getFirstPropertyImage(property) || DEFAULT_FALLBACK_IMAGE}
                alt={property.title}
                sx={{ objectFit: 'cover' }}
                onError={(e) => (e.target.src = DEFAULT_FALLBACK_IMAGE)}
              />
              <CardContent>
                <Typography variant="h6">{property.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {property.location}
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  ${Number(property.price || 0).toLocaleString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" component={Link} to={`/properties/${property.id}`} color="primary">
                  View Details
                </Button>
                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleRemove(property.id)}>
                  Remove
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FavoritesPage;
