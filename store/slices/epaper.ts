import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

// ------------------ Types ------------------
export interface EPaper {
  _id: string;
  publicationName: string;
  publicationDate: string;
  city: string;
  country: string;
  language: string;
  totalPages: number;
  status: "draft" | "published";
  pages: string[]; // uploaded file URLs
  createdAt?: string;
  updatedAt?: string;
}

interface EPaperState {
  epapers: EPaper[];
  currentEPaper: EPaper | null;
  loading: boolean;
  error: string | null;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const initialState: EPaperState = {
  epapers: [],
  currentEPaper: null,
  loading: false,
  error: null,
  pagination: undefined,
};

// ------------------ Helpers ------------------
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ------------------ Thunks ------------------

// Fetch All E-Papers
export const fetchEPapers = createAsyncThunk<
  { epapers: EPaper[]; pagination: any },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>("epaper/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params as any;
    const response = await axiosInstance.get(
      `${API_BASE_URL}/epapers?page=${page}&limit=${limit}`,
      { headers: getAuthHeader() }
    );

    const data = response.data.data;
    return {
      epapers: Array.isArray(data?.epapers) ? data.epapers : [],
      pagination: data?.pagination || { total: 0, page: 1, pages: 1, limit: 10 },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Fetch Single E-Paper by ID
export const fetchEPaperById = createAsyncThunk<
  EPaper,
  string,
  { rejectValue: string }
>("epaper/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/epapers/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Create E-Paper (with file upload)
export const createEPaper = createAsyncThunk<
  EPaper,
  FormData,
  { rejectValue: string }
>("epaper/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/epapers`, formData, {
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

// Update E-Paper (PUT with file upload support)
export const updateEPaper = createAsyncThunk<
  EPaper,
  { id: string; formData: FormData },
  { rejectValue: string }
>("epaper/update", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/epapers/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...getAuthHeader(),
        },
      }
    );
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Delete E-Paper
export const deleteEPaper = createAsyncThunk<
  string, // return deleted id
  string, // pass id
  { rejectValue: string }
>("epaper/delete", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/epapers/${id}`, {
      headers: getAuthHeader(),
    });
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ------------------ Slice ------------------
const epaperSlice = createSlice({
  name: "epaper",
  initialState,
  reducers: {
    clearEPaperError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchEPapers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEPapers.fulfilled, (state, action) => {
        state.loading = false;
        state.epapers = action.payload.epapers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEPapers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch epapers";
      })

      // fetch by id
      .addCase(fetchEPaperById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEPaperById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEPaper = action.payload;
      })
      .addCase(fetchEPaperById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch epaper";
      })

      // create
      .addCase(createEPaper.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEPaper.fulfilled, (state, action) => {
        state.loading = false;
        state.epapers.push(action.payload);
      })
      .addCase(createEPaper.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create epaper";
      })

      // update
      .addCase(updateEPaper.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEPaper.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.epapers.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.epapers[index] = action.payload;
        }
        if (state.currentEPaper?._id === action.payload._id) {
          state.currentEPaper = action.payload;
        }
      })
      .addCase(updateEPaper.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update epaper";
      })

      // delete
      .addCase(deleteEPaper.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEPaper.fulfilled, (state, action) => {
        state.loading = false;
        state.epapers = state.epapers.filter((p) => p._id !== action.payload);
        if (state.currentEPaper?._id === action.payload) {
          state.currentEPaper = null;
        }
      })
      .addCase(deleteEPaper.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete epaper";
      });
  },
});

export const { clearEPaperError } = epaperSlice.actions;
export default epaperSlice.reducer;
