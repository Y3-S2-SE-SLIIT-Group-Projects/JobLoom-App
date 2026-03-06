import { configureStore } from '@reduxjs/toolkit';
import applicationReducer from './slices/applicationSlice';
import reviewReducer from './slices/reviewSlice';
import jobReducer from './slices/jobSlice';
import userReducer from './slices/userSlice';

const store = configureStore({
  reducer: {
    applications: applicationReducer,
    reviews: reviewReducer,
    jobs: jobReducer,
    user: userReducer,
  },
});

export default store;
