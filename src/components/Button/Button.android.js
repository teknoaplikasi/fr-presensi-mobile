import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { responsiveFontSize as fs, responsiveWidth as w } from 'react-native-responsive-dimensions'
import Icon from 'react-native-vector-icons/FontAwesome5'

const Button = (props) => {
  if (!props.rIf) return null
  return (
    <View
      style={[
        {
          display: 'flex',
          width: '100%'
        },
        props.wrapperStyle
      ]}
    >
      <Pressable
        style={[
          {
            backgroundColor: props.disabled ? '#c9c9c9' : props.schema.backgroundColor,
            borderRadius: props.rounded ? 4 : 0,
            paddingVertical: fs(1.6),
            paddingHorizontal: fs(3),

            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: props.disabled ? 0 : 5,
          },
          props.expand == 'full' && { width: '100%' },
          props.expand == 'block' && {
            alignSelf: props.position,
          },
          props.icon && { flexDirection: 'row', justifyContent: 'center' },
          props.pressableStyle
        ]}
        android_ripple={{ color: 'rgba(255,255,255,.2)' }}
        onPress={props.disabled ? null : props.onPress}
        disabled={props.disabled}
      >
        {props.icon &&
          <Icon
            name={props.icon}
            color={props.schema.color}
            size={fs(2.2)}
            style={[{ marginHorizontal: fs(0.5) }, props.iconStyle]}
          />}
        <Text style={[
          {
            color: props.schema.color,
            textAlign: 'center',
            fontSize: fs(1.8)
          },
          props.textStyle
        ]}>{props.label}</Text>
      </Pressable>
    </View>
  )
}

Button.defaultProps = {
  label: 'Button',
  rIf: true,
  expand: 'full',
  disabled: false,
  position: 'center',
  textStyle: {},
  wrapperStyle: {},
  size: 'md',
  rounded: true,
  schema: {
    backgroundColor: '#1C76BB',
    color: '#ffffff'
  },
  pressableStyle: {},
  iconStyle: {}
}

export default React.memo(Button)
