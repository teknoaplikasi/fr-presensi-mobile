import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'

const Loading = ({ message, color, rIf }) => {
  if (!rIf) return null
  return (
    <View style={styles.backdrop}>
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size={fs(4)} color={color} />
        <Text
          style={{
            alignSelf: 'center',
            paddingLeft: fs(1),
            fontWeight: 'normal'
          }}
        >{message}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,.5)',
    position: 'absolute',
    zIndex: 999,
    width: w(100),
    height: h(100),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },

  loadingWrapper: {
    backgroundColor: 'white',
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: fs(4),
    paddingVertical: fs(2),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,

    elevation: 8,
  }
})

Loading.defaultProps = {
  message: 'Please wait . . .',
  color: 'blue'
}

export default React.memo(Loading)
