import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authService";
import categoryReducer from "./category";

const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer, // add this line
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
