import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import { layout } from './app/reducer';
import { LayoutContainer } from './app/layout/LayoutContainer';

const store = configureStore({
  reducer: layout.reducer,
});

export default function App() {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <LayoutContainer />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
