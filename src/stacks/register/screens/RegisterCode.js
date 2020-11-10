import { Col, Content, Form, Item, Label, Row, Input, Button } from 'native-base'
import React, { Component } from 'react'
import { Text, View, StyleSheet, Image, Keyboard, KeyboardAvoidingView, Animated } from 'react-native'
import { Container, Body } from 'native-base'

import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import Theme from '../../../utils/Theme'
import { connect } from 'react-redux'
import { TextInput, TouchableOpacity, TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { simpleToast } from '../../../utils/DisplayHelper'
import { API } from '../../../utils/Api'
import Loading from '../../../components/Loading'
import Icon from 'react-native-vector-icons/FontAwesome5'

export class RegisterCode extends Component {

  constructor() {
    super();

    this.state = {
      active: false,
      value: '',
      scheme: {},
      buttonLoading: false
    }

    this.setInputFocus = this.setInputFocus.bind(this)
    this.setInputValue = this.setInputValue.bind(this)
    this.onPressCheck = this.onPressCheck.bind(this)
    this.avoidingView = new Animated.Value(0)
  }


  componentDidMount = async () => {

    await this.initValue()
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', async () => {
      this.keyboardWillHide()
    })
    this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)

    this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);

    this.isFocus = this.props.navigation.addListener('focus', async () => {
      await this.initValue()
      this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', async () => {
        this.keyboardWillHide()
      })
      this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)

      this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);

    })

  }

  componentWillUnmount() {
    this.isFocus()
    this.keyboardWillShowSub.remove();
    this.keyboardWillHideSub.remove();
    this.keyboardDidHideListener.remove()
  }

  initValue() {
    this.setState({
      scheme: Theme.default
    })
  }

  keyboardWillShow = () => {
    Animated.timing(this.avoidingView, {
      duration: 200,
      toValue: h(10),
    }).start();
  };

  keyboardWillHide = () => {
    Animated.timing(this.avoidingView, {
      duration: 200,
      toValue: 0,
    }).start();
  };

  setInputFocus = () => {
    this.setState({ active: !this.state.active })
    this.keyboardWillShow()
  }

  setInputValue = (value) => {
    this.setState({
      value: value
    })
  }

  onPressCheck = async () => {
    this.setState({ buttonLoading: true })
    if (this.state.value.length == 0) {
      this.setState({ buttonLoading: false })

      return simpleToast('Kode perusahaan harus diisi')
    }

    //get data
    let check = await API.getDev('UniqCode', false, {
      kode: this.state.value
    })

    console.log('check', JSON.stringify(check))

    if (!check.success) {
      this.setState({ buttonLoading: false })
      return simpleToast('Perusahaan tidak ditemukan')
    }

    if (check.data.length == 0) {
      return simpleToast('Perusahaan tidak ditemukan')
    }

    console.log(JSON.stringify(check))


    this.props.navigation.navigate('RegisterFace', {
      perusahaan_id: check.data[0].id
    })
    this.setState({ buttonLoading: false })

  }
  render() {
    const { active, scheme } = this.state
    return (
      <Animated.View style={[{ bottom: this.avoidingView, backgroundColor: 'white' }, styles.container]}>
        <Loading rIf={this.state.buttonLoading} />
        <TouchableWithoutFeedback
          onPress={() => {
            this.keyboardWillHide()
            Keyboard.dismiss()
          }}
        >
          <View style={styles.wrapperABlock}>
            <Image
              source={require('../../../../assets/images/home-bg-light.png')}
              style={{
                width: w(100),
                height: h(50),
                position: 'absolute'
              }}
            />
            <Image
              source={require('../../../../assets/images/register-vector.png')}
              style={styles.aBlockVector}
              resizeMode="contain"
            />
          </View>

          <View style={styles.wrapperBBlock}>
            {/* <Content> */}
            <Form style={styles.form}>
              <View style={[
                {
                  borderColor: active ? '#6200ee' : 'rgba(178,178,178,.5)',
                  justifyContent: 'space-between',
                  flexDirection: 'row'
                },
                styles.inputLabel
              ]}>
                <TextInput
                  onChangeText={(e) => this.setInputValue(e)}
                  onFocus={() => this.setInputFocus()}
                  placeholder="Kode Perusahaan"
                  onEndEditing={() => {
                    this.setInputFocus()
                    this.keyboardWillHide()
                  }}
                  value={this.state.value}
                  style={{
                    alignSelf: 'flex-start',
                    width: '100%'
                  }}
                />


              </View>


              {/* CTA */}

              <Button disabled={this.buttonLoading} size="large" style={{ backgroundColor: '#6200ee', paddingHorizontal: fs(5), paddingVertical: fs(7), borderRadius: 6, alignSelf: 'center' }}
                onPress={this.onPressCheck}
              >
                <Text style={{ color: 'white', textTransform: 'capitalize' }}>CEK KODE PERUSAHAAN</Text>
              </Button>
            </Form>
            {/* </Content> */}
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: w(100),
    height: h(100),
    // flex: 1,
    // paddingBottom: 100
  },

  keyboardView: {
    flex: 1,
    bottom: 100
  },
  wrapperABlock: {
    width: w(100),
    height: h(50),
    // backgroundColor: 'yellow',
    justifyContent: 'flex-end',
    // position: 'absolute',
    flexDirection: 'column',
    display: 'flex'
  },

  form: {
    // backgroundColor: 'yellow',
    paddingHorizontal: fs(2),
    paddingVertical: fs(3),
    marginTop: fs(5),
    flexDirection: 'column'
  },

  formGroup: {
    marginVertical: fs(0.8),
    height: 'auto'
  },

  aBlockVector: {
    width: w(80),
    alignSelf: 'center',
    transform: [
      { translateY: fs(7) }
    ],
    // zIndex: 999,
    // position: 'absolute'
    // position: 'absolute',
    // bottom: fs(-3)
    // height: 100
  },


  inputLabel: {
    // backgroundColor: 'white',
    // elevation: 0,

    paddingHorizontal: fs(2),
    marginVertical: fs(2),
    // marginBottom: fs(2.2),
    borderWidth: 1.5,
    borderRadius: 5,
  },

  wrapperBBlock: {
    width: w(100),
    height: h(50),
    position: 'relative'
  }
})

const mapStateToProps = (state) => ({
  auth: state.auth
})

const mapDispatchToProps = dispatch => {
  return {
    login: () => dispatch({ type: 'IS_LOGGED_IN' }),
    logout: () => dispatch({ type: 'IS_LOGGED_OUT' })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterCode)
