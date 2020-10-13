import React, { Component } from 'react'
import { Text, View, StyleSheet, Button, ImageBackground, ToastAndroid } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'

export class RegisterIndex extends Component {
  constructor() {
    super()

    this.state = {
      mode: 'waiting',
      image: null
    }

    this.takePicture = this.takePicture.bind(this)
    this.registerImage = this.registerImage.bind(this)
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: false, width: 512 }
      const data = await this.camera.takePictureAsync(options)
      console.log('data', data)
      this.setState({ image: data, mode: 'preview' })
    }
  }

  registerImage = async () => {
    let upload = await API.upload(this.state.image.uri, 'Edo')
    // console.log('')
    console.log(upload)
  }


  render() {
    return (
      <React.Fragment>
        {this.state.mode == 'preview' &&
          <ImageBackground
            source={{ uri: this.state.image.uri }}
            style={{
              width: w(100),
              height: h(100)
            }}
          >
            <Button
              title="Upload"
              onPress={this.registerImage}
            />

            <Button
              title="Retake"
              onPress={() => {
                this.setState({ mode: 'waiting' })
              }}
            />
          </ImageBackground>

        }
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
          >
            {/* <Button
              title="Take Picture"
              onPress={this.takePicture}
            /> */}


            <TouchableOpacity style={{
              backgroundColor: 'rgba(0,0,0,.5)',
              borderRadius: w(15),
              width: w(30),
              height: w(30),
              position: 'absolute',
              // left: w(0),
              // top: h(50)
            }}>
              <Text>Test</Text>
            </TouchableOpacity>
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
    backgroundColor: 'gray',
    position: 'relative'
  }
})

export default RegisterIndex
