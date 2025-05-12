import { configureStore } from '@reduxjs/toolkit';
import productReducer from '../features/productSlice.jsx';
import cartReducer from '../features/cartSlice.jsx';

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
  },
});