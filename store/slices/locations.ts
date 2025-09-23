import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

// **Interfaces**
export interface Location {
  _id: string;
  name: string;
  country?: string;
  region?: string;
  description?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

interface LocationState {
  locations: Location[];
  currentLocation: Location | null;
  loading: boolean;
  error: string | null;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const initialState: LocationState = {
  locations: [],
  currentLocation: null,
  loading: false,
  error: null,
  pagination: undefined,
};

// **Auth Header Helper**
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// **Thunks**

// Fetch all locations
export const fetchLocations = createAsyncThunk<
  { locations: Location[]; pagination: any },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>("location/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params as any;
    const response = await axiosInstance.get(
      `${API_BASE_URL}/locations?page=${page}&limit=${limit}`,
      { headers: getAuthHeader() }
    );
    const data = response.data.data;
    return {
      locations: Array.isArray(data?.locations) ? data.locations : [],
      pagination: data?.pagination || { total: 0, page: 1, pages: 1, limit: 10 },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Create new location
export const createLocation = createAsyncThunk<
  Location,
  Partial<Location>,
  { rejectValue: string }
>("location/create", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/locations`, payload, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Update existing location
export const updateLocation = createAsyncThunk<
  Location,
  { id: string; data: Partial<Location> },
  { rejectValue: string }
>("location/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/locations/${id}`, data, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    });
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Delete location
export const deleteLocation = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("location/delete", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/locations/${id}`, {
      headers: getAuthHeader(),
    });
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// **Slice**
const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearLocationError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload.locations;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch locations";
      })

      // create
      .addCase(createLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations.push(action.payload);
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create location";
      })

      // update
      .addCase(updateLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = state.locations.map((loc) =>
          loc._id === action.payload._id ? action.payload : loc
        );
      })
      .addCase(updateLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update location";
      })

      // delete
      .addCase(deleteLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = state.locations.filter((loc) => loc._id !== action.payload);
      })
      .addCase(deleteLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete location";
      });
  },
});

export const { clearLocationError } = locationSlice.actions;
export default locationSlice.reducer;
