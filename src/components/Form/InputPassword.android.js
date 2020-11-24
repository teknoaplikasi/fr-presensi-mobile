import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import Icon from 'react-native-vector-icons/FontAwesome5'

const InputPassword = (props) => {
  const [secureText, setSecureText] = React.useState(true)
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
          secureTextEntry={secureText}
          color={props.active ? 'black' : 'rgba(80, 80, 80, 0.7)'}
        />
        <Icon
          name={secureText ? 'eye-slash' : 'eye'}
          size={fs(3)}
          color={secureText ? "rgba(178,178,178,.5)" : 'black'}
          style={{
            position: 'absolute',
            right: fs(2),
            top: '50%',
            transform: [
              { translateY: fs(-1.5) }
            ]
          }}
          onPress={() => setSecureText(!secureText)}
        />
      </View>
      {props.error && <Text style={{ color: 'red', fontSize: fs(1.5), marginBottom: fs(1) }}>{props.error}</Text>}
    </React.Fragment>
  )
}

InputPassword.defaultProps = {
  active: false,
  error: null,
  placeholder: 'Input placeholder'
}

const styles = StyleSheet.create({
  inputLabel: {
    borderWidth: 1.5,
    marginVertical: fs(1),
    borderRadius: 5,
    paddingLeft: fs(1)
  },
})

export default React.memo(InputPassword)
