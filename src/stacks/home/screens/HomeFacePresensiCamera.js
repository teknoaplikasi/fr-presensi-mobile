import React, { Component } from 'react'
import { Text, View, StyleSheet, ImageBackground, ToastAndroid, StatusBar, ActivityIndicator, Image, Modal, BackHandler } from 'react-native'
import { Button } from 'native-base'
import { RNCamera } from 'react-native-camera'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { AzureFaceAPI } from '../../../utils/Azure'
import Chip from '../../../components/Chip'
import Geolocation from '@react-native-community/geolocation'
import { geocodeLatLong, shortestDistance } from '../../../utils/GeolocationHelper'
import { simpleToast } from '../../../utils/DisplayHelper'
import { connect } from 'react-redux'
import Sound from 'react-native-sound'
import moment from 'moment'

export class HomeFacePresensiCamera extends Component {
  constructor() {
    super()

    this.state = {
      mode: 'waiting',
      status: 'Place your face inside rectangle',
      image: null,
      registerStatus: null,
      registerStatusMsg: 'Presensi gagal dilakukan',
      location: {
        latitude: null,
        longitude: null,
        detail: ''
      },
      alertLocation: false,
      companyLocation: {
        id: null
      }
    }

    this.takePicture = this.takePicture.bind(this)
    this.registerImage = this.registerImage.bind(this)
    this.getCurrentLocation = this.getCurrentLocation.bind(this)
    this.validateLocation = this.validateLocation.bind(this)

    this.beep = new Sound(require('../../../../assets/sound/beep.wav'))
  }

  componentDidMount = () => {
    this.initValue()
    this.getCurrentLocation()
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton)

