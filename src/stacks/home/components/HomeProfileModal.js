import React from 'react'
import { responsiveHeight as h, responsiveWidth as w, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { View, Text, TouchableOpacity as TouchableOpacityRN } from 'react-native'
import { Thumbnail } from 'native-base'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Modal from 'react-native-modal'

const HomeProfileModal = ({ visible, setSignoutModal, navigation, avatar, onLogout }) => {

  return (
    <Modal
      testID={'modal'}
      isVisible={visible}
      onBackButtonPress={setSignoutModal}
      backdropColor="rgba(0,0,0,.5)"
      backdropOpacity={0.8}
      animationInTiming={400}
      animationOutTiming={400}
      backdropTransitionInTiming={400}
      backdropTransitionOutTiming={600}
      onBackdropPress={setSignoutModal}
      style={{
        width: w(20),
        height: w(20)
      }}
    >
      <View
        style={{
          backgroundColor: 'white',
          width: w(80),
          borderRadius: fs(2),
          // paddingHorizontal: fs(5),
          marginLeft: w(5),
          paddingVertical: fs(5),
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Thumbnail large source={avatar} />
        <View style={{ width: '100%' }}>
          <TouchableOpacityRN
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => {
              // alert('profile page coming soom')
              setSignoutModal
              navigation.navigate('HomeProfile')
            }}
          >
            <Icon name="user" color="grey" size={fs(2.5)} />
            <Text style={{ color: 'grey', paddingVertical: fs(1), paddingHorizontal: fs(2) }}>Profil</Text>
          </TouchableOpacityRN>

          <TouchableOpacityRN
            style={{
              backgroundColor: 'red',
              justifyContent: 'center',
              marginHorizontal: fs(2),
              marginTop: fs(2),
              borderRadius: 5,
              paddingVertical: fs(1.3)
            }}
            onPress={onLogout}
          >
            <Text style={{ color: 'white', textAlign: 'center', width: '100%' }}>Logout</Text>
          </TouchableOpacityRN>
        </View>
      </View>

    </Modal >
  )
}

export default React.memo(HomeProfileModal)
