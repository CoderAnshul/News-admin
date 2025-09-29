import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authService";
import categoryReducer from "./category";
import locationReducer from "./locations";
import articleReducer from "./articles"; // <-- add this line
import shortReducer from "./shortSlice"; // <-- add this line
import epaperReducer from "./epaper";  // <-- add this line
import advertisementReducer from "./advertisement"; // <-- add this line
import stateReducer from "./State"; // <-- add this line
import cityReducer from "./citySlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    location: locationReducer,
    article: articleReducer, // <-- add this line
    shorts: shortReducer,    // <-- add this line
    epaper: epaperReducer,  // <-- add this line
    advertisement : advertisementReducer, // <-- add this line
    state: stateReducer, // <-- add this line
    city: cityReducer, // <-- add this line
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
