import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Hero images for the home page
const HERO_IMAGES = [
  "/images/h1.png",
  "/images/h3.png",
  "/images/h4.png",
  "/images/h5.png",
];

const DEFAULT_HERO = "/images/default-hero.jpg";

// Function to pick a random hero image
const pickRandom = (arr) => {
  if (!arr || arr.length === 0) return DEFAULT_HERO;
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
};

const Home = () => {
  const [heroImage] = useState(() => pickRandom(HERO_IMAGES));
  const navigate = useNavigate();

  // Handle Explore button click
  const handleExplore = () => {
    navigate("/properties");
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 320, sm: 500, md: 600 },
          overflow: "hidden",
        }}
      >
        {/* Background Hero Image */}
        <Box
          component="img"
          src={heroImage || DEFAULT_HERO}
          alt="Hero"
          onError={(e) => {
            if (e?.target) e.target.src = DEFAULT_HERO;
          }}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: 0.6, // reduced opacity
            transition: "opacity 0.5s ease-in-out",
          }}
        />

        {/* Overlay with Text + Explore Button */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textAlign: "center",
            background:
              "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))", // overlay
            px: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "#f5f5f5ff",
              textShadow: "2px 2px 8px rgba(0,0,0,0.6)",
              mb: 2,
            }}
          >
            FIND YOUR PERFECT HOME
          </Typography>

          <Typography
            variant="h6"
            sx={{
              maxWidth: 600,
              textShadow: "1px 1px 6px rgba(0,0,0,0.5)",
              mb: 4,
            }}
          >
           We provide tailored real estate solutions, guiding you through every step with personalized experiences that meet your unique needs !!</Typography>

          {/* Explore Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleExplore}
            sx={{
              px: 4,
              py: 1,
              borderRadius: "30px",
              fontWeight: "bold",
              textTransform: "none",
              boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
              backgroundColor: "#8b0f0fff", // ← CHANGE THIS to match your header color
              "&:hover": {
                backgroundColor: "#890404ff", // darker shade for hover
              },
            }}
          >
            Explore
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;