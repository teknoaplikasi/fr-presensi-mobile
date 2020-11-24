import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { responsiveFontSize as fs } from 'react-native-responsive-dimensions'

const InputText = (props) => {
  return (
    <React.Fragment>
      {props.label && <Text style={{ fontSize: fs(1.4) }}>{props.label}</Text>}
      <View style={[
        styles.inputLabel,
        props.active && { borderColor: props.color },
        !props.active && { borderColor: 'rgba(172, 172, 172, 0.5)' },
        props.error && { borderColor: 'red' },
      ]}>

        <TextInput
          {...props}
          color={props.active ? 'black' : 'rgba(80, 80, 80, 0.7)'}
        />
      </View>
      {props.error && <Text style={{ color: 'red', fontSize: fs(1.5), marginBottom: fs(1) }}>{props.error}</Text>}
    </React.Fragment>
  )
}

InputText.defaultProps = {
  active: false,
  error: null,
  placeholder: 'Input placeholder',
  color: 'rgba(172, 172, 172, 0.5)'
}

const styles = StyleSheet.create({
  inputLabel: {
    borderWidth: 1,
    marginVertical: fs(1),
    borderRadius: 5,
    paddingLeft: fs(1)
  },
})

export default React.memo(InputText)
