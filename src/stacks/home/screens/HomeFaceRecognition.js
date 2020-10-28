import React, { Component } from 'react'
import { Text, View, StyleSheet, ToastAndroid, StatusBar, ImageBackground } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { connect } from 'react-redux'
import { API } from '../../../utils/Api'
import { AzureFaceAPI } from '../../../utils/Azure'
import { simpleToast } from '../../../utils/DisplayHelper'
import { f } from '../../../utils/StyleHelper'

export class HomeFaceRecognition extends Component {

  constructor() {
    super()
    this.state = {
      mode: 'waiting',
      image: null,
      status: 'Menunggu Wajah'
    }

    this.takePicture = this.takePicture.bind(this)
    this.faceRecognize = this.faceRecognize.bind(this)
  }


  componentDidMount = () => {
    this.isFocus = this.props.navigation.addListener('focus', () => {
      StatusBar.setHidden(true)
    })
  }

  componentWillUnmount() {
    StatusBar.setHidden(false)
    this.isFocus()
  }

  takePicture = async () => {
    if (this.camera) {
      // console.log('button take picture')
      this.setState({ status: 'Mengambil wajah' })
      let options = { quality: 0.5, base64: true, width: 128, height: 128 }
      let data = await this.camera.takePictureAsync(options)
      this.setState({ image: data, mode: 'recognize' }, () => {
        this.faceRecognize()
      })
    }
  }


  presentToast = (message) => {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.TOP,
    )
  }

  faceRecognize = async () => {
    this.setState({ status: 'Mengenali wajah' })
    const face1 = this.props.auth.faceId ? this.props.auth.faceId : 'd5998bbf-3d37-405c-8e1b-392cdd893d8a'
    let faceId2 = await AzureFaceAPI.detect(this.state.image.uri)
    // if (!faceId2.success)
    //   return simpleToast(faceId2.error.error_message)

    // if (faceId2.result.length == 0)
    //   return simpleToast('Tidak ada wajah terdeteksi')
    console.log('faceid 2', JSON.stringify(faceId2))
    const faceIdStr = faceId2.result[0].faceId
    let isValid = await AzureFaceAPI.verify(face1, faceIdStr)
    console.log('isvalid', JSON.stringify(isValid))

    // console.log('face', detectFaceId)
    // let verify = await AzureFaceAPI.verify(face1, )
    // console.log(upload)
    // if (detectFaceId.success) {
    //   this.presentToast(`Face ${upload.result.name}`)

    // }

    // else {
    //   this.presentToast(upload.error.error_message)
    // }
    // this.setState({ mode: 'waiting', status: 'Menunggu wajah' })
    // console.log('upload', upload)
  }


  render() {
    return (
      <React.Fragment>
        {/* {this.state.mode == 'recognize' && <ImageBackground
          source={{ uri: this.state.image.uri }}
          style={{
            width: w(100),
            height: h(100)
          }}
        />} */}
        <View style={styles.container}>
          <RNCamera
            // playSoundOnCapture={false}
            // captureAudio={false}
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
            onFacesDetected={() => {
              if (this.state.mode == 'waiting') {

                this.setState({ mode: 'capturing', status: 'Wajah terdeteksi' })
                this.takePicture()
              }
            }}
          >

            <Text style={{
              backgroundColor: 'rgba(172,172,172,.5)',
              paddingVertical: fs(1),
              paddingHorizontal: fs(2),
              fontWeight: 'bold',
              color: 'green',
              alignSelf: 'flex-end'
            }}>{this.state.status}</Text>
          </RNCamera>

        </View>
      </React.Fragment>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: w(100),
    display: 'flex',
    height: h(100),

  },

  cameraView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'gray'
  }
})

const mapStateToProps = (state) => ({
  auth: state.auth
})

export default connect(mapStateToProps, null)(HomeFaceRecognition)
