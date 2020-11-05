import React, { Component } from 'react'
import { Text, View, StyleSheet, ImageBackground, ToastAndroid, Image, TextInput, Keyboard, Animated } from 'react-native'
import Theme from '../../../utils/Theme'

import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Chip from '../../../components/Chip'
import { Form, Button } from 'native-base'
import { ScrollView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { simpleToast } from '../../../utils/DisplayHelper'
import { CommonActions } from '@react-navigation/native'


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

      selectedKota: {
        id: null,
        name: ''
      },

      active: null

    }

    this.setInputValue = this.setInputValue.bind(this)
    this.setInputFocus = this.setInputFocus.bind(this)
    this.onPressRegister = this.onPressRegister.bind(this)
    this.onPressSearchCity = this.onPressSearchCity.bind(this)
    this.avoidingView = new Animated.Value(0)
  }




  componentDidMount = async () => {

    //DEV
    await this.initValue()
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      this.keyboardWillHide
    })
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

  onPressSearchCity = () => {
    this.props.navigation.navigate('AuthSearchCity', {
      onSelect: (item) => {
        // alert(JSON.stringify(item))
        this.setState(prevState => ({
          selectedKota: {
            id: item.id,
            name: item.nama
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
    console.log(this.state.value)
    let submit = await API.postDev('register', true, this.state.value)
    console.log(submit)
    if (!submit.success) {
      return simpleToast(submit.failureMessage)
    }

    // this.props.navigation.navigate('RegisterSuccess', {
    //   email: this.state.value.email
    // })

    console.log('resgister', JSON.stringify(submit))

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
    const { schema, active } = this.state
    return (
      <Animated.View
        style={[
          { bottom: this.avoidingView },
          styles.container]}
      >
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
              justifyContent: 'flex-end'
            }}
            resizeMode="cover"
          >
            <Text
              style={{
                fontWeight: 'bold',
                fontSize: fs(5),
                color: '#3b3b77',
                marginBottom: fs(6),
                marginLeft: fs(6)
              }}
            >Registrasi</Text>
          </ImageBackground>

          <View
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

            <ScrollView style={styles.form}>
              <View style={[
                styles.formInput,
                {
                  borderColor: active == 'nama' ? '#6200ee' : 'rgba(172, 172, 172, 0.5)'
                }
              ]}>
                <TextInput
                  placeholder="Nama"
                  returnKeyType="next"
                  onFocus={() => this.setInputFocus('nama')}
                  onChangeText={(e) => this.setInputValue('nama', e)}
                  onEndEditing={() => this.setInputFocus(null)}
                  value={this.state.value.nama}
                />
              </View>
              <View style={[styles.formInput,
              {
                borderColor: active == 'email' ? '#6200ee' : 'rgba(172, 172, 172, 0.5)'
              }]}>
                <TextInput
                  placeholder="Email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onFocus={() => this.setInputFocus('email', h(20))}
                  onChangeText={(e) => this.setInputValue('email', e)}
                  onEndEditing={() => this.setInputFocus(null)}
                  value={this.state.value.email}
                />
              </View>
              <View style={[styles.formInput,
              {
                borderColor: active == 'password' ? '#6200ee' : 'rgba(172, 172, 172, 0.5)'
              }]}>
                <TextInput
                  placeholder="Password"
                  returnKeyType="done"
                  secureTextEntry={true}
                  onFocus={() => this.setInputFocus('password', h(30))}
                  onChangeText={(e) => this.setInputValue('password', e)}
                  onEndEditing={() => this.setInputFocus(null)}
                  value={this.state.value.password}
                />
              </View>


              <TouchableOpacity style={[styles.formInput, { borderColor: 'rgba(172, 172, 172, 0.5)', flexDirection: 'row', backgroundColor: 'rgba(172, 172, 172, 0.05)', height: 50 }]} onPress={this.onPressSearchCity}>
                <Text style={{
                  alignSelf: 'center',
                  paddingLeft: fs(1)
                }}>{this.state.selectedKota.name ? this.state.selectedKota.name : 'Pilih Kota'}</Text>
              </TouchableOpacity>

              <View style={styles.formButton}>

                <View style={{
                  width: '100%',
                  alignSelf: 'center'
                }}>
                  <Button full style={{ backgroundColor: '#6200ee', borderRadius: 5 }} onPress={this.onPressRegister}>
                    <Text style={{ color: 'white' }}>DAFTAR</Text>
                  </Button>
                </View>
              </View>
            </ScrollView>
          </View>
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
    // height: h(65),
    backgroundColor: 'white'
  },

  form: {
    // backgroundColor: 'grey',
    paddingHorizontal: fs(5),
    height: h(100),
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
    marginTop: fs(3)
    // paddingTop: fs(5)
  }
})

export default RegisterFace
