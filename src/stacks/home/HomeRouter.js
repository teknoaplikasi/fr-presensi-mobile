import { createStackNavigator } from '@react-navigation/stack'
import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import HomeIndex from './screens/HomeIndex'

const Stack = createStackNavigator()
function HomeRouter() {
  return (
    <Stack.Navigator
      initialRouteName="HomeIndex"
    >
      <Stack.Screen
        name="HomeIndex"
        component={HomeIndex}
        options={{
          title: 'Home Face Recognition'
        }}
      />
    </Stack.Navigator>
  )
}

export default HomeRouter
