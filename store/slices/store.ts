import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authService";
import categoryReducer from "./category";
import locationReducer from "./locations";
import articleReducer from "./articles"; // <-- add this line
import shortReducer from "./shortSlice"; // <-- add this line

const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    location: locationReducer,
    article: articleReducer, // <-- add this line
    shorts: shortReducer,    // <-- add this line
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
