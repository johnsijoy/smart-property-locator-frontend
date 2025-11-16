// src/components/Common/Navbar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const Navbar = () => {
  const { isAuthenticated, user, handleLogout, isAdmin } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);
  const open = Boolean(anchorEl);
  const openProfile = Boolean(profileAnchor);

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleProfileMenu = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  return (
    <AppBar position="static" sx={{ backgroundColor: "#800000" }}>
      <Toolbar>
        {/* Logo / Brand Name */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Property Locator
          </Link>
        </Typography>

        {/* -------- DESKTOP MENU -------- */}
        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/properties">
            Properties
          </Button>

          {isAuthenticated && !isAdmin && (
            <Button color="inherit" component={Link} to="/favourites">
              Favourites
            </Button>
          )}

          {!isAdmin && (
            <Button color="inherit" component={Link} to="/contact">
              Contact Us
            </Button>
          )}

          {/* Unauthenticated users */}
          {!isAuthenticated ? (
            <>
              <IconButton color="inherit" onClick={handleProfileMenu} sx={{ ml: 1 }}>
                <AccountCircleIcon />
              </IconButton>
              <Menu
                anchorEl={profileAnchor}
                open={openProfile}
                onClose={handleProfileClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleProfileClose} component={Link} to="/admin-login">
                  Admin
                </MenuItem>
                <MenuItem onClick={handleProfileClose} component={Link} to="/login">
                  Buyer
                </MenuItem>
              </Menu>
              <Button
                color="inherit"
                component={Link}
                to="/login"
                sx={{ ml: 1, textTransform: "none" }}
              >
                Login / Register
              </Button>
            </>
          ) : isAdmin ? (
            <>
              <Button color="inherit" component={Link} to="/queries">
                Query
              </Button>
              <Button color="inherit" component={Link} to="/post-property">
                Post Properties
              </Button>
              <Typography variant="body1" sx={{ mx: 2 }}>
                Welcome, Admin
              </Typography>
              <Button color="inherit" onClick={handleLogout} variant="outlined">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ mx: 2 }}>
                Welcome, {user?.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout} variant="outlined">
                Logout
              </Button>
            </>
          )}
        </Box>

        {/* -------- MOBILE MENU -------- */}
        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          {isAuthenticated && (
            <Typography variant="body1" sx={{ mr: 2 }}>
              Welcome, {isAdmin ? "Admin" : user?.username}
            </Typography>
          )}

          <IconButton size="large" color="inherit" onClick={handleMenu}>
            <MenuIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            {/* Common Links */}
            <MenuItem onClick={handleClose} component={Link} to="/">
              Home
            </MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/properties">
              Properties
            </MenuItem>

            {/* Visitor menu */}
            {!isAuthenticated && [
              <MenuItem key="contact" onClick={handleClose} component={Link} to="/contact">
                Contact Us
              </MenuItem>,
              <MenuItem key="login" onClick={handleClose} component={Link} to="/login">
                Login
              </MenuItem>,
              <MenuItem key="register" onClick={handleClose} component={Link} to="/register">
                Register
              </MenuItem>,
            ]}

            {/* Normal user menu */}
            {isAuthenticated && !isAdmin && [
              <MenuItem key="favourites" onClick={handleClose} component={Link} to="/favourites">
                Favourites
              </MenuItem>,
              <MenuItem key="contact" onClick={handleClose} component={Link} to="/contact">
                Contact Us
              </MenuItem>,
              <MenuItem
                key="logout"
                onClick={() => {
                  handleClose();
                  handleLogout();
                }}
              >
                Logout
              </MenuItem>,
            ]}

            {/* Admin menu */}
            {isAuthenticated && isAdmin && [
              <MenuItem key="queries" onClick={handleClose} component={Link} to="/queries">
                Query
              </MenuItem>,
              <MenuItem key="post-property" onClick={handleClose} component={Link} to="/post-property">
                Post Properties
              </MenuItem>,
              <MenuItem
                key="logout"
                onClick={() => {
                  handleClose();
                  handleLogout();
                }}
              >
                Logout
              </MenuItem>,
            ]}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
