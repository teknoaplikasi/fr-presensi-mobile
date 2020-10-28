import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import HomeIndex from './screens/HomeIndex'
import HomeFaceRecognition from './screens/HomeFaceRecognition'
import { useFocusEffect } from '@react-navigation/native'
import HomePresensiHistory from './screens/HomePresensiHistory'
import HomeFacePresensiCamera from './screens/HomeFacePresensiCamera'
import RegisterFaceCamera from '../register/screens/RegisterFaceCamera'

const Stack = createStackNavigator()
function HomeRouter(props) {
  useFocusEffect(
    React.useCallback(() => {

      if (props.route && 'state' in props.route) {
        // console.log(props.route)
        if (props.route.state.index > 0) {
          props.navigation.setOptions({
            tabBarVisible: false
          })
        }

        if (props.route.state.index == 0) {
          props.navigation.setOptions({
            tabBarVisible: true
          })
        }
      }
    })
  )
  return (
    <Stack.Navigator
      initialRouteName="HomeIndex"
    >
      <Stack.Screen
        name="HomeIndex"
        component={HomeIndex}
        options={{
          title: 'Face Recognition',
          headerShown: false
        }}
      />

      <Stack.Screen
        name="HomeFaceRecognition"
        component={HomeFaceRecognition}
        options={{
          headerShown: false
        }}
      />

      <Stack.Screen
        name="HomeFacePresensiCamera"
        component={HomeFacePresensiCamera}
        options={{
          headerShown: false
        }}
      />

      <Stack.Screen
        name="HomePresensiHistory"
        component={HomePresensiHistory}
        options={{
          headerShown: true,
          title: 'Riwayat Presensi Bulan Ini'
        }}
      />
      <Stack.Screen
        name="HomeRegisterFaceCamera"
        component={RegisterFaceCamera}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  )
}

export default HomeRouter
