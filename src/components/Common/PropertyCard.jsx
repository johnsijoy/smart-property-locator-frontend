// src/components/Common/PropertyCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardMedia, CardContent, Typography, Button, CardActions } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import { getFirstPropertyImage, DEFAULT_FALLBACK_IMAGE } from "../../utils/images";

const PropertyCard = ({ property }) => {
  const finalImageUrl = getFirstPropertyImage(property) || DEFAULT_FALLBACK_IMAGE;
  const formattedPrice = property.price ? Number(property.price).toLocaleString("en-IN") : "N/A";

  return (
    <Card
      sx={{
        maxWidth: 345,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: 3,
        borderRadius: 2,
        transition: "0.25s",
        "&:hover": { transform: "scale(1.02)" },
      }}
    >
      <CardMedia
        component="img"
        height="190"
        image={finalImageUrl}
        alt={property.title || "Property Image"}
        sx={{ objectFit: "cover" }}
        onError={(e) => (e.target.src = DEFAULT_FALLBACK_IMAGE)}
      />

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" noWrap>
          {property.title}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }} noWrap>
          <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} /> {property.location}
        </Typography>

        <Typography variant="h6" color="maroon" sx={{ display: "flex", alignItems: "center", fontWeight: 600 }}>
          <CurrencyRupeeIcon fontSize="small" sx={{ mr: 0.5 }} /> {formattedPrice}
        </Typography>
      </CardContent>

      <CardActions>
        <Button size="small" component={Link} to={`/properties/${property.id}`}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

export default PropertyCard;
