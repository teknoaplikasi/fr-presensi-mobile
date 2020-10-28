import React from 'react'
import { View, Text } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { responsiveScreenFontSize as fs } from 'react-native-responsive-dimensions'

const Chip = ({ bgColor, textColor, text, icon }) => {
  return (

    <View style={{
      backgroundColor: bgColor,
      // width: '80%',
      marginVertical: fs(1),
      paddingVertical: fs(1.5),
      paddingHorizontal: fs(3),
      justifyContent: 'center',
      borderRadius: fs(10),
      overflow: 'hidden',
      flexDirection: 'row'
    }}>
      <Icon name={icon} color={textColor} size={fs(2.5)} style={{ paddingRight: fs(2) }} />
      <Text style={{
        color: textColor,
        fontWeight: 'bold',
        fontSize: fs(1.8)
      }}>{text}</Text>
    </View>
  )
}

export default React.memo(Chip)
