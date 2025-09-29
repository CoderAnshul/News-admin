import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

// City Interface
export interface City {
  _id: string;
  name: string;
  state: string; // stateId reference
  country: string;
  description?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

interface CityState {
  cities: City[];
  currentCity: City | null;
  loading: boolean;
  error: string | null;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const initialState: CityState = {
  cities: [],
  currentCity: null,
  loading: false,
  error: null,
  pagination: undefined,
};

// Get access token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// **Thunks**
export const fetchCities = createAsyncThunk<
  { cities: City[]; pagination: any },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>("city/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params as any;
    const response = await axiosInstance.get(
      `${API_BASE_URL}/cities?page=${page}&limit=${limit}`,
      { headers: getAuthHeader() }
    );
    const data = response.data.data;
    return {
      cities: Array.isArray(data?.cities) ? data.cities : [],
      pagination: data?.pagination || { total: 0, page: 1, pages: 1, limit: 10 },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createCity = createAsyncThunk<
  City,
  Partial<City>,
  { rejectValue: string }
>("city/create", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/cities`, payload, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const updateCity = createAsyncThunk<
  City,
  { id: string; data: Partial<City> },
  { rejectValue: string }
>("city/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/cities/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteCity = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("city/delete", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/cities/${id}`, {
      headers: getAuthHeader(),
    });
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// **Slice**
const citySlice = createSlice({
  name: "city",
  initialState,
  reducers: {
    clearCityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchCities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload.cities;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch cities";
      })

      // create
      .addCase(createCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCity.fulfilled, (state, action) => {
        state.loading = false;
        state.cities.push(action.payload);
      })
      .addCase(createCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create city";
      })

      // update
      .addCase(updateCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCity.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = state.cities.map((c) =>
          c._id === action.payload._id ? action.payload : c
        );
      })
      .addCase(updateCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update city";
      })

      // delete
      .addCase(deleteCity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCity.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = state.cities.filter((c) => c._id !== action.payload);
      })
      .addCase(deleteCity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete city";
      });
  },
});

export const { clearCityError } = citySlice.actions;
export default citySlice.reducer;
