// import { Image } from 'native-base'
import React, { Component } from 'react'
import { ImageBackground, StatusBar, StyleSheet, Text, View, Image } from 'react-native'
import { responsiveWidth as w, responsiveHeight as h, responsiveScreenFontSize as fs, responsiveScreenHeight } from 'react-native-responsive-dimensions'

import Icon from 'react-native-vector-icons/FontAwesome5'
import { Button } from 'native-base'

import Theme from '../../../utils/Theme'
import { CommonActions } from '@react-navigation/native'
export class RegisterSuccess extends Component {

  constructor() {
    super()

    this.state = {
      scheme: {}
    }
  }

  componentDidMount = async () => {
    this.initValue()
  }

  initValue() {
    StatusBar.setBackgroundColor('transparent')
    StatusBar.setTranslucent(true)
    StatusBar.setBarStyle('dark-content')

    this.setState({
      scheme: Theme.default
    })
  }

  render() {
    const { scheme } = this.state
    return (
      <ImageBackground
        style={
          styles.container
        }
        source={require('../../../../assets/images/bg-register-full.png')}
      >
        <View style={styles.content}>
          <Image
            source={require('../../../../assets/images/register-vector.png')}
          />

          <View style={{
            backgroundColor: scheme.primaryColor,
            // width: '80%',
            marginVertical: fs(5),
            paddingVertical: fs(1.5),
            paddingHorizontal: fs(3),
            justifyContent: 'center',
            borderRadius: fs(10),
            overflow: 'hidden',
            flexDirection: 'row'
          }}>
            <Icon name="check-circle" color="white" size={fs(2.5)} style={{ paddingRight: fs(2) }} />
            <Text style={{
              color: scheme.secondaryText,
              fontWeight: 'bold',
              fontSize: fs(1.8)
            }}>Pendaftaran Anda Berhasil</Text>
          </View>

          <Text
            style={{
              width: '80%',
              textAlign: 'center'
            }}
          >
            Silahkan tunggu proses verifikasi dari perusahaan,
            Kami akan mengirimkan informasi hasil verifikasi
            anda melalui email
          </Text>

          <Text
            style={{
              width: '80%',
              textAlign: 'center',
              fontWeight: 'bold'
            }}
          >
            {this.props.route.params.email}
            {/* email section */}
          </Text>
        </View>

        <Button
          style={{ backgroundColor: 'white', alignSelf: 'center', paddingHorizontal: fs(6), marginTop: fs(2) }}
          onPress={() => {

            this.props.navigation.dispatch(
              CommonActions.reset({
                routes: [
                  { name: 'Login' },
                ],

                index: 0
              })
            )
          }}
        >
          <Text>Kembali ke Login</Text>
        </Button>
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: w(100),
    height: responsiveScreenHeight(100)
  },
  content: {
    width: w(90),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: h(30)
  }
})

export default RegisterSuccess
