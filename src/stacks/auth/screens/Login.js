import React, { Component } from 'react'
import { StyleSheet, View, ImageBackground, Keyboard, Animated } from 'react-native'
import { responsiveWidth as w, responsiveFontSize as fs, responsiveHeight as h } from 'react-native-responsive-dimensions'
import { Row, Col, Text } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { API } from '../../../utils/Api'
import { connect } from 'react-redux';
import { simpleToast } from '../../../utils/DisplayHelper';
import Loading from '../../../components/Loading'
import InputText from '../../../components/Form/InputText'
import InputPassword from '../../../components/Form/InputPassword'
import Button from '../../../components/Button/Button'
import RNText from '../../../components/Text/Text'
import Theme from '../../../utils/Theme';

export class Login extends Component {
  constructor(props) {
    super(props)


    this.state = {
      loading: false,
      form: {
        active: null,
        value: {
          email: '',
          password: ''
        },
        error: {
          email: false,
          password: false
        },
        secureTextEntry: 'password'
      },
      login: false
    }

    this.setInputFocus = this.setInputFocus.bind(this)
    this.initValue = this.initValue.bind(this)
    this.keyboardWillShow = this.keyboardWillShow.bind(this)
    this.keyboardWillHide = this.keyboardWillHide.bind(this)
    this.onUserLogin = this.onUserLogin.bind(this)
    this.setSecureTextEntry = this.setSecureTextEntry.bind(this)
    this.validateField = this.validateField.bind(this)
    this.avoidingView = new Animated.Value(0)
  }

  initValue = async () => {
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
    this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', async () => { await this.keyboardWillHide() })


  }


  componentDidMount = () => {
    //dev
    this.initValue()
    this.isFocus = this.props.navigation.addListener('focus', () => {
      this.initValue()
    })
  }

  componentWillUnmount() {
    this.isFocus()
    this.keyboardWillShowSub.remove()
    this.keyboardWillHideSub.remove()
    this.keyboardDidHideSub.remove()
  }


  keyboardWillShow = (value) => {
    Animated.timing(this.avoidingView, {
      duration: 200,
      toValue: value,
    }).start();
  };

