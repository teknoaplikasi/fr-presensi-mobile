
import React from 'react'
import { View, Text, Image, Linking } from 'react-native'
import Modal from 'react-native-modal'
import { Button } from 'native-base'
import { responsiveWidth as w, responsiveFontSize as fs, responsiveHeight as h } from 'react-native-responsive-dimensions'

class LocationNotAvailable extends React.Component {
  constructor() {
    super()

    this.askLocationRequest = this.askLocationRequest.bind(this)
  }

  askLocationRequest = async () => {
    // Linking.openURL('App-Prefs:')
    // Linking.openURL('App-Prefs:LOCATION_SERVICES')
    Linking.openSettings()

  }
  render() {
    if (!this.props.rIf) return null
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
            <Image
              source={require('../../assets/images/no-permission.png')}
              style={{
                width: '30%',
                alignSelf: 'center'
              }}
              resizeMode="contain"
            />

            <Text style={{ fontWeight: 'bold', fontSize: fs(2.5), alignSelf: 'center' }}>Lokasi Tidak Aktif</Text>

            <Text style={{
              alignSelf: 'center',
              width: '80%',
              textAlign: 'center',
              marginVertical: fs(1.5),
              color: '#8c8c8c'
            }}>Aplikasi Presensi membutuhkan akses lokasi untuk melakukan presensi. Aktifkan Layanan Lokasi pada device anda lalu buka aplikasi</Text>

            <Button
              primary
              rounded
              onPress={this.askLocationRequest}
              style={{
                paddingHorizontal: fs(5),
                alignSelf: 'center'
              }}
            >
              <Text style={{ color: '#fff' }}>Aktifkan Lokasi</Text>
            </Button>
          </View>
        </View>

      </Modal >
    )
  }
}

LocationNotAvailable.defaultProps = {
  rIf: false
}


export default LocationNotAvailable
