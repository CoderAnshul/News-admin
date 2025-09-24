import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

// --------------------
// Types
// --------------------
export interface RelatedLink {
  url: string;
}

export interface Short {
  _id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  relatedLinks?: RelatedLink[];
  createdAt?: string;
  updatedAt?: string;
}

interface ShortState {
  shorts: Short[];
  currentShort: Short | null;
  loading: boolean;
  error: string | null;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// --------------------
// Initial State
// --------------------
const initialState: ShortState = {
  shorts: [],
  currentShort: null,
  loading: false,
  error: null,
  pagination: undefined,
};

// --------------------
// Auth Header Helper
// --------------------
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --------------------
// Thunks
// --------------------

// Fetch all shorts with pagination
export const fetchShorts = createAsyncThunk<
  { shorts: Short[]; pagination: any },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>("shorts/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params as any;
    const response = await axiosInstance.get(
      `${API_BASE_URL}/shorts?page=${page}&limit=${limit}`,
      { headers: getAuthHeader() }
    );
    const data = response.data.data;
    return {
      shorts: Array.isArray(data?.shorts) ? data.shorts : [],
      pagination: data?.pagination || { total: 0, page: 1, pages: 1, limit: 10 },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Create a new short (multipart/form-data)
export const createShort = createAsyncThunk<
  Short,
  FormData,
  { rejectValue: string }
>("shorts/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/shorts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeader(),
      },
    });
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// --------------------
// Slice
// --------------------
const shortSlice = createSlice({
  name: "shorts",
  initialState,
  reducers: {
    clearShortError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shorts
      .addCase(fetchShorts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShorts.fulfilled, (state, action) => {
        state.loading = false;
        state.shorts = action.payload.shorts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchShorts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch shorts";
      })

      // Create short
      .addCase(createShort.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShort.fulfilled, (state, action) => {
        state.loading = false;
        state.shorts.push(action.payload);
      })
      .addCase(createShort.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create short";
      });
  },
});

export const { clearShortError } = shortSlice.actions;
export default shortSlice.reducer;
