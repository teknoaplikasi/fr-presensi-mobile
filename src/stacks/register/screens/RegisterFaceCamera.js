import React, { Component } from 'react'
import { Text, View, StyleSheet, ImageBackground, ToastAndroid, StatusBar, ActivityIndicator, Image, Linking } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useHeaderHeight } from '@react-navigation/stack'
import { AzureFaceAPI } from '../../../utils/Azure'
import { AZURE_BASE_URL, AZURE_KEY } from '../../../../config'
import Chip from '../../../components/Chip'
import { connect } from 'react-redux'
import { Button } from 'native-base'
import { simpleToast } from '../../../utils/DisplayHelper'
import Sound from 'react-native-sound'

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
    this.beep = new Sound(require('../../../../assets/sound/beep.wav'))
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
    this.isFocus()
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: false }
      const data = await this.camera.takePictureAsync(options)
      this.setState({ image: data }, () => {
        this.registerImage()
      })

    }
  }

  registerImage = async () => {
    let upload = await AzureFaceAPI.detect(this.state.image.uri)
    // console.log(JSON.stringify(upload))
    if (!upload.success)
      return this.presentToast(upload.error.error_message)

    if (upload.result.length == 0)
      return this.presentToast('Tidak ada wajah terdeteksi')

    const faceId = upload.result[0].faceId
    let register = await API.registerFace(this.state.image.uri, this.props.auth.profile.id, faceId)

    if (!register.success) {

      this.setState({ registerStatus: false, registerStatusMsg: 'Registrasi Wajah Gagal' })
      return simpleToast('Gagal mendaftarkan wajah. Coba beberapa saat lagi')
    }


    this.props.editProfile({
      face_registered: 'Y',
      face_status: 'W'
    })
    this.props.setFaceId(faceId)

    this.setState({
      registerStatus: true,
      registerStatusMsg: 'Registrasi Wajah Berhasil'
    })

    this.beep.play()

    await this.sleep(1000)

    this.props.navigation.pop()


  }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  presentToast = (message) => {
    return ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    )
  }

  _renderNotAuthorizedView = () => {
    return (
      <View
        style={{
          width: w(100),
          height: h(100),
          backgroundColor: 'white',
          justifyContent: 'center'
        }}
      >
        <Image
          source={require('../../../../assets/images/no-permission.png')}
          style={{
            alignSelf: 'center'
          }}
        />

        <Text style={{ fontWeight: 'bold', alignSelf: 'center', fontSize: fs(2.5), marginVertical: fs(3) }}>Akses Kamera Ditolak</Text>
        <Text style={{ alignSelf: 'center', textAlign: 'center', width: w(70) }}>Aplikasi presensi need akses kamera pada device anda. Buka setting dan izinkan permission camera</Text>

        <Button
          primary
          rounded
          full
          style={{
            alignSelf: 'center',
            marginHorizontal: fs(1),
            marginVertical: fs(2),
            maxWidth: w(70),
            borderRadius: fs(3)
          }}
          onPress={() => {
            Linking.openSettings()
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>BUKA PENGATURAN APLIKASI</Text>
        </Button>
        {/* <Button
          light
          rounded
          style={{
            alignSelf: 'center',
            marginHorizontal: fs(1),
            paddingHorizontal: fs(5),
            maxWidth: w(70),
            borderRadius: fs(3)
          }}
          onPress={() => {
            this.forceUpdate()
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>REFRESH</Text>
        </Button> */}
      </View>

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

    const xLeft = w(6) + fs(2)
    const xRight = w(94) - fs(4)
    const yTop = ((h(100) - w(90)) / 2) + fs(5)
    const yBottom = yTop + w(90) - fs(5)
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
            // androidCameraPermissionOptions={{
            //   title: 'Permission to use Camera',
            //   message: 'App name need your permission to use camera',
            //   buttonPositive: 'Grant',
            //   buttonNegative: 'Deny'
            // }}
            notAuthorizedView={this._renderNotAuthorizedView()}
            onFacesDetected={(ml) => {
              // console.log('face', face.faces[0])
              const face = ml.faces[0]

              if (

                !this.state.alertLocation &&
                this.state.mode == 'waiting' &&
                face.rollAngle < 7 &&
                face.rollAngle > -7 &&
                face.rightEyeOpenProbability > 0.8 &&
                face.leftEyeOpenProbability > 0.8 &&
                face.yawAngle < 7 &&
                face.yawAngle > -7 &&

                face.bounds.origin.x > xLeft &&
                face.bounds.origin.x + face.bounds.size.width < xRight &&
                face.bounds.origin.y > yTop &&
                face.bounds.origin.y + face.bounds.size.height < yBottom
              ) {
                // this.presentToast('Masuk')
                this.setState({ mode: 'preview', status: 'Analyze your face' }, () => {
                  this.takePicture()
                })
              }
            }}
            faceDetectionClassifications={RNCamera.Constants.FaceDetection.Classifications.all}
            faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.fast}
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
  ...state,
  auth: state.auth
})

const mapDispatchToProps = dispatch => {
  return {
    setFaceId: (payload) => dispatch({ type: 'SET_FACE_ID', faceId: payload }),
    editProfile: (payload) => dispatch({ type: 'EDIT_PROFILE', profile: payload })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RegisterFaceCamera)
