import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

// ------------------ Types ------------------
export interface Advertisement {
  _id: string;
  title: string;
  slug?: string;
  tags?: string[];
  description?: string;
  destinationLink?: string;
  placementLocation?: string;
  cities?: string[];
  amountPaid?: number;
  viewsAllowed?: number;
  status?: "active" | "inactive";
  media?: string;
  createdAt?: string;
  updatedAt?: string;
  // 🔽 Category reference
  category?: string; // MongoDB ObjectId as string, reference to Category
}

interface AdvertisementState {
  ads: Advertisement[];
  currentAd: Advertisement | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdvertisementState = {
  ads: [],
  currentAd: null,
  loading: false,
  error: null,
};

// ------------------ Helpers ------------------
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ------------------ Thunks ------------------

// Fetch all advertisements
export const fetchAdvertisements = createAsyncThunk<
  Advertisement[],
  void,
  { rejectValue: string }
>("advertisement/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/advertisement`, {
      headers: getAuthHeader(),
    });
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Create advertisement (with media upload)
export const createAdvertisement = createAsyncThunk<
  Advertisement,
  FormData,
  { rejectValue: string }
>("advertisement/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE_URL}/advertisement`,
      formData,
      {
        headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Update advertisement (with media upload)
export const updateAdvertisement = createAsyncThunk<
  Advertisement,
  { id: string; formData: FormData },
  { rejectValue: string }
>("advertisement/update", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      `${API_BASE_URL}/advertisement/${id}`,
      formData,
      {
        headers: { ...getAuthHeader(), "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Delete advertisement
export const deleteAdvertisement = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("advertisement/delete", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/advertisement/${id}`, {
      headers: getAuthHeader(),
    });
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Fetch single advertisement by ID
export const fetchAdvertisementById = createAsyncThunk<
  Advertisement,
  string,
  { rejectValue: string }
>("advertisement/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE_URL}/advertisement/${id}`,
      { headers: getAuthHeader() }
    );
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// ------------------ Slice ------------------
const advertisementSlice = createSlice({
  name: "advertisement",
  initialState,
  reducers: {
    clearAdError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAdvertisements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisements.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload;
      })
      .addCase(fetchAdvertisements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch advertisements";
      })

      // create
      .addCase(createAdvertisement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdvertisement.fulfilled, (state, action) => {
        state.loading = false;
        state.ads.push(action.payload);
      })
      .addCase(createAdvertisement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create advertisement";
      })

      // update
      .addCase(updateAdvertisement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdvertisement.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = state.ads.map((ad) =>
          ad._id === action.payload._id ? action.payload : ad
        );
      })
      .addCase(updateAdvertisement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update advertisement";
      })

      // delete
      .addCase(deleteAdvertisement.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdvertisement.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = state.ads.filter((ad) => ad._id !== action.payload);
      })
      .addCase(deleteAdvertisement.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete advertisement";
      })

      // fetch single by id
      .addCase(fetchAdvertisementById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdvertisementById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAd = action.payload;
      })
      .addCase(fetchAdvertisementById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch advertisement";
      });
  },
});

export const { clearAdError } = advertisementSlice.actions;
export default advertisementSlice.reducer;
