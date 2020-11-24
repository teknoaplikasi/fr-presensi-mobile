import React from 'react'
import { View, Text } from 'react-native'
import { responsiveFontSize as fs } from 'react-native-responsive-dimensions'

const RNText = (props) => {
  return (
    <Text
      style={[
        props.h1 && { fontSize: fs(5) },
        props.h2 && { fontSize: fs(4.3) },
        props.h3 && { fontSize: fs(3.6) },
        props.h4 && { fontSize: fs(3) },
        props.h5 && { fontSize: fs(2.5) },
        props.h6 && { fontSize: fs(2) },
        props.bold && { fontWeight: 'bold' },
        props.italic && { fontStyle: 'italic' },
        { color: props.color }
      ]}
    >{props.children}</Text>
  )
}

RNText.defaultProps = {
  color: 'black'
}

export default React.memo(RNText)
