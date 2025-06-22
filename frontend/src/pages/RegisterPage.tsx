import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, TextField, Box, Paper, Alert, Link } from '@mui/material';
import * as api from '../services/api';
import axios from 'axios';
import MotionButton from '../components/MotionButton';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.register({ email, password });
      setSuccess("Registration successful! You can now log in.");
      // Optional: Redirect to login page after a delay
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      let message = 'An unknown error occurred.';
      if (axios.isAxiosError(err) && err.response) {
        message = err.response.data?.detail || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(`Registration Failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ width: '100%', mt: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          <MotionButton
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </MotionButton>
          <Typography variant="body2" align="center">
            Already have an account? <Link component={RouterLink} to="/login">Sign In</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage; 