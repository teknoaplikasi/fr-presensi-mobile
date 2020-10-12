import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import HomeRouter from '../stacks/home/HomeRouter'

const Stack = createStackNavigator()

function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
      >
        <Stack.Screen
          name="Home"
          component={HomeRouter}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigation
