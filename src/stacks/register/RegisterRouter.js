import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import RegisterIndex from './screens/RegisterIndex'

const Stack = createStackNavigator()
function HomeRouter() {
  return (
    <Stack.Navigator
      initialRouteName="RegisterIndex"
    >
      <Stack.Screen
        name="RegisterIndex"
        component={RegisterIndex}
        options={{
          title: 'Register Face'
        }}
      />
    </Stack.Navigator>
  )
}

export default HomeRouter
