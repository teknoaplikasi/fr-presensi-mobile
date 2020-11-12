import React, { Component } from 'react'
import { Text, View } from 'react-native'
import Modal from 'react-native-modal'
import { responsiveWidth as w, responsiveFontSize as fs, responsiveHeight as h } from 'react-native-responsive-dimensions'

export class MediaPicker extends Component {
  render() {
    return (
      <Modal
        testID={'modal'}
        isVisible={this.props.rIf}
        onBackButtonPress={null}
        backdropColor="rgba(0,0,0,.5)"
        backdropOpacity={0.8}
        animationInTiming={400}
        animationOutTiming={400}
        backdropTransitionInTiming={400}
        backdropTransitionOutTiming={600}
        onBackdropPress={null}
        style={{
          width: w(100),
          height: h(100),
          left: fs(-2.5),
          top: fs(-2.5),
          position: 'absolute',
          justifyContent: 'flex-end'
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            width: '100%',
            borderTopRightRadius: fs(3),
            borderTopLeftRadius: fs(3),
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <View style={{ width: '100%', height: h(50), paddingVertical: fs(1.5) }}>
            <Text>Picker</Text>
          </View>

        </View>
      </Modal>
    )
  }
}

export default MediaPicker
