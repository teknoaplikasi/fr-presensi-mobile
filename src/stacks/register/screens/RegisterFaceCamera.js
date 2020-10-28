import React, { Component } from 'react'
import { Text, View, StyleSheet, Button, ImageBackground, ToastAndroid, StatusBar, ActivityIndicator, Image } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useHeaderHeight } from '@react-navigation/stack'
import { AzureFaceAPI } from '../../../utils/Azure'
import { AZURE_BASE_URL, AZURE_KEY } from '../../../../config'
import RNFS from 'react-native-fs'
import Chip from '../../../components/Chip'
import { connect } from 'react-redux'

export class RegisterFaceCamera extends Component {
  constructor() {
    super()

    this.state = {
      mode: 'waiting',
      status: 'Place your face inside rectangle',
      image: null,
      registerStatus: null,
      registerStatusMsg: ''
    }

    this.takePicture = this.takePicture.bind(this)
    this.registerImage = this.registerImage.bind(this)
  }

  componentDidMount = () => {
    this.initValue()

    this.isFocus = this.props.navigation.addListener('focus', () => {
      // this.camera.
      this.initValue()
    })
  }

  initValue = async () => {
    StatusBar.setBackgroundColor('#ffac1f')
    StatusBar.setBarStyle('light-content')


    // StatusBar.setHidden(true)
  }

