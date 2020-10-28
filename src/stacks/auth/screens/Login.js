import React, { Component } from 'react'
import { StyleSheet, Image, View, StatusBar, ImageBackground, Keyboard, Animated, TextInput, BackHandler, KeyboardAvoidingView, ToastAndroid, ActivityIndicator } from 'react-native'
import { responsiveWidth as w, responsiveFontSize as fs, responsiveHeight as h } from 'react-native-responsive-dimensions'
import { Container, Header, Content, Form, Item, Input, Label, Row, Col, Text, Button } from 'native-base';
import { ScrollView, TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { API } from '../../../utils/Api'
import { decodeJWT } from '../../../utils/AuthHelper';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome5'
import { simpleToast } from '../../../utils/DisplayHelper';

export class Login extends Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      form: {
        active: null,
        value: {
          username: 'admin@gmail.com',
          password: 'semarang'
        },
        secureTextEntry: 'password'
      }
    }

    this.setInputFocus = this.setInputFocus.bind(this)
    this.initValue = this.initValue.bind(this)
    this.keyboardWillShow = this.keyboardWillShow.bind(this)
    this.keyboardWillHide = this.keyboardWillHide.bind(this)
    this.onUserLogin = this.onUserLogin.bind(this)
    this.setSecureTextEntry = this.setSecureTextEntry.bind(this)

    this.avoidingView = new Animated.Value(0)
  }

  initValue = async () => {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)

    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);

    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', async () => {
      await this.keyboardWillHide()
    })

    // StatusBar.setBackgroundColor('transparent')
    // StatusBar.setBarStyle('light-content')
  }

  componentDidMount = () => {
    //dev
    this.initValue()
    this.isFocus = this.props.navigation.addListener('focus', () => {
      this.initValue()
    })

  }


  componentWillUnmount() {

    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
    this.keyboardDidHideListener.remove();
  }


  keyboardWillShow = (value) => {
    Animated.timing(this.avoidingView, {
      duration: 200,
      toValue: value,
    }).start();
  };

  keyboardWillHide = () => {
    console.log('keyboardWillHide')
    Animated.timing(this.avoidingView, {
      duration: 200,
      toValue: 0,
    }).start();
  };

  setInputFocus = (field, avoidValue = h(5)) => {
    if (!field) {
      this.keyboardWillHide()
    }

    else {
      this.keyboardWillShow(avoidValue)
    }

    this.setState(prevState => ({
      form: {
        ...prevState.form,
        active: field
      }
    }))
  }


  setInputValue = (field, value) => {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        value: {
          ...prevState.form.value,
          [field]: value
        }
      }
    }))
  }

  setSecureTextEntry = (value) => {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        secureTextEntry: value
      }
    }))
  }

  onUserLogin = async () => {
    this.setState({ login: true })
    let login = await API.getDev('login', false, this.state.form.value)
    if (!login.success) {
      this.setState({ login: false })
      return this.presentToast(login.failureMessage)
    }
    await this.props.setToken(login.JWT)
    const companyInfo = await API.getDev(`view/perusahaan/${login.profile.perusahaan_id}`, true, {})
    const companyLocation = await API.getDev(`list/lokasi_perusahaan`, true, {
      perusahaan_id: login.profile.perusahaan_id
    })

    console.log('company location', companyLocation)

    const companyConfig = await API.getDev('ConfigPresensi', {
      id: login.profile.perusahaan_id
    })

    const faceId = await API.get('faceid', true, {})

    if (!companyInfo.success) {
      return simpleToast('Info perusahaan tidak ditemukan')
    }
    await this.props.setCompany(companyInfo.perusahaan)
    await this.props.setCompany(companyLocation.lokasi_perusahaan[0])
    console.log('Info perusahaan', companyLocation.lokasi_perusahaan[0])
    delete login.JWT
    await this.props.setProfile(login.profile)
    this.props.login()
    this.setState({ login: false })

  }


  presentToast = (message) => {
    return ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    )
  }

  render() {
    const { form } = this.state
    return (
      <Animated.ScrollView
        style={{
          flex: 1,
          display: 'flex',
          bottom: this.avoidingView,
          width: w(100),
          height: h(100),
          backgroundColor: 'white'
        }}
      >
        <View style={{
          position: 'relative'
        }}>
          <ImageBackground
            source={require('../../../../assets/images/home-bg-light.png')}
            style={{
              width: w(100),
              height: h(45),
              backgroundColor: '#ffac1f'
            }}
          >
          </ImageBackground>

          {/* TEXT TITLE */}
          <View style={{
            position: 'absolute',
            bottom: h(7),
            left: w(10)
          }}>
            <Text style={styles.appTitle}>Presensi</Text>
            <Text style={styles.appTitle}>Attendance</Text>
          </View>

        </View>
        <Form style={styles.form}>
          <View style={[
            styles.inputLabel,
            form.active == 'username' && { borderColor: '#6200ee' },
            form.active != 'username' && { borderColor: 'rgba(172, 172, 172, 0.5)' },
          ]}>

            <TextInput
              onChangeText={(e) => this.setInputValue('username', e)}
              value={form.value.username}
              placeholder="Username/Email"
              onFocus={() => this.setInputFocus('username', h(0))}
              onEndEditing={() => this.setInputFocus(null)}
            />
          </View>
          <View style={[
            styles.inputLabel,
            form.active == 'password' && { borderColor: '#6200ee' },
            form.active != 'password' && { borderColor: 'rgba(172, 172, 172, 0.5)' },
          ]}>
            <TextInput
              placeholder="Password"
              secureTextEntry={form.secureTextEntry == 'password'}
              onChangeText={(e) => this.setInputValue('password', e)}
              value={form.value.password}
              onFocus={() => this.setInputFocus('password', h(10))}
              onEndEditing={() => this.setInputFocus(null)}
            />


            <Icon
              name={form.secureTextEntry ? 'eye-slash' : 'eye'}
              size={fs(3)}
              color={form.secureTextEntry ? "rgba(178,178,178,.5)" : 'black'}
              style={{
                position: 'absolute',
                right: fs(2),
                top: '50%',
                transform: [
                  { translateY: fs(-1.5) }
                ]
              }}
              onPress={() => this.setSecureTextEntry(form.secureTextEntry ? null : 'password')}
            />
          </View>

          <Row style={{ marginTop: h(4) }}>

            <Col>
              <Button transparent>
                <Text style={{ color: '#6200ee' }}>Lupa Password?</Text>
              </Button>
            </Col>
            <Col>
              <Button
                style={{ backgroundColor: this.state.loading ? 'gray' : '#6200ee', borderRadius: 7, alignSelf: 'flex-end' }}
                disabled={this.state.loading}
                onPress={this.onUserLogin}
              >
                {/* <ActivityIndicator size="small" color="white" style={{ marginLeft: fs(1.5) }} /> */}
                <Text>Login</Text>
              </Button>
            </Col>
          </Row>


        </Form>

        <TouchableHighlight
          style={{ width: w(80), height: h(20) }}
          onPress={() => {
            this.props.navigation.navigate('RegisterCode')
          }}
        />

        {/* </ScrollView> */}
        {/* </TouchableWithoutFeedback> */}
      </Animated.ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: fs(2),
    paddingVertical: fs(3)
  },

  formGroup: {
    marginVertical: fs(0.8),
  },

  input: {
    borderRadius: 4,
    paddingHorizontal: fs(1),
  },

  inputLabel: {
    borderWidth: 1.5,
    marginVertical: fs(1),
    borderRadius: 5,
    paddingLeft: fs(1)
  },

  appTitle: {
    fontWeight: 'bold',
    fontSize: fs(3.5),
    color: '#6200ee'
  }
})

const mapStateToProps = (state) => ({
  auth: state.auth
})

const mapDispatchToProps = dispatch => {
  return {
    setToken: async (payload) => dispatch({ type: 'SET_TOKEN', token: payload }),
    logout: () => dispatch({ type: 'IS_LOGGED_OUT' }),
    login: () => dispatch({ type: 'IS_LOGGED_IN' }),
    setProfile: async (payload) => dispatch({ type: 'SET_PROFILE', profile: payload }),
    setCompany: (payload) => dispatch({ type: 'SET_COMPANY', company: payload }),
    setFaceId: (payload) => dispatch({ type: 'SET_FACE_ID', faceId: payload })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
