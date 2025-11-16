import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";

const LoginPage = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRole, setSelectedRole] = useState("Buyer"); // Default role
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    handleMenuClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const success = await handleLogin(username.trim(), password, selectedRole);
      setLoading(false);

      if (success) {
        if (selectedRole.toLowerCase() === "buyer") {
          navigate("/properties", { replace: true });
        } else if (selectedRole.toLowerCase() === "admin") {
          navigate("/", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      } else {
        setError("Invalid username or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 4,
          boxShadow: 3,
          borderRadius: 2,
          bgcolor: "background.paper",
          position: "relative",
        }}
      >
        {/* 🔙 Back Arrow */}
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ position: "absolute", top: 8, left: 8, color: "black" }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* ❌ Close Icon */}
        <IconButton
          onClick={() => navigate("/")}
          sx={{ position: "absolute", top: 8, right: 8, color: "black" }}
        >
          <CloseIcon />
        </IconButton>

        {/* ⋮ Role Dropdown */}
        <IconButton
          onClick={handleMenuOpen}
          sx={{ position: "absolute", top: 8, right: 48, color: "black" }}
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={() => handleRoleSelect("Admin")}>Admin</MenuItem>
          <MenuItem onClick={() => handleRoleSelect("Buyer")}>Buyer</MenuItem>
        </Menu>

        {/* Title */}
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", color: "black" }}
        >
          {selectedRole} Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Link component={RouterLink} to="/register" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
