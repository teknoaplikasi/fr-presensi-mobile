import React from 'react'
import { View, Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { NavigationContainer } from '@react-navigation/native'
import HomeRouter from '../stacks/home/HomeRouter'
import RegisterRouter from '../stacks/register/RegisterRouter'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Login from '../stacks/auth/screens/Login'
import RegisterCode from '../stacks/register/screens/RegisterCode'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import RegisterSuccess from '../stacks/register/screens/RegisterSuccess'
import RegisterIndex from '../stacks/register/screens/RegisterIndex'
import RegisterFace from '../stacks/register/screens/RegisterFace'
import SearchKota from '../stacks/auth/screens/SearchKota'

const Stack = createStackNavigator()

function AuthNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ tabBarVisible: false }}
      >
        <Stack.Screen
          name="Login"
          component={Login}
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="RegisterCode"
          component={RegisterCode}
          options={{
            headerShown: false
          }}
        />
        <Stack.Screen
          name="AuthSearchCity"
          component={SearchKota}
          options={{
            title: 'Cari Kota',
            // headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS
          }}
        />

        <Stack.Screen
          name="RegisterSuccess"
          component={RegisterSuccess}
          options={{
            headerShown: false
          }}
        />

        <Stack.Screen
          name="RegisterFace"
          component={RegisterFace}
          options={{
            headerShown: false
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AuthNavigation
