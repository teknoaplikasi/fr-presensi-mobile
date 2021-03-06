import React, { Component } from 'react'
import { Text, View, StyleSheet, ImageBackground, ToastAndroid, Image, TextInput, Keyboard, Animated, BackHandler } from 'react-native'
import Theme from '../../../utils/Theme'

import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Chip from '../../../components/Chip'
import { ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { simpleToast } from '../../../utils/DisplayHelper'
import { CommonActions } from '@react-navigation/native'
import Loading from '../../../components/Loading'
import RNText from '../../../components/Text/Text'
import InputText from '../../../components/Form/InputText'
import InputPassword from '../../../components/Form/InputPassword'
import Button from '../../../components/Button/Button'


export class RegisterFace extends Component {
  constructor() {
    super()

    this.state = {
      schema: {},
      cityList: [],
      value: {
        nama: '',
        email: '',
        password: '',
        perusahaan_id: '',
        kota_id: null
      },

      error: {
        nama: false,
        email: false,
        password: false,
        kota_id: false
      },

      selectedKota: {
        id: null,
        name: ''
      },

      register: false,

      active: null

    }

    this.setInputValue = this.setInputValue.bind(this)
    this.setInputFocus = this.setInputFocus.bind(this)
    this.onPressRegister = this.onPressRegister.bind(this)
    this.onPressSearchCity = this.onPressSearchCity.bind(this)
    this.validateField = this.validateField.bind(this)
    this.avoidingView = new Animated.Value(0)
  }




  componentDidMount = async () => {

    //DEV
    // await this.initValue()
    // this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
    // this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
    // this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
    //   this.keyboardWillHide
    // })
    // END DEV


    this.isFocus = this.props.navigation.addListener('focus', async () => {
      await this.initValue()
      this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
      this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
      this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        this.keyboardWillHide
      })
    })


  }

  initValue = async () => {
    await this.setState({
      schema: Theme.light
    })

    const perusahaan_id = this.props.route.params.perusahaan_id
    this.setState(prevState => ({
      value: {
        ...prevState.value,
        perusahaan_id: perusahaan_id
      }
    }))

    let cities = await API.getDev('list/kota', false, {})
    console.log('city', cities)

    if (!cities.success) {
      return simpleToast('Gagal mendapatkan data kota')
    }

    this.setState({
      cityList: cities.kota
    })

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

  componentWillUnmount() {

    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
    this.keyboardDidHideListener.remove();
  }

  setInputFocus = (field, avoidValue = h(15)) => {
    if (field) {
      this.keyboardWillShow(avoidValue)
    }

    else {
      this.keyboardWillHide()
    }
    this.setState({
      active: field
    })
  }

  validateField = (field) => {
    if (field == 'nama' || field == 'password' || field == 'kota_id') {
      this.setState(prevState => ({
        error: {
          ...prevState.error,
          [field]: !this.state.value[field] ? `${field.replace(/ /g, " ")} harus diisi` : false
        }
      }))
    }

    else if (field == 'email') {
      if (!this.state.value.email) {
        return this.setState(prevState => ({
          error: {
            ...prevState.error,
            email: 'Email harus diisi'
          }
        }))
      }
      this.setState(prevState => ({
        error: {
          ...prevState.error,
          email: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(this.state.value.email)) ? false : 'Email tidak valid'
        }
      }))
    }

    else {
      return
    }
  }

  onPressSearchCity = () => {
    this.props.navigation.navigate('AuthSearchCity', {
      onSelect: (item) => {
        // alert(JSON.stringify(item))
        if (!item || !item.id) {
          return this.setState(prevState => ({
            error: {
              ...prevState.error,
              kota_id: 'Kota harus dipilih'
            }
          }))
        }
        this.setState(prevState => ({
          selectedKota: {
            id: item.id,
            name: item.nama
          },
          error: {
            ...prevState.error,
            kota_id: false
          },
          value: {
            ...prevState.value,
            kota_id: item.id
          }
        }))
      }
    })
  }

  setInputValue = (field, value) => {
    this.setState(prevState => ({
      value: {
        ...prevState.value,
        [field]: value
      }
    }))
  }

  onPressRegister = async () => {
    this.setState({ register: true })
    //validate
    let isValid = false
    Object.keys(this.state.value).forEach((key) => {
      this.validateField(key)
      if (this.state.value[key])
        isValid = true
      else
        isValid = false
    })

    if (!isValid)
      return this.setState({ register: false })

    let submit = await API.postDev('register', false, this.state.value)
    console.log(submit)
    if (!submit.success) {
      this.setState({ register: false })
      return simpleToast(submit.failureMessage)
    }

    this.setState({ register: false })

    this.props.navigation.dispatch(
      CommonActions.reset({
        routes: [
          { name: 'Login' },
          {
            name: 'RegisterSuccess', params: {
              email: this.state.value.email
            }
          }
        ]
      })
    )
  }


  render() {
    const { schema, active, error } = this.state
    return (
      <Animated.View
        style={[
          { bottom: this.avoidingView },
          styles.container]}
      >
        <Loading rIf={false} />
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss()
            this.keyboardWillHide()
          }}
        >
          <ImageBackground
            source={require('../../../../assets/images/home-bg-light.png')}
            style={{
              width: w(100),
              height: h(35),
              justifyContent: 'flex-end',
              paddingBottom: fs(6),
              paddingLeft: fs(6)
            }}
            resizeMode="cover"
          >

            <RNText h1 bold color="#3b3b77">Registrasi</RNText>
          </ImageBackground>

          <ScrollView
            style={styles.blockAWrapper}
          >
            <View style={{ width: w(70), alignSelf: 'center', marginVertical: fs(4) }}>
              <Chip
                bgColor="#ffc725"
                textColor="black"
                text="kode perusahaan ditemukan"
                icon="check-circle"
              />

              <Text style={{ color: '#3b3b77', textAlign: 'center' }}>Silahkan isi data diri Anda untuk melanjutkan proses verifikasi</Text>
            </View>

            <View style={styles.form}>

              <InputText
                placeholder="Nama"
                returnKeyType="next"
                onFocus={() => this.setInputFocus('nama')}
                onChangeText={(e) => this.setInputValue('nama', e)}
                onEndEditing={() => {
                  this.setInputFocus(null)
                  this.validateField('nama')
                }}
                value={this.state.value.nama}
                error={this.state.error.nama}
                color={Theme.default.primaryColor}
                active={active == 'nama'}
              />

              <InputText

                placeholder="Email"
                keyboardType="email-address"
                returnKeyType="next"
                autoCapitalize="null"
                onFocus={() => this.setInputFocus('email', h(20))}
                onChangeText={(e) => this.setInputValue('email', e)}
                onEndEditing={() => {
                  this.setInputFocus(null)
                  this.validateField('email')
                }}
                value={this.state.value.email}
                error={this.state.error.email}
                color={Theme.default.primaryColor}
                active={active == 'email'}
              />

              <InputPassword

                placeholder="Password"
                returnKeyType="done"
                secureTextEntry={true}
                onFocus={() => this.setInputFocus('password', h(30))}
                onChangeText={(e) => this.setInputValue('password', e)}
                onEndEditing={() => {
                  this.setInputFocus(null)
                  this.validateField('password')
                }}
                value={this.state.value.password}
                error={this.state.error.password}
                color={Theme.default.primaryColor}
                active={active == 'password'}
              />

              <TouchableOpacity
                style={
                  [styles.formInput,
                  {
                    borderColor: 'rgba(172, 172, 172, 0.5)',
                    flexDirection: 'row',
                    backgroundColor: 'rgba(172, 172, 172, 0.05)',
                    height: 50
                  },

                  error.kota_id && { borderColor: 'red' }
                  ]}
                onPress={this.onPressSearchCity}>
                <Text style={{
                  alignSelf: 'center',
                  paddingLeft: fs(1)
                }}>{this.state.selectedKota.name ? this.state.selectedKota.name : 'Pilih Kota'}</Text>
              </TouchableOpacity>

              {error.kota_id && <Text style={{ color: 'red', marginBottom: fs(1), fontSize: fs(1.5) }}>{error.kota_id}</Text>}


              <Button
                wrapperStyle={{ marginVertical: fs(1.5) }}
                label="DAFTAR"
                schema={Theme.default.buttonScheme}
                onPress={this.onPressRegister}
                disabled={this.state.register}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </Animated.View >
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: w(100),
    height: h(100)
  },

  blockAWrapper: {
    width: w(100),
    height: h(65),
    backgroundColor: 'white'
  },

  form: {
    // backgroundColor: 'grey',
    paddingHorizontal: fs(5),
    // height: h(100),
    // position: 'relative'
    // flex: 1,
  },

  formInput: {
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: fs(1),
    paddingLeft: fs(0.8)
  },

  formButton: {
    // display: 'flex',
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    paddingTop: fs(3),
    paddingBottom: fs(5)
    // paddingTop: fs(5)
  }
})

export default RegisterFace
