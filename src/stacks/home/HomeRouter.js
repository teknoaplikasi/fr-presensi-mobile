import React from 'react'
import { View, Text } from 'react-native'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import HomeIndex from './screens/HomeIndex'
import HomeFaceRecognition from './screens/HomeFaceRecognition'
import { useFocusEffect } from '@react-navigation/native'
import HomePresensiHistory from './screens/HomePresensiHistory'
import HomeFacePresensiCamera from './screens/HomeFacePresensiCamera'
import RegisterFaceCamera from '../register/screens/RegisterFaceCamera'
import HomeProfile from '../home/screens/HomeProfile'

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
          headerShown: false,

          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS
        }}
      />
      <Stack.Screen
        name="HomeProfile"
        component={HomeProfile}
        options={{
          title: 'Edit Profil',
          headerShown: true,

          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS
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
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forRevealFromBottomAndroid
        }}
      />

      <Stack.Screen
        name="HomePresensiHistory"
        component={HomePresensiHistory}
        options={{
          headerShown: true,
          title: 'Presensi Bulan Ini',
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS

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
