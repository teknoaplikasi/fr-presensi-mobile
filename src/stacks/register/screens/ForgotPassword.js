import { Button } from 'native-base'
import React, { Component } from 'react'
import { ImageBackground, Text, View, StyleSheet, TextInput, StatusBar, Image } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import { simpleToast } from '../../../utils/DisplayHelper'
import Theme from '../../../utils/Theme'

export class ForgotPassword extends Component {
  constructor() {
    super()

    this.state = {
      email: '',
      focus: false
    }
    this.onPressRegister = this.onPressRegister.bind(this)
  }

  componentDidMount = async () => {
    //dev only
    this.initValue()

    this.isFocus = this.props.navigation.addListener('focus', () => {
      this.initValue()
    })

    this.setInputFocus = this.setInputFocus.bind(this)
    this.setInputValue = this.setInputValue.bind(this)
  }

  initValue = () => {
    StatusBar.setBackgroundColor(Theme.default.primaryColor)
    StatusBar.setBarStyle('light-content')
  }

  setInputFocus = () => {
    this.setState({ focus: !this.state.focus })
  }

  setInputValue = (field, value) => {
    this.setState({ [field]: value })
  }

  onPressRegister = async () => {
    if (!this.state.email)
      return simpleToast('Email harus diisi')
    let reset = await API.postDev('ForgotPassword', false, {
      email: this.state.email
    })

    if (!reset.success)
      return simpleToast(reset.failureMessage)

    return simpleToast('Kami mengirimkan link reset password. Silahkan cek email anda')
  }

  componentWillUnmount = () => {
    this.isFocus()
    StatusBar.setBackgroundColor(Theme.default.secondaryColor)
    StatusBar.setBarStyle('dark-content')
  }

  render() {
    const { email, focus } = this.state

    return (
      <ScrollView style={styles.container}>

        <View style={styles.content}>
          <Text style={{ fontWeight: 'bold', alignSelf: 'center', marginVertical: fs(2) }}>Lupa Password?</Text>
          <Image
            source={require('../../../../assets/images/ask-sad.png')}
            style={{
              width: w(70),
              alignSelf: 'center',
              marginVertical: fs(5)
            }}
            resizeMode="contain"
          />
          <Text style={{
            fontWeight: 'normal', alignSelf: 'center', textAlign
              : 'center', marginVertical: fs(2)
          }}>Silahkan masukkan alamat email anda untuk mendapatkan pesan reset password</Text>

          <View
            style={[styles.formInput,

            { borderColor: focus ? 'rgba(98,0,238,1)' : '#121212' }
            ]}
          >
            <TextInput
              placeholder="Masukkan Email"
              style={styles.textInput}
              onChangeText={(value) => this.setInputValue('email', value)}
              onFocus={this.setInputFocus}
              onBlur={this.setInputFocus}
              value={email}
              autoCompleteType="email"
            ></TextInput>
          </View>
          <Button
            full
            style={{
              width: '100%',
              borderRadius: 5,
              backgroundColor: 'rgba(98,0,238,1)',
              // paddingHorizontal: fs(5),
              marginTop: fs(2),
              alignSelf: 'center'
            }}
            onPress={this.onPressRegister}
            bordered
          >
            <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>RESET PASSWORD</Text>
          </Button>

        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: w(100),
    height: h(100),
    backgroundColor: '#ffffff'
  },
  image: {
    width: w(100),
    height: h(40),
  },
  image_imageStyle: {},
  lupaPassword: {
    color: "rgba(59,59,119,1)",
    fontSize: fs(5),
    position: 'absolute',
    bottom: fs(5),
    left: fs(10)
  },

  content: {
    paddingVertical: fs(2),
    paddingHorizontal: fs(5),
    justifyContent: 'center'
  },
  textInput: {
    color: "#121212",
  },

  formInput: {
    paddingLeft: fs(1),
    borderWidth: 1,
    borderRadius: 5,
  },
  rect2: {
    width: 194,
    height: 47,
    backgroundColor: "rgba(98,0,238,1)",
    borderRadius: 6,
    marginTop: 35,
    alignSelf: "center"
  },
  resetPassword: {
    fontFamily: "roboto-700",
    color: "rgba(255,255,255,1)",
    fontSize: 18,
    marginTop: 13,
    marginLeft: 21
  }
});

export default ForgotPassword
