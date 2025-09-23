import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authService";
import categoryReducer from "./category";
import locationReducer from "./locations";

const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer, // add this line
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
