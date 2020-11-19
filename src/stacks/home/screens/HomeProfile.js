import React, { Component } from 'react'
import { StyleSheet, Text, View, Image, StatusBar } from 'react-native'
import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { Button, Card } from 'native-base'
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { connect } from 'react-redux'
import Theme from '../../../utils/Theme'
import ImagePicker from 'react-native-image-picker'
import { API } from '../../../utils/Api'
import { ASSETS_URL } from '../../../../config'
import { simpleToast } from '../../../utils/DisplayHelper'

export class HomeProfile extends Component {

  constructor() {
    super()

    this.state = {
      value: {
        nama: '',
        email: '',
        wanumber: ''
      },

      error: {
        wanumber: false
      },
      initialValue: {
        nama: '',
        email: '',
        wanumber: ''
      },
      editing: false,
      focus: null
    }

    this.setInputValue = this.setInputValue.bind(this)
    this.setInputFocus = this.setInputFocus.bind(this)
    this.checkDifference = this.checkDifference.bind(this)
    this.validateField = this.validateField.bind(this)
  }

  componentDidMount = () => {
    this.initValue()
    this.isFocus = this.props.navigation.addListener('focus', () => {
      this.initValue()
    })
  }

  selectPhotoTapped = async () => {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true
      }
    }
    ImagePicker.showImagePicker(options, async (response) => {
      // console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled photo picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        let source = { uri: response.uri };
        let uri = response.uri
        console.log(uri)

        let upload = await API.changeProfilePhoto(uri)
        console.log(JSON.stringify(upload))
        if (upload.success) {
          this.props.editProfile({
            foto_profil: upload.data.name
          })
        }

        simpleToast(upload.failureMessage)
        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };
        // console.log(response.uri)
        // this.setState({

        //   ImageSource: source

        // })
      }
    })
  }

  initValue = () => {
    StatusBar.setBackgroundColor('white')
    StatusBar.setBarStyle('dark-content')
    this.setState({
      value: {
        nama: this.props.auth.profile.nama,
        email: this.props.auth.profile.email,
        wanumber: this.props.auth.profile.wanumber,
      },
      initialValue: this.props.auth.profile
    })
  }

  setInputFocus = (value) => {
    this.setState({ focus: value })
  }

  setInputValue = (field, value) => {
    this.setState(prevState => ({
      value: {
        ...prevState.value,
        [field]: value
      }
    }))
  }

  validateField = (field) => {
    if (field == 'wanumber') {

      let errorMessage = this.state.value[field] ? false : 'No Whatsapp harus diisi'
      let isValid = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(this.state.value[field])
      if (!errorMessage)
        errorMessage = isValid ? false : 'No Whatsapp tidak valid'

      this.setState(prevState => ({
        error: {
          ...prevState.error,
          [field]: errorMessage
        }
      }))
    }

    if (field == 'nama') {
      this.setState(prevState => ({
        error: {
          ...prevState.error,
          [field]: this.state.value[field] ? false : 'Nama harus diisi'
        }
      }))
    }
  }

  checkDifference = () => {
    console.log('diff', (this.state.initialValue.nama != this.state.value.nama || this.state.initialValue.email != this.state.value.email || this.state.initialValue.wanumber != this.state.value.wanumber))
    this.setState({
      hasEditing: this.state.initialValue.nama != this.state.value.nama || this.state.initialValue.email != this.state.value.email || this.state.initialValue.wanumber != this.state.value.wanumber
    })
  }

  updateProfile = async () => {
    if (this.state.error.wanumber && this.state.error.nama) return
    let payloadBody = {
      nama: this.state.value.nama,
      email: this.state.initialValue.email,
      wanumber: this.state.value.wanumber
    }

    console.log(payloadBody)
    let update = await API.postDev('EditProfile', true, payloadBody)
    simpleToast(update.failureMessage)
    if (update.success) {
      const dataToDispatch = {
        nama: update.data.nama,
        wanumber: update.data.wanumber,
      }

      this.props.editProfile(dataToDispatch)


    }

  }

  componentWillUnmount = () => {
    StatusBar.setBackgroundColor(Theme.default.secondaryColor)
    StatusBar.setBarStyle('light-content')
  }

  render() {
    const editing = this.state.initialValue.nama != this.state.value.nama || this.state.initialValue.email != this.state.value.email || this.state.initialValue.wanumber != this.state.value.wanumber
    const { value, focus } = this.state

    let imageSource = null
    if (this.props.auth.profile.foto_profil) {
      imageSource = { uri: `${ASSETS_URL}/users/foto_profil/${this.props.auth.profile.foto_profil}` }
    } else {
      imageSource = require('../../../../assets/images/default-user.png')
    }
    return (
      <View style={styles.container}>
        <Card style={styles.wrapper}>
          <View
            style={{
              width: w(20),
              height: w(20),
              position: 'absolute',
              right: fs(3),
              top: fs(3),
              overflow: 'hidden',
              borderRadius: w(10)
            }}
          >
            <TouchableOpacity
              onPress={this.selectPhotoTapped.bind(this)}
            >
              <Image
                source={imageSource}
                style={{
                  width: w(20),
                  height: w(20),
                  // position: 'absolute',
                  // right: fs(3),
                  // top: fs(3)
                }}
              />
              <View
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,.3)',
                  position: 'absolute',
                  justifyContent: 'center'
                }}
              >
                <Icon name="camera" color="white" size={fs(3)} style={{ alignSelf: 'center' }} />
              </View>

            </TouchableOpacity>
          </View>
          <Text style={styles.cardTitle}>Edit Profile</Text>
          <View style={styles.editForm}>
            <View style={styles.formInput}>
              <View style={styles.formIcon}>
                <Icon name="user" size={fs(2.1)} style={{ alignSelf: 'center' }} />
              </View>

              <View style={styles.formText}>
                <Text style={[
                  styles.formLabel,
                  focus == 'nama' && { color: '#6200ee' }
                ]}>Nama Lengkap</Text>
                <TextInput
                  value={value.nama}
                  style={[styles.formInputText,
                  {
                    borderColor: focus == 'nama' ? '#6200ee' : '#E2E2E2',
                    borderBottomWidth: 1.5
                  }
                  ]}
                  onFocus={() => this.setInputFocus('nama')}
                  onEndEditing={() => {
                    this.setInputFocus(null)
                    this.validateField('nama')
                  }}
                  onChangeText={(e) => this.setInputValue('nama', e)}
                />

                {this.state.error.nama && <Text style={{ color: 'red', fontSize: fs(1.5), marginTop: fs(1) }}>{this.state.error.nama}</Text>}
              </View>
            </View>


            <View style={styles.formInput}>
              <View style={styles.formIcon}>
                <Icon name="at" size={fs(2.1)} style={{ alignSelf: 'center' }} />
              </View>

              <View style={styles.formText}>
                <Text style={[
                  styles.formLabel,
                  focus == 'email' && { color: '#6200ee' }
                ]}>Email</Text>
                <TextInput
                  editable={false}
                  value={value.email}
                  onFocus={() => this.setInputFocus('email')}
                  onEndEditing={() => {
                    this.setInputFocus(null)
                    this.validateField('email')
                  }}
                  onChangeText={(e) => this.setInputValue('email', e)}
                  style={[styles.formInputText,
                  {
                    borderColor: focus == 'email' ? '#6200ee' : '#E2E2E2',
                    borderBottomWidth: 1.5
                  }
                  ]}

                />
              </View>
            </View>


            <View style={styles.formInput}>
              <View style={styles.formIcon}>
                <Icon name="whatsapp" size={fs(2.1)} style={{ alignSelf: 'center' }} />
              </View>

              <View style={styles.formText}>
                <Text style={styles.formLabel}>No WA</Text>
                <TextInput
                  value={value.wanumber}
                  keyboardType="phone-pad"
                  onFocus={() => this.setInputFocus('wanumber')}
                  maxLength={13}
                  onChangeText={(e) => this.setInputValue('wanumber', e)}
                  onEndEditing={() => {
                    this.setInputFocus(null)
                    this.validateField('wanumber')
                  }}
                  style={[styles.formInputText,
                  {
                    borderColor: focus == 'wanumber' ? '#6200ee' : '#E2E2E2',
                    borderBottomWidth: 1.5
                  }
                  ]}
                />

                {this.state.error.wanumber && <Text style={{ color: 'red', fontSize: fs(1.5), marginTop: fs(1) }}>{this.state.error.wanumber}</Text>}
              </View>
            </View>



            {/* <View style={styles.formInput}>
              <View style={styles.formIcon}>
                <Icon name="lock" size={fs(2.1)} style={{ alignSelf: 'center' }} />
              </View>

              <View style={styles.formText}>
                <Text style={styles.formLabel}>Password</Text>
                <TextInput
                  secureTextEntry={true}
                  value="Hendriyantooz"
                  style={[styles.formInputText,
                  {
                    borderColor: focus == 'wanumber' ? '#6200ee' : '#E2E2E2',
                    borderBottomWidth: 1.5
                  }
                  ]}
                />

              </View>
            </View> */}

            <TouchableOpacity
              disabled={!editing}
              style={{
                backgroundColor: editing ? Theme.default.primaryButton : `rgba(${Theme.default.primaryColorRGB}, 0.5)`,
                // paddingHorizontal: fs(3),
                paddingVertical: fs(1.5),
                borderRadius: 4,
                marginVertical: fs(1),
                width: w(50)
              }}
              onPress={this.updateProfile.bind(this)}
            >
              <Text style={{ color: 'white', alignSelf: 'center' }}>Simpan Perubahan</Text>
            </TouchableOpacity>

          </View>


        </Card>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    width: w(100),
    height: h(100),
    backgroundColor: 'white',
    paddingVertical: w(2, 5),
    paddingHorizontal: w(2.5)
  },

  wrapper: {
    borderRadius: 5,
    padding: fs(3)
  },

  cardTitle: {
    fontWeight: 'bold',
    fontSize: fs(2.5)
  },

  editForm: {
    width: '100%',
    marginTop: fs(5)
    // backgroundColor: 'yellow'
  },

  formInput: {
    borderColor: '#E2E2E2',
    // borderBottomWidth: 1,
    justifyContent: 'space-around',
    flexDirection: 'row',
    display: 'flex',
    marginVertical: fs(1)
  },

  formLabel: {
    fontSize: fs(1),
    color: 'grey'
  },

  formIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: fs(5),
    height: fs(5),
    backgroundColor: '#E2E2E2',
    borderRadius: 7,
  },

  formText: {
    alignSelf: 'flex-end',
    // borderBottomWidth: 1.5,
    // borderColor: '#E2E2E2',
    width: '80%',
  },

  formInputText: {
    // backgroundColor: 'red'
    height: 40,
    paddingTop: 1,
    paddingBottom: 5
  }
})

const mapStateToProps = (state) => ({
  auth: state.auth
})

const mapDispatchToProps = dispatch => {
  return {
    editProfile: (payload) => dispatch({ type: 'EDIT_PROFILE', profile: payload })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeProfile)
