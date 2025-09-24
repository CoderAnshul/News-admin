import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axiosConfig";

const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

// **Interfaces**
export interface Article {
  _id: string;
  coloredHeading?: string;
  restHeading?: string;
  articleTitle?: string;
  author?: string;
  category?: string;
  status?: "draft" | "published";
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ArticleState {
  articles: Article[];
  currentArticle: Article | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

const initialState: ArticleState = {
  articles: [],
  currentArticle: null,
  loading: false,
  error: null,
  pagination: { total: 0, page: 1, pages: 1, limit: 10 },
};

// **Auth Header Helper**
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/* ========================================================
   Thunks
======================================================== */

// Fetch all articles
export const fetchArticles = createAsyncThunk<
  { articles: Article[]; pagination: any },
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>("article/fetchAll", async (params = {}, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10 } = params as any;
    const response = await axiosInstance.get(
      `${API_BASE_URL}/articles?page=${page}&limit=${limit}`,
      { headers: getAuthHeader() }
    );

    const data = response.data.data;

    return {
      articles: Array.isArray(data?.articles)
        ? data.articles.map((a: any) => ({
            ...a,
            status: a.status || "draft",
          }))
        : [],
      pagination: data?.pagination || { total: 0, page: 1, pages: 1, limit: 10 },
    };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Create new article
export const createArticle = createAsyncThunk<
  Article,
  FormData,
  { rejectValue: string }
>("article/create", async (formData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE_URL}/articles`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data as Article;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Update article
export const updateArticle = createAsyncThunk<
  Article,
  { id: string; formData: FormData },
  { rejectValue: string }
>("article/update", async ({ id, formData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(`${API_BASE_URL}/articles/${id}`, formData, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data as Article;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Delete article
export const deleteArticle = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("article/delete", async (id, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`${API_BASE_URL}/articles/${id}`, {
      headers: getAuthHeader(),
    });
    return id; // return deleted id so we can remove from state
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

/* ========================================================
   Slice
======================================================== */
const articleSlice = createSlice({
  name: "article",
  initialState,
  reducers: {
    clearArticleError: (state) => {
      state.error = null;
    },
    setCurrentArticle: (state, action) => {
      state.currentArticle = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload.articles;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch articles";
      })

      // Create
      .addCase(createArticle.fulfilled, (state, action) => {
        state.articles.unshift(action.payload);
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.error = action.payload || "Failed to create article";
      })

      // Update
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.articles = state.articles.map((a) =>
          a._id === action.payload._id ? action.payload : a
        );
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.error = action.payload || "Failed to update article";
      })

      // Delete
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.articles = state.articles.filter((a) => a._id !== action.payload);
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete article";
      });
  },
});

export const { clearArticleError, setCurrentArticle } = articleSlice.actions;
export default articleSlice.reducer;
