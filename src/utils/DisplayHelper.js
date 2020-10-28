import { ToastAndroid } from 'react-native'

export function simpleToast(message, position = ToastAndroid.BOTTOM, duration = 200) {
  return ToastAndroid.showWithGravity(
    message,
    position,
    duration
  )
}