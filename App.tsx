import React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { layout } from './app/reducer';
import { Layout } from './app/layout/Layout';

const store = configureStore({
  reducer: layout.reducer,
});

export default function App() {
  return (
    <Provider store={store}>
      <Layout />
    </Provider>
  );
}