    this.isFocus = this.props.navigation.addListener('focus', () => {
      this.initValue()
      this.getCurrentLocation()
    })
  }

  initValue = async () => {
    StatusBar.setBackgroundColor('#ffac1f')
    StatusBar.setBarStyle('light-content')
  }

  handleBackButton = () => {
    if (this.state.mode == 'preview' && this.state.registerStatus == null)
      return true
    else
      return false
  }

  getCurrentLocation = async () => {
    Geolocation.getCurrentPosition(async ({ coords }) => {
      this.setState(prevState => ({
        location: {
          ...prevState.location,
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      }), () =>
        this.validateLocation())
    })
  }

  componentWillUnmount() {
    this.camera
    this.isFocus()
    BackHandler.removeEventListener('hardwareBackPress')
  }

  validateLocation = async () => {
    if (!this.props.auth.company.latitude || !this.props.auth.company.longitude) {
      return simpleToast('Lokasi perusahaan belum diatur. Hubungi admin')
    }
    const deviceCoord = {
      latitude: this.state.location.latitude,
      longitude: this.state.location.longitude
    }

    console.log(this.props.presensi.presensi_conf)
    const check = await shortestDistance(deviceCoord, this.props.presensi.presensi_conf)
    const isValid = !check.presensiProhibited
    if (!isValid) {
      this.setState({
        alertLocation: true,
        companyLocation: check.shortestDistance
      })
    }

    else {
      this.setState({
        alertLocation: false,
        companyLocation: check.shortestDistance
      })
    }

    const locationDetail = await geocodeLatLong(this.state.location.latitude, this.state.location.longitude)
    this.setState(prevState => ({
      location: {
        ...prevState.location,
        detail: locationDetail.result
      }
    }))
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.2, base64: false }
      const data = await this.camera.takePictureAsync(options)
      this.setState({ image: data }, () => {
        this.faceRecognize()
      })
    }
  }

  registerImage = async () => {
    let upload = await AzureFaceAPI.detect(this.state.image.uri)
    this.setState({ registerStatus: upload.success })

    if (!upload.success) {
      return this.presentToast(upload.error.error_message)
    }
  }

  faceRecognize = async () => {

    if (!this.props.auth.company.latitude || !this.props.auth.company.longitude) {
      return this.setState({
        registerStatus: false,
        registerStatusMsg: 'Lokasi perusahaan belum diatur. Hubungi admin'
      })
    }
    const face1 = this.props.auth.faceId
    if (!face1 && typeof (this.props.auth.faceId != 'string')) {
      return this.setState({ registerStatus: false, registerStatusMsg: 'Presensi gagal. Silahkan hubungi admin' })
    }
    let faceId2 = await AzureFaceAPI.detect(this.state.image.uri)

    if (!faceId2.success)
      return this.setState({ registerStatus: faceId2.success, registerStatusMsg: 'Presensi gagal. Coba beberapa saat lagi' })

    if (faceId2.result.length == 0) {
      return this.setState({ registerStatus: faceId2.success, registerStatusMsg: 'Presensi gagal, tidak ada wajah terdeteksi' })
    }
    const faceIdStr = faceId2.result[0].faceId
    let faceVerify = await AzureFaceAPI.verify(face1, faceIdStr)
    if (!faceVerify.success) {
      return this.setState({ registerStatus: faceVerify.success, registerStatusMsg: faceVerify.error.error.message ? faceVerify.error.error.message : 'Presensi gagal. Coba beberapa saat lagi' })
    }

    //success
    if (!faceVerify.result.valid) {
      return this.setState({ registerStatus: faceVerify.result.valid, registerStatusMsg: 'Presensi gagal. Face ID tidak sesuai' })
    }

    const payload = {
      perusahaan_id: parseInt(this.props.auth.profile.perusahaan_id),
      tanggal: moment().format('YYYY-MM-DD'),
      jam: moment().format('HH:mm:ss'),
      latitude: this.state.location.latitude,
      longitude: this.state.location.longitude,
      flag: this.props.route.params.flag,
      lokasi_id: this.state.companyLocation.id,
      lokasi: this.state.location.detail
    }

    let submit = await API.postDev('add/kehadiran', true, payload)
    if (!submit.success) {
      return this.setState({
        registerStatus: submit.success,
        registerStatusMsg: submit.failureMessage
      })
    }
    this.beep.play()
    this.setState({
      registerStatus: true,
      registerStatusMsg: 'Presensi Berhasil'
    })
    this.props.setLastPresensi(payload)
    await this.sleep(2000)
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

  renderModal() {
    const primaryText = '#705499'
    const buttonColor = '#6200ee'
    return (
      <Modal
        testID={'modal'}
        isVisible={this.state.alertLocation}
        onBackButtonPress={() => {
          this.setState({ alertLocation: false }, () => {
            this.props.navigation.pop()
          })
        }}
        backdropColor="rgba(0,0,0,.5)"
        backdropOpacity={0.8}
        animationIn="zoomInDown"
        animationOut="zoomOutUp"
        animationInTiming={400}
        animationOutTiming={400}
        backdropTransitionInTiming={400}
        backdropTransitionOutTiming={600}
        transparent
      >
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,.5)',
            width: w(100),
            height: h(100),
            flex: 1,
            flexDirection: 'column',
            height: h(100),
            justifyContent: 'center',
            alignSelf: 'center',
          }}
        >
          <View
            style={{
              width: w(80),
              height: 'auto',
              backgroundColor: 'white',
              paddingHorizontal: fs(5),
              borderRadius: fs(2),
              paddingVertical: fs(5),
              alignSelf: 'center'
            }}
          >
            <Text style={{ fontWeight: 'bold', fontSize: fs(2.8), textAlign: 'center' }}>Presensi Ditolak</Text>
            <Text style={{ marginTop: fs(2), fontSize: fs(1.7), textAlign: 'center' }}>Presensi hanya dapat dilakukan radius {this.state.radius} meter dari lokasi perusahaan. Pastikan blabla dan coba lagi</Text>
            <View style={{
              paddingTop: fs(5),
              flexDirection: 'column',
              width: '100%',
            }}>
              <Button
                style={{
                  backgroundColor: '#fafafa',
                  width: '100%',
                  justifyContent: 'center',
                  borderRadius: 5,
                  marginTop: fs(1.5)
                }}

                onPress={() => {
                  this.setState({ alertLocation: false }, () => {

                    this.props.navigation.pop()
                  })
                }}
              >
                <Text style={{ color: 'black' }}>Kembali</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    // alert(this.props.route.params.flag)
    const xLeft = w(6)
    const xRight = w(94)
    const yTop = ((h(100) - w(90)) / 2)
    const yBottom = yTop + w(90)
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
            whiteBalance={RNCamera.Constants.WhiteBalance.auto}
            playSoundOnCapture={false}
            androidCameraPermissionOptions={{
              title: 'Permission to use Camera',
              message: 'App name need your permission to use camera',
              buttonPositive: 'Grant',
              buttonNegative: 'Deny'
            }}
            onFacesDetected={(ml) => {
              const face = ml.faces[0]
              // console.log('face', face.faces[0])
              if (
                !this.state.alertLocation &&
                this.state.mode == 'waiting' &&
                face.rollAngle < 10 &&
                face.rollAngle > -10 &&
                face.rightEyeOpenProbability > 0.5 &&
                face.leftEyeOpenProbability > 0.5 &&
                face.yawAngle < 10 &&
                face.yawAngle > -10 &&

                face.bounds.origin.x > xLeft &&
                face.bounds.origin.x + face.bounds.size.width < xRight &&
                face.bounds.origin.y > yTop &&
                face.bounds.origin.y + face.bounds.size.height < yBottom
              ) {
                // return this.beep.play()
                this.setState({ mode: 'preview', status: 'Analyze your face' }, () => {
                  this.takePicture()
                })
              }
            }}
            faceDetectionClassifications={RNCamera.Constants.FaceDetection.Classifications.all}
            faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.fast}
          >
            {/* <View
              style={{ position: 'absolute', width: 1, height: w(90), backgroundColor: 'red', left: xLeft, top: yTop }}
            />
            <View
              style={{ position: 'absolute', width: 1, height: w(90), backgroundColor: 'red', left: xRight, top: yTop }}
            />
            <View
              style={{ position: 'absolute', width: w(90), height: 1, backgroundColor: 'red', left: xLeft, top: yTop }}
            />
            <View
              style={{ position: 'absolute', width: w(90), height: 1, backgroundColor: 'red', left: xLeft, top: yBottom }}
            /> */}


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
              {this.state.registerStatus == null && <View
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
              </View>}


              {this.state.alertLocation ? this.renderModal() : null}
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
                    text="Presensi berhasil"
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
                        registerStatus: null,
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
    // flexDirection: 'row',
  }
})

const mapStateToProps = (state) => ({
  auth: state.auth,
  presensi: state.presensi
})

const mapDispatchToProps = dispatch => {
  return {
    setLastPresensi: (payload) => dispatch({ type: 'SET_LAST_PRESENSI', payload: payload })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeFacePresensiCamera)
