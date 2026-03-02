import { configureStore } from '@reduxjs/toolkit';
import reviewReducer from './slices/reviewSlice';

const store = configureStore({
  reducer: {
    reviews: reviewReducer,
  },
});

export default store;
