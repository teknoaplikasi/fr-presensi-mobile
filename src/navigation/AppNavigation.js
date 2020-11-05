import React from 'react'
import { View, Text, TouchableOpacity, Appearance, Image } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import HomeRouter from '../stacks/home/HomeRouter'
import RegisterRouter from '../stacks/register/RegisterRouter'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { responsiveWidth as w, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
// import { TouchableOpacity } from 'react-native-gesture-handler'
import Theme from '../utils/Theme'
import { connect } from 'react-redux'
import moment from 'moment'

const qrIcon = require('../../assets/images/qr-icon.png')
const logoutIcon = require('../../assets/images/logout-icon.png')

const Tab = createBottomTabNavigator()
// const mode = Appearance.getColorScheme()
const scheme = Theme['light']


function MyTabBar({ state, descriptors, navigation, auth, presentLogoutAlert, presensi }) {
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: scheme.primaryBg,
      shadowColor: "#000",
      alignSelf: 'center',
      position: 'absolute',
      maxWidth: w(75),
      bottom: fs(2),
      borderRadius: fs(10),
      borderWidth: 1.5,
      borderColor: 'rgba(172,172,172,.2)',
      // transform: [
      //   { translateY: fs(-2) }
      // ],
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.32,
      shadowRadius: 5.46,

      elevation: 9,
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;
        // alert(label)
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        if (label == 'TouchableTab') {

          let isPresensiIn = false
          const lastPresensi = presensi.last_presensi
          console.log('last presensi', lastPresensi)
          const dateNow = moment().format('YYYY-MM-DD')
          if (!lastPresensi || !lastPresensi.tanggal) {
            isPresensiIn = true
          }

          else if (lastPresensi.tanggal == dateNow && lastPresensi.flag == 'I') {
            console.log('masuk')
            isPresensiIn = false
          }

          else if (lastPresensi.tanggal == dateNow && lastPresensi.flag == 'O') {
            isPresensiIn = true
          }

          else if (lastPresensi.tanggal != dateNow) {
            isPresensiIn = true
          }

          else {
            isPresensiIn = false
          }

          console.log('ispresensi in', isPresensiIn)
          return (
            <TouchableOpacity
              style={{
                width: w(13),
                height: w(13),
                backgroundColor: '#8335f4',
                position: 'relative',
                marginTop: fs(1),
                borderRadius: w(6.5),
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={async () => {
                if (isPresensiIn) {
                  navigation.navigate('HomeFacePresensiCamera', {
                    flag: isPresensiIn ? 'I' : 'O'
                  })
                }

                else {
                  return presentLogoutAlert()
                }
              }}
            >
              <Image source={isPresensiIn ? qrIcon : logoutIcon} />
            </TouchableOpacity>
          )
        }

        return (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              paddingVertical: fs(3),
              justifyContent: 'center',
              // paddingHorizontal: fs(4)
            }}
          >
            <Text style={{ color: isFocused ? '#673ab7' : '#222', fontWeight: isFocused ? 'bold' : 'normal', fontSize: fs(1.6), alignSelf: 'center' }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function AppNavigation({ auth, presentLogoutAlert, presensi }) {
  return (
    <NavigationContainer>

      <Tab.Navigator screenOptions={{
        tabBarVisible: true
      }} initialRouteName="Home" tabBar={props =>
        <MyTabBar
          auth={auth}
          presentLogoutAlert={presentLogoutAlert}
          presensi={presensi}
          {...props}
        />
      }>



        <Tab.Screen
          name="Home"
          component={HomeRouter}
          options={{
            tabBarLabel: 'Home',
            tabBarIcon: () => (
              <Icon name="smile-beam" color='grey' size={fs(4)} />
            )
          }}
        />

        <Tab.Screen
          name="TouchableTab"
          component={RegisterRouter}
          options={{
            tabBarLabel: 'TouchableTab',
            tabBarIcon: () => (
              <Icon name="smile-beam" color='grey' size={fs(4)} />
            )
          }}
        />



        <Tab.Screen
          name="History"
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

const mapStateToProps = (state) => ({
  auth: state.auth,
  presensi: state.presensi
})

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch({ type: 'IS_LOGGED_OUT' }),
    presentLogoutAlert: () => dispatch({ type: 'PRESENT_LOGOUT_ALERT' })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppNavigation)
