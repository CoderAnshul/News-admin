import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface Admin {
  _id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  type: string;
  isSuper_Admin: boolean;
}

export interface Tokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginResponse {
  admin: Admin;
  tokens: Tokens;
}

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

// Login thunk
export const login = createAsyncThunk<
  LoginResponse,
  LoginPayload,
  { rejectValue: string }
>("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/admin/login`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    const { data } = response.data; // data = { admin, tokens }

    if (data) {
      // Store admin normally
      localStorage.setItem("admin", JSON.stringify(data.admin));

      // Store accessToken & refreshToken separately
      localStorage.setItem("accessToken", data.tokens.accessToken);
      if (data.tokens.refreshToken) {
        localStorage.setItem("refreshToken", data.tokens.refreshToken);
      }
    }

    return data; // { admin, tokens }
  } catch (error: any) {
    if (error.response?.data?.message) return rejectWithValue(error.response.data.message);
    return rejectWithValue(error.message || "Login failed");
  }
});

// Slice initial state
interface AuthState {
  user: Admin | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("admin");
      localStorage.removeItem("tokens");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.admin;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken || null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