  componentWillUnmount() {
    // this.camera
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 1, base64: false }
      const data = await this.camera.takePictureAsync(options)
      this.setState({ image: data }, () => {
        this.registerImage()
      })

    }
  }

  registerImage = async () => {
    let upload = await AzureFaceAPI.detect(this.state.image.uri)

    if (!upload.success)
      return this.presentToast(upload.error.error_message)

    if (upload.result.length == 0)
      return this.presentToast('Tidak ada wajah terdeteksi')

    console.log(upload.result)
    const faceId = upload.result[0].faceId
    let register = await API.get('register-face', false, {
      faceId: faceId
    })


    this.setState({ registerStatus: register.success })

    if (!register.success) {
      this.setState({ registerStatus: false, registerStatusMsg: 'Registrasi Wajah Gagal' })
      this.presentToast('Registrasi Wajah gagal, coba lagi')
    }

    await this.props.setFaceId(faceId)


  }

  presentToast = (message) => {
    return ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    )
  }

  _renderImagePreview() {
    return (
      <ImageBackground
        source={{ uri: this.state.image.uri }}
        style={{
          width: w(100),
          position: 'relative',
          height: h(100)
        }}
      >

        <View style={{
          position: 'absolute',
          bottom: h(15),
          left: w(50 - 12.5)
        }}>
          <TouchableOpacity onPress={this.registerImage} style={{
            backgroundColor: 'green',
            borderRadius: w(12.5),
            width: w(25),
            height: w(25),
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Icon name="check" color="#ffffff" size={fs(5)} style={{ alignSelf: 'center' }} />
          </TouchableOpacity>


        </View>



        <View style={{
          position: 'absolute',
          bottom: h(17),
          right: w(10)
        }}>
          <TouchableOpacity onPress={() =>
            this.setState({ mode: 'waiting' })} style={{
              backgroundColor: 'white',
              borderRadius: w(12.5),
              width: w(12),
              height: w(12),
              display: 'flex',
              justifyContent: 'center'
            }}>
            <Icon name="redo-alt" color="grey" size={fs(3)} style={{ alignSelf: 'center' }} />
          </TouchableOpacity>


        </View>
      </ImageBackground>
    )
  }

  render() {
    // const headerHeight = useHeaderHeight()
    return (
      <React.Fragment>
        {this.state.mode == 'previewnn' && this._renderImagePreview()}
        <View style={styles.container}>
          <RNCamera
            ref={ref => {
              this.camera = ref
            }}
            type={RNCamera.Constants.Type.front}
            style={styles.cameraView}
            androidCameraPermissionOptions={{
              title: 'Permission to use Camera',
              message: 'App name need your permission to use camera',
              buttonPositive: 'Grant',
              buttonNegative: 'Deny'
            }}
            onFacesDetected={(face) => {
              // console.log('face', face.faces[0])

              if (this.state.mode == 'waiting' && face.faces[0].rollAngle < 3 && face.faces[0].rollAngle > -3 && face.faces[0].rightEyeOpenProbability > 0.8 && face.faces[0].leftEyeOpenProbability > 0.8 && face.faces[0].yawAngle < 3 && face.faces[0].yawAngle > -3) {
                // this.presentToast('Masuk')
                this.setState({ mode: 'preview', status: 'Analyze your face' }, () => {
                  this.takePicture()
                })
              }
            }}
            faceDetectionClassifications={RNCamera.Constants.FaceDetection.Classifications.all}
            faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.accurate}
          >

            <ImageBackground
              source={require('../../../../assets/images/face-recognition-camera.png')}
              style={{
                width: w(100),
                height: h(100),
              }}
            >

              {this.state.mode == 'preview' && this.state.image &&
                <ImageBackground

                  source={{ uri: this.state.image.uri }}
                  style={{
                    width: w(100),
                    height: h(100),
                    zIndex: -1,
                    transform: [
                      { rotateY: "180deg" }
                    ]
                  }}
                >

                </ImageBackground>
              }
              <View
                style={{
                  position: 'absolute',
                  top: h(50),
                  width: w(100),
                  alignItems: 'center',
                  transform: [
                    { translateY: fs(-28) }
                  ]
                }}
              >
                <View
                  style={{
                    flexDirection: 'row'
                  }}
                >
                  {this.state.mode == 'preview' && <ActivityIndicator
                    color="#ffac1f"
                    style={{
                      alignSelf: 'flex-start',
                      marginRight: fs(1)
                    }}
                  />}
                  <Text
                    style={{
                      color: '#ffac1f',
                      textAlign: 'center',
                      alignSelf: 'flex-end'
                    }}
                  >{this.state.status}</Text>
                </View>
              </View>


              {this.state.registerStatus &&
                <View
                  style={{
                    marginTop: fs(4),
                    position: 'absolute',
                    top: h(50),
                    width: w(100),
                    alignItems: 'center',
                    transform: [
                      { translateY: fs(25) }
                    ]
                  }}
                >
                  <Chip
                    bgColor="#ffac1f"
                    textColor="#000"
                    icon="smile"
                    text="Data wajah berhasil ditambahkan"
                  />
                </View>
              }

              {this.state.mode == 'preview' && this.state.registerStatus == false &&
                <View
                  style={{
                    position: 'absolute',
                    top: h(50),
                    width: w(100),
                    alignItems: 'center',
                    flexDirection: 'column',
                    transform: [
                      { translateY: fs(25) }
                    ]
                  }}
                >
                  <View>
                    <Chip
                      bgColor="#ff0000"
                      textColor="#fff"
                      icon="frown"
                      text={this.state.registerStatusMsg}
                    />
                  </View>


                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        mode: 'waiting',
                        image: null,
                        status: 'Place your face inside rectangle'
                      })
                    }}
                  >

                    <Chip
                      bgColor="#fff"
                      textColor="#000"
                      icon="redo-alt"
                      text="ULANGI"
                    />
                  </TouchableOpacity>
                </View>

              }
            </ImageBackground>
          </RNCamera>
        </View>
      </React.Fragment>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: w(100),
    height: h(100),
    display: 'flex'

  },

  cameraView: {
    width: '100%',
    height: '100%',
    position: 'relative'
  }
})

const mapStateToProps = (state) => ({
  ...state
})

const mapDispatchToProps = dispatch => {
  return {
    setFaceId: (payload) => dispatch({ type: 'SET_FACE_ID', faceId: payload })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterFaceCamera)
