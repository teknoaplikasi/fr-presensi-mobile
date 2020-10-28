import React from 'react'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import { useFocusEffect } from '@react-navigation/native'
import Login from './screens/Login'
import { RegisterCode } from '../register/screens/RegisterCode'
import SearchKota from './screens/SearchKota'

const Stack = createStackNavigator()

function AuthRouter() {
  return (
    <Stack.Navigator
      initialRouteName="AuthRegisterCode"
    >
      <Stack.Screen
        name="AuthLogin"
        component={Login}
        options={{
          headerShown: false
        }}
      />
      <Stack.Screen
        name="AuthSearchCity"
        component={SearchKota}
        options={{
          // headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS
        }}
      />
    </Stack.Navigator>
  )
}

export default AuthRouter