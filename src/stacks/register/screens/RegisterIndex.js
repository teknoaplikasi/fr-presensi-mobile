import React, { Component } from 'react'
import { Text, View, StyleSheet, Button, ImageBackground, ToastAndroid } from 'react-native'
import { RNCamera } from 'react-native-camera'
import { TouchableOpacity } from 'react-native-gesture-handler'

import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import Icon from 'react-native-vector-icons/FontAwesome5'

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

  componentDidMount = () => {
    this.props.navigation.setOptions({
      tabBarVisible: false
    })
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
        <View>
          <Button
            title="Register"
            onPress={() => {
              this.props.navigation.navigate('RegisterFace')
            }}
          />
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

export default RegisterIndex
