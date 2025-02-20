import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, TextField, Box, Paper, Alert, Link } from '@mui/material';
import { useAuthStore } from '../store/authStore';
import * as api from '../services/api';
import axios from 'axios';
import MotionButton from '../components/MotionButton';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore(); // Get the setter function
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loginResponse = await api.login({ email, password });
      if (loginResponse.access_token) {
        // Fetch user details after successful login
        // We need to call getCurrentUser *after* token is set in the interceptor.
        // Zustand update is async, but the interceptor reads synchronously.
        // Setting token first should make it available for the subsequent API call.
        useAuthStore.setState({ token: loginResponse.access_token, isLoggedIn: true }); // Set token first
        
        // Fetch user data to store it fully in Zustand state
        const user = await api.getCurrentUser(); 
        setAuth(loginResponse.access_token, user); // Now set full auth state including user object
        
        navigate('/'); // Redirect to home page or dashboard
      } else {
        setError("Login failed: No token received.");
      }
    } catch (err: unknown) { // Changed to unknown
      console.error("Login error:", err);
      let message = 'An unknown error occurred.';
      if (axios.isAxiosError(err) && err.response) { // Use Axios type guard
        message = err.response.data?.detail || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(`Login Failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <MotionButton
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </MotionButton>
          {/* Add Link to Register Page */}
          <Typography variant="body2" align="center">
            Don't have an account? <Link component={RouterLink} to="/register" sx={{ ml: 0.5 }}>Sign Up</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage; 