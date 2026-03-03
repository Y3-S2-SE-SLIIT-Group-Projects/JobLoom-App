import { configureStore } from '@reduxjs/toolkit';
import reviewReducer from './slices/reviewSlice';
import jobReducer from './slices/jobSlice';

const store = configureStore({
  reducer: {
    reviews: reviewReducer,
    jobs: jobReducer,
  },
});

export default store;