  keyboardWillHide = () => {
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

  validateField = (field) => {
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        error: {
          ...prevState.error,
          [field]: !this.state.form.value[field] ? `${field} harus diisi` : false
        }
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
    this.setState(prevState => ({
      form: {
        ...prevState.form,
        error: {
          email: !this.state.form.value.email ? 'Email harus diisi' : false,
          password: !this.state.form.value.password ? 'Password harus diisi' : false,
        }
      }
    }))

    if (!this.state.form.value.email || !this.state.form.value.password)
      return

    this.setState({ login: true })
    let login = await API.getDev('login', false, { username: this.state.form.value.email, password: this.state.form.value.password })
    if (!login.success) {
      this.setState({ login: false })
      return simpleToast(login.failureMessage)
    }
    await this.props.setToken(login.JWT)

    if (login.perusahaan.length == 0)
      return simpleToast('Anda belum terdaftar di perusahaan')
    const perusahaanId = login.perusahaan[0].id
    const companyInfo = await API.getDev(`view/perusahaan/${perusahaanId}`, true, {})
    console.log(JSON.stringify(companyInfo))
    const faceId = await API.getDev('FaceId', true, {
      id: login.profile.id
    })

    if (faceId.data.length > 0) {
      this.props.setFaceId(faceId.data[0].face_id)
    }

    if (!companyInfo.success) {
      return simpleToast('Info perusahaan tidak ditemukan')
    }
    console.log('company info', JSON.stringify(companyInfo))
    const companyLocation = await API.getDev(`list/lokasi_perusahaan`, true, {
      perusahaan_id: login.profile.perusahaan_id
    })

    const lastPresensi = await API.getDev('LastPresensi', true, {
      id: login.profile.id,
      perusahaan_id: login.profile.perusahaan_id
    })

    if (lastPresensi.data) {
      this.props.setLastPresensi(lastPresensi.data)
    }

    const mergedCompanyInfo = {
      ...companyInfo.perusahaan,
      ...companyLocation.lokasi_perusahaan[0]
    }


    this.props.setCompany(mergedCompanyInfo)
    delete login.JWT
    this.props.setProfile(login.profile)
    this.props.login()
    this.setState({ login: false })

  }

  render() {
    const { form } = this.state
    return (
      <React.Fragment>
        <Loading rIf={this.state.login} />
        {/* <Button onPress={this.signIn}><Text>Test</Text></Button> */}
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
            position: 'relative',
          }}>
            <ImageBackground
              source={require('../../../../assets/images/home-bg-light.png')}
              style={{
                width: w(100),
                height: h(38),
                backgroundColor: '#ffac1f',
                position: 'relative'
              }}
            >
            </ImageBackground>

            {/* TEXT TITLE */}
            <View style={{
              position: 'absolute',
              bottom: h(7),
              left: w(10)
            }}>
              <RNText h3 bold color={Theme.default.primaryColor}>Presensi</RNText>
              <RNText h3 bold color={Theme.default.primaryColor}>Mandiri</RNText>
            </View>

          </View>
          <View style={styles.form}>

            <InputText
              onChangeText={(e) => this.setInputValue('email', e)}
              value={form.value.email}
              placeholder="Email"
              keyboardType="email-address"
              onFocus={() => this.setInputFocus('email', null)}
              onEndEditing={() => {
                this.setInputFocus(null)
                this.validateField('email')
              }}
              active={form.active == 'email'}
              error={form.error.email}
              autoCapitalize="none"
              color={Theme.default.primaryColor}
            />

            <InputPassword
              placeholder="Password"
              onChangeText={(e) => this.setInputValue('password', e)}
              value={form.value.password}
              onFocus={() => this.setInputFocus('password', h(5))}
              onEndEditing={() => {
                this.setInputFocus(null)
                this.validateField('password')
              }}
              error={form.error.password}
              active={form.active == 'password'}
              autoCapitalize="none"
              color={Theme.default.primaryColor}
            />

            <Button
              label="LOGIN"
              schema={Theme.default.buttonScheme}
              textStyle={{ fontWeight: 'bold' }}
              wrapperStyle={{ marginTop: fs(1.5) }}
              disabled={this.state.loading}
              onPress={this.onUserLogin}
            />

            <Row style={{ marginTop: fs(2) }}>
              <Col>
                <Text style={{ fontSize: fs(1.9) }}>Belum memiliki akun ?</Text>
              </Col>
              <Col>
                <TouchableOpacity
                  style={{ alignSelf: 'flex-end' }}
                  onPress={() => {
                    this.props.navigation.navigate('RegisterCode')
                  }}
                >
                  <Text style={{ color: '#6200ee', fontSize: fs(1.9), fontWeight: 'bold' }}>Daftar Sekarang</Text>
                </TouchableOpacity>
              </Col>
            </Row>

            <TouchableOpacity
              style={{
                alignSelf: 'center',
                marginTop: fs(5)
              }}
              onPress={() => {
                this.props.navigation.navigate('ForgotPassword')
              }}
            >
              <Text style={{ color: '#6200ee', fontWeight: 'bold', fontSize: fs(1.8) }}>Lupa Password</Text>
            </TouchableOpacity>


          </View>
        </Animated.ScrollView>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    paddingHorizontal: fs(2),
    paddingVertical: fs(3),
    flex: 1,
    backgroundColor: 'white',
    // height: h(100),
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
    setFaceId: (payload) => dispatch({ type: 'SET_FACE_ID', faceId: payload }),
    setLastPresensi: (payload) => dispatch({ type: 'SET_LAST_PRESENSI', payload: payload })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)
