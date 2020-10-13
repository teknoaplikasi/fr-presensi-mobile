import React, { Component } from 'react'
import { Text, View, StyleSheet, ToastAndroid } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import { f } from '../../../utils/StyleHelper'

export class HomeIndex extends Component {

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

  takePicture = async () => {
    if (this.camera) {
      // console.log('button take picture')
      this.setState({ status: 'Mengambil wajah' })
      let options = { quality: 0.5, base64: false, width: 512 }
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

    let upload = await API.verification(this.state.image.uri, 'Edo')
    console.log(upload)
    if (upload.success) {
      this.presentToast(`Face ${upload.result.name}`)

    }

    // else {
    //   this.presentToast(upload.error.error_message)
    // }
    this.setState({ mode: 'waiting', status: 'Menunggu wajah' })
    console.log('upload', upload)
  }


  render() {
    return (
      <React.Fragment>
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

export default HomeIndex
