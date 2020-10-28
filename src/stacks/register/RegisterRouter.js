import React from 'react'
import { View, Text } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import RegisterIndex from './screens/RegisterIndex'
import RegisterFace from './screens/RegisterFace'
import { useFocusEffect } from '@react-navigation/native'
import RegisterFaceCamera from './screens/RegisterFaceCamera'
import HomePresensiHistory from '../home/screens/HomePresensiHistory'
import HomeFacePresensiCamera from '../home/screens/HomeFacePresensiCamera'

const Stack = createStackNavigator()
function HomeRouter(props) {

  useFocusEffect(
    React.useCallback(() => {
      // console.log('Home ROuter Props', props)
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
      initialRouteName="RegisterPresensiHistory"
    >
      {/* <Stack.Screen
        name="RegisterIndex"
        component={RegisterIndex}
        options={{
          title: 'Register',
          headerShown: false
        }}
      /> */}


      <Stack.Screen
        name="RegisterFace"
        component={RegisterFace}
        options={{
          title: 'Register Face',
          headerShown: false
        }}
      />

      <Stack.Screen
        name="RegisterPresensiHistory"
        component={HomePresensiHistory}
        options={{
          title: 'Presensi Bulan Ini'
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
        name="RegisterFaceCamera"
        component={RegisterFaceCamera}
        options={{
          headerShown: false
        }}
      />
    </Stack.Navigator>
  )
}

export default HomeRouter
