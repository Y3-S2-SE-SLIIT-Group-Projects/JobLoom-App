import { configureStore } from '@reduxjs/toolkit';
import reviewReducer from './slices/reviewSlice';
import jobReducer from './slices/jobSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    reviews: reviewReducer,
    jobs: jobReducer,
    user: userReducer,
  },
});

export default store;
