// src/pages/Querypage.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import axios from "axios";

const Querypage = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openReply, setOpenReply] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState("");

  // ✅ Fetch queries from backend (with admin token)
  const fetchQueries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access"); // JWT from admin login
      const response = await axios.get("http://127.0.0.1:8000/api/accounts/contact/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQueries(response.data);
    } catch (err) {
      console.error("Error fetching queries:", err);
      setError("Failed to load queries. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

  // ✅ Delete query
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this query?")) return;
    try {
      const token = localStorage.getItem("access");
      await axios.delete(`http://127.0.0.1:8000/api/accounts/contact/${id}/delete/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQueries((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Error deleting query:", err);
      alert("Error deleting query.");
    }
  };

  // ✅ Open reply popup
  const handleReplyClick = (query) => {
    setSelectedQuery(query);
    setReplyText(query.reply || "");
    setOpenReply(true);
  };

  // ✅ Send reply to backend
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      alert("Please enter a reply message.");
      return;
    }

    try {
      const token = localStorage.getItem("access");
      await axios.put(
        `http://127.0.0.1:8000/api/accounts/contact/${selectedQuery.id}/reply/`,
        { reply: replyText },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Include JWT token
          },
        }
      );

      // ✅ Instantly update frontend list
      setQueries((prev) =>
        prev.map((q) =>
          q.id === selectedQuery.id
            ? { ...q, reply: replyText, replied: true }
            : q
        )
      );

      setOpenReply(false);
      setReplyText("");
      alert("Reply sent successfully and email delivered.");
    } catch (err) {
      console.error("Error sending reply:", err);
      alert("Failed to send reply. Please log in as admin again.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Box sx={{ p: 4, bgcolor: "#ffffff", borderRadius: 2, boxShadow: 3 }}>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ color: "#800000", fontWeight: "bold" }}
        >
          User Queries
        </Typography>

        {loading ? (
          <Box textAlign="center" sx={{ mt: 4 }}>
            <CircularProgress />
            <Typography>Loading queries...</Typography>
          </Box>
        ) : error ? (
          <Typography align="center" sx={{ mt: 3, color: "red" }}>
            {error}
          </Typography>
        ) : queries.length === 0 ? (
          <Typography align="center" sx={{ mt: 3, color: "#800000" }}>
            No queries found.
          </Typography>
        ) : (
          queries.map((query) => (
            <Card key={query.id} sx={{ mb: 3, boxShadow: 3 }}>
              <CardContent>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", color: "#800000" }}
                  >
                    {query.subject || "User Query"}
                  </Typography>
                  <Chip
                    label={query.replied ? "Replied" : "Pending"}
                    sx={{
                      backgroundColor: query.replied ? "#800000" : "#f5f5f5",
                      color: query.replied ? "white" : "#800000",
                      fontWeight: "bold",
                    }}
                    size="small"
                  />
                </Stack>

                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Name:</strong> {query.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {query.email}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Message:</strong> {query.message}
                </Typography>

                {query.reply && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: "#f9f9f9", borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Admin Reply:</strong> {query.reply}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Submitted on:{" "}
                  {new Date(query.created_at).toLocaleString("en-IN")}
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  {!query.replied && (
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#800000",
                        "&:hover": { backgroundColor: "#a52a2a" },
                        textTransform: "none",
                      }}
                      onClick={() => handleReplyClick(query)}
                    >
                      Reply
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(query.id)}
                    sx={{
                      borderColor: "#800000",
                      color: "#800000",
                      "&:hover": { backgroundColor: "#800000", color: "white" },
                      textTransform: "none",
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))
        )}

        {/* ✅ Reply Dialog */}
        <Dialog open={openReply} onClose={() => setOpenReply(false)}>
          <DialogTitle>Reply to {selectedQuery?.email}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="Your Reply"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenReply(false)}>Cancel</Button>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#800000",
                "&:hover": { backgroundColor: "#a52a2a" },
              }}
              onClick={handleSendReply}
            >
              Send Reply
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Querypage;