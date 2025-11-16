import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

// 🛑 STEP 1: DEFINE YOUR IMAGE ARRAY 🛑
// Put the actual images (e.g., 'luxury_home1.jpg', 'luxury_home2.jpg') 
// into your 'public' folder and update these paths.
const HERO_IMAGES = [
    '/image.png', // Replace with your image paths
    '/11.jpeg', // Replace with your image paths
    '/luxury_home_3.jpeg', // Replace with your image paths
    '/luxury_home_4.jpeg', // Replace with your image paths
];

const RotatingHero = () => {
    // 2. Select a random image URL when the component mounts
    const [backgroundImage, setBackgroundImage] = useState('');

    useEffect(() => {
        // Generate a random index based on the length of the image array
        const randomIndex = Math.floor(Math.random() * HERO_IMAGES.length);
        setBackgroundImage(HERO_IMAGES[randomIndex]);
    }, []); 
    // The empty dependency array ensures this runs only once when the page loads

    return (
        <Box
            sx={{
                // 3. Styling for the large banner area
                height: { xs: 400, md: 600 }, // Adjust height as needed
                width: '100%',
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                textAlign: 'center',
                // Optional: Add a subtle overlay for text visibility if you put text back later
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Dark overlay
                }
            }}
        >
            {/* 🛑 NO WORDS HERE 🛑 
                The content here is empty, making it a clean visual banner.
                If you ever want text, add it here, e.g.:
                <Typography variant="h2" sx={{ zIndex: 1 }}>Explore Luxury</Typography>
            */}
        </Box>
    );
};

export default RotatingHero;