import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';
import { API_URL } from '../../config/env';
import { ENDPOINTS } from '../../config/endpoints';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  photoURL?: string;
  address?: any[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false, // Start as false to allow interaction
  error: null,
};

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Mock OPT login
export const loginWithMobile = createAsyncThunk(
  'auth/loginWithMobile',
  async (credentials: { mobile: string; otp: string }, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (credentials.otp === '1234') {
        return { id: '2', phone: credentials.mobile, name: 'Mobile User' };
      }
      return rejectWithValue('Invalid OTP');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return { id: '3', email: 'google.user@gmail.com', name: 'Google User', photoURL: 'https://via.placeholder.com/150' };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (data: { email: string; name: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.REGISTER, data);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// New thunk to sync profile using the dedicated profile endpoint
export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${ENDPOINTS.AUTH.PROFILE}?populate=address`);
      return response.data.data; // Use .data.data due to backend WrapResponseInterceptor
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    skipLogin: (state) => {
      // Guest mode
      state.user = { id: 'guest', name: 'Guest' };
      state.isAuthenticated = true;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Email Login
    builder
      .addCase(loginWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        const { token, ...user } = action.payload;
        state.user = user;
        state.token = token;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Mobile Login
    builder
      .addCase(loginWithMobile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithMobile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginWithMobile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Google Login
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
      
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        const { token, ...user } = action.payload;
        state.user = user;
        state.token = token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Profile Sync
    builder
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        // Merge fetched data with existing user data
        state.user = { 
          ...state.user, 
          ...action.payload,
          id: action.payload.id?.toString() || state.user?.id 
        };
      });
  },
});

export const { logout, clearError, skipLogin } = authSlice.actions;
export default authSlice.reducer;
