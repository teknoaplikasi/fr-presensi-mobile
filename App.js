

import React from 'react';
import {
  Appearance,
  StatusBar,
} from 'react-native';
import AppNavigation from './src/navigation/AppNavigation'
import AuthNavigation from './src/navigation/AuthNavigation'
import NavigationBar from 'react-native-navbar-color'
import Theme from './src/utils/Theme';
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux';
import { Store, Persistor } from './Store';
import NavigationController from './src/navigation/NavigationController';

const App = () => {
  const mode = Appearance.getColorScheme()
  NavigationBar.setColor(mode == 'dark' ? 'black' : 'white')
  return (
    <Provider store={Store}>
      <PersistGate loading={null} persistor={Persistor}>
        <StatusBar barStyle={mode == 'dark' ? 'light-content' : 'dark-content'} backgroundColor={mode == 'dark' ? '#000000' : '#ffac1f'} />
        <NavigationController />
      </PersistGate>
    </Provider>
  );
};


export default App;
