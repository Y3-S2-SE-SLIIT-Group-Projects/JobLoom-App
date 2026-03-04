import { configureStore } from '@reduxjs/toolkit';
import reviewReducer from './slices/reviewSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    reviews: reviewReducer,
    user: userReducer,
  },
});

export default store;
