import React from 'react'
import { View, Text } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { NavigationContainer } from '@react-navigation/native'
import HomeRouter from '../stacks/home/HomeRouter'
import RegisterRouter from '../stacks/register/RegisterRouter'
import Icon from 'react-native-vector-icons/FontAwesome5'

const Tab = createBottomTabNavigator()

function AppNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
      >
        <Tab.Screen
          name="Home"
          component={HomeRouter}
          options={{
            tabBarLabel: 'Face Recognition',
            tabBarIcon: () => (
              <Icon name="smile-beam" color='grey' size={fs(4)} />
            )
          }}
        />

        <Tab.Screen
          name="Register"
          component={RegisterRouter}
          options={{
            tabBarIcon: () => (
              <Icon name="home" color="grey" size={fs(4)} />
            )
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigation
