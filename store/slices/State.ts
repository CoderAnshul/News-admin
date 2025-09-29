import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

// State Interface
export interface State {
  _id: string;
  name: string;
  country: string;
  description?: string;
  status?: "active" | "inactive";
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface StateState {
  states: State[];
  currentState: State | null;
  loading: boolean;
  error: string | null;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const initialState: StateState = {
  states: [],
  currentState: null,
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
export const fetchStates = createAsyncThunk<
  { states: State[]; pagination: any },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>("state/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params as any;
    const response = await axiosInstance.get(
      `${API_BASE_URL}/states?page=${page}&limit=${limit}`,
      { headers: getAuthHeader() }
    );
    const data = response.data.data;
    return {
      states: Array.isArray(data?.states) ? data.states : [],
      pagination: data?.pagination || { total: 0, page: 1, pages: 1, limit: 10 },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createState = createAsyncThunk<
  State,
  FormData,
  { rejectValue: string }
>("state/create", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/states`, payload, {
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

export const updateState = createAsyncThunk<
  State,
  { id: string; data: FormData },
  { rejectValue: string }
>("state/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/states/${id}`, data, {
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

export const deleteState = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("state/delete", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/states/${id}`, {
      headers: getAuthHeader(),
    });
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// **Slice**
const stateSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    clearStateError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchStates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStates.fulfilled, (state, action) => {
        state.loading = false;
        state.states = action.payload.states;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchStates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch states";
      })

      // create
      .addCase(createState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createState.fulfilled, (state, action) => {
        state.loading = false;
        state.states.push(action.payload);
      })
      .addCase(createState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create state";
      })

      // update
      .addCase(updateState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateState.fulfilled, (state, action) => {
        state.loading = false;
        state.states = state.states.map((s) =>
          s._id === action.payload._id ? action.payload : s
        );
      })
      .addCase(updateState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update state";
      })

      // delete
      .addCase(deleteState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteState.fulfilled, (state, action) => {
        state.loading = false;
        state.states = state.states.filter((s) => s._id !== action.payload);
      })
      .addCase(deleteState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete state";
      });
  },
});

export const { clearStateError } = stateSlice.actions;
export default stateSlice.reducer;
