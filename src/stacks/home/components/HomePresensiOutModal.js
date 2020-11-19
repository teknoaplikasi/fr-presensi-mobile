import React from 'react'
import { View, Text } from 'react-native'
import moment from 'moment'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { Badge, Button } from 'native-base'
import Modal from 'react-native-modal'
import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'

const HomePresensiOutModal = ({ data, homeProps, setLogoutModal, hideLogoutModal, navigation }) => {
  const durasiKerja = `${parseInt(moment(`${data.tanggal} ${data.jam}`).format('H')) - parseInt(moment().format('H'))} jam`

  // const { home, hideLogoutAlert } = this.props
  const primaryText = '#705499'
  const buttonColor = '#6200ee'
  return (
    <Modal
      testID={'modal'}
      isVisible={homeProps.logoutAlert}
      onBackButtonPress={setLogoutModal}
      backdropColor="rgba(0,0,0,.5)"
      backdropOpacity={0.8}
      animationInTiming={400}
      animationOutTiming={400}
      backdropTransitionInTiming={400}
      backdropTransitionOutTiming={600}
    >
      <View
        style={{
          backgroundColor: 'white',
          width: w(90),
          borderRadius: fs(2),
          paddingHorizontal: fs(5),
          paddingVertical: fs(5),
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Icon name="stopwatch" color="green" size={fs(5)} />
        <Text style={{ fontWeight: 'bold', color: primaryText }}>Presensi Masuk {data.jam} WIB</Text>
        <Text style={{ color: primaryText, fontSize: fs(1.5), textAlign: 'center' }}>di {data.lokasi}</Text>

        <Badge warning style={{ alignSelf: 'center', marginBottom: fs(4), marginTop: fs(2) }}>
          <Text>Durasi {durasiKerja}</Text>
        </Badge>
        <Text style={{ color: primaryText, fontWeight: 'bold', fontSize: fs(1.7), textAlign: 'center' }}>Anda akan melakukan presensi keluar, apakah anda yakin?</Text>
        <View style={{
          paddingTop: fs(5),
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <Button
            style={{
              alignSelf: 'flex-start',
              backgroundColor: 'white',
              justifyContent: 'center',
              elevation: 0,
              width: '50%'
            }}
            onPress={hideLogoutModal}
          >
            <Text style={{ color: buttonColor, fontWeight: 'bold' }}>BATALKAN</Text>
          </Button>
          <Button
            style={{
              backgroundColor: buttonColor,
              width: '50%',
              justifyContent: 'center',
              borderRadius: 5
            }}
            onPress={() => {
              navigation.navigate('HomeFacePresensiCamera', {
                flag: isPresensiIn ? 'I' : 'O',
                presensiProhibited: presensiProhibited,
                radius: presensiRadius
              })
              hideLogoutModal()

            }}
          >
            <Text>KELUAR</Text>
          </Button>
        </View>
      </View>
    </Modal>
  )
}

export default React.memo(HomePresensiOutModal)
