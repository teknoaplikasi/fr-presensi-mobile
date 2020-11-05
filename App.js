

import React from 'react';
import {
  Appearance,
  StatusBar,
  View,
} from 'react-native';
import AppNavigation from './src/navigation/AppNavigation'
import AuthNavigation from './src/navigation/AuthNavigation'
import Theme from './src/utils/Theme';
import { PersistGate } from 'redux-persist/integration/react'
import { Provider } from 'react-redux';
import { Store, Persistor } from './Store';
import NavigationController from './src/navigation/NavigationController';
// import PushNotification from 'react-native-push-notification'
// import NotifService from './NotifService'

// const App = () => {
class App extends React.Component {
  constructor() {
    super();

    // this.notif = new NotifService(
    //   this.onRegister.bind(this),
    //   this.onNotif.bind(this)
    // )
  }
  onRegister(token) {
    this.setState({ registerToken: token.token, fcmRegistered: true });
  }

  onNotif(notif) {
    Alert.alert(notif.title, notif.message);
  }

  handlePerm(perms) {
    Alert.alert('Permissions', JSON.stringify(perms));
  }
  render() {
    return (
      <Provider store={Store}>
        <PersistGate loading={null} persistor={Persistor}>
          <StatusBar barStyle='dark-content' backgroundColor='#ffac1f' />
          {/* <View> */}
          <NavigationController />
          {/* </View> */}
        </PersistGate>
      </Provider>
    );

  }


};


export default App;
