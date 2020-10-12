

import React from 'react';
import {
  StatusBar,
} from 'react-native';
import AppNavigation from './src/navigation/AppNavigation'


const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigation />
    </>
  );
};


export default App;
