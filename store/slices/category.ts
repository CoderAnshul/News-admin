import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

export interface Category {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  status?: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryState {
  categories: Category[];
  currentCategory: Category | null;
  loading: boolean;
  error: string | null;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
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
export const fetchCategories = createAsyncThunk<
  { categories: Category[]; pagination: any },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>("category/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params as any;
    const response = await axiosInstance.get(
      `${API_BASE_URL}/category?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeader(),
      }
    );
    const data = response.data.data;
    return {
      categories: Array.isArray(data?.categories) ? data.categories : [],
      pagination: data?.pagination || { total: 0, page: 1, pages: 1, limit: 10 },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const createCategory = createAsyncThunk<
  Category,
  Partial<Category>,
  { rejectValue: string }
>("category/create", async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/category`, payload, {
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

export const updateCategory = createAsyncThunk<
  Category,
  { id: string; data: Partial<Category> },
  { rejectValue: string }
>("category/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/category/${id}`, data, {
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

export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("category/delete", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/category/${id}`, {
      headers: getAuthHeader(),
    });
    return id;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// **Slice**
const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch categories";
      })

      // create
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create category";
      })

      // update
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.map((cat) =>
          cat._id === action.payload._id ? action.payload : cat
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update category";
      })

      // delete
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete category";
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
