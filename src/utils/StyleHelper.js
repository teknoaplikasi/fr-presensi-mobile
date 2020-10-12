import { responsiveFontSize as font } from 'react-native-responsive-dimensions'
import { StyleSheet, Dimensions } from 'react-native'
export const createFont = (size) => ({
  ['_' + size]: {
    fontSize: font(size)
  }
})

const width = (size) => ({
  ['w' + size]: {
    width: size + '%'
  }
})

const height = (size) => ({
  ['h' + size]: {
    height: size + '%'
  }
})

// position
export const p = StyleSheet.create({
  abs: { position: 'absolute' },
  rel: { position: 'relative' },
  flex_1: { flex: 12 },
  col: { flexDirection: 'column' },
  row: { flexDirection: 'row' },
  justifyCenter: { justifyContent: 'center' },
  justifySpaceBetween: { justifyContent: 'space-between' },
  alignCenter: { alignItems: 'center' },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  selfCenter: { alignSelf: 'center' },
  selfEnd: { alignSelf: 'flex-end' },
  startEnd: { alignSelf: 'flex-start' },

  textCenter: { textAlign: 'center' },

  ...width(10),
  ...width(20),
  ...width(30),
  ...width(40),
  ...width(50),
  ...width(60),
  ...width(70),
  ...width(80),
  ...width(90),

  ...height(5),
  ...height(7),
  ...height(10),
  ...height(15),
  ...height(20),
  ...height(30),
  ...height(40),
  ...height(50),
  ...height(55),
  ...height(60),
  ...height(70),
  ...height(80),
  ...height(90),
})

export const c = StyleSheet.create({
  primary: { color: '#ff0000' },
  info: { color: '#62B1F6' },
  success: { color: '#5cb85c' },
  danger: { color: '#d9534f' },
  warning: { color: '#f0ad4e' },
  dark: { color: '#000000' },
  light: { color: '#f4f4f4' },
  softGray: { color: '#616161' }
})

export const b = StyleSheet.create({
  primary: { backgroundColor: '#ff0000', color: 'white' },
  info: { backgroundColor: '#62B1F6' },
  success: { backgroundColor: '#5cb85c' },
  danger: { backgroundColor: '#d9534f' },
  warning: { backgroundColor: '#f0ad4e' },
  dark: { backgroundColor: '#000000' },
  light: { backgroundColor: '#f4f4f4' },
  white: { backgroundColor: '#ffffff' }
})

export const f = StyleSheet.create({
  bold: { fontWeight: 'bold' },
  font: { fontFamily: "Montserrat-Regular" },
  ...createFont(8),
  ...createFont(10),
  ...createFont(12),
  ...createFont(14),
  ...createFont(16),
  ...createFont(18),
  ...createFont(20),
  ...createFont(24)
})

// export const w = StyleSheet.create({
//   width: `${value}%`
// })


const loopStyle = (key, value) => ({
  [key + 0]: {
    [value]: font(0)
  },
  [key + 1]: {
    [value]: font(1)
  },
  [key + 2]: {
    [value]: font(2)
  },
  [key + 3]: {
    [value]: font(3)
  },
  [key + 4]: {
    [value]: font(4)
  },
  [key + 8]: {
    [value]: font(8)
  },
  [key + 16]: {
    [value]: font(16)
  },
  [key + 18]: {
    [value]: font(18)
  }
})

export const s = StyleSheet.create({
  ...loopStyle('mb', 'marginBottom'),
  ...loopStyle('mt', 'marginTop'),
  ...loopStyle('mr', 'marginRight'),
  ...loopStyle('ml', 'marginLeft'),
  ...loopStyle('mx', 'marginHorizontal'),
  ...loopStyle('my', 'marginVertical'),
  ...loopStyle('pb', 'paddingBottom'),
  ...loopStyle('pt', 'paddingTop'),
  ...loopStyle('pl', 'paddingLeft'),
  ...loopStyle('pr', 'paddingRight'),
  ...loopStyle('px', 'paddingHorizontal'),
  ...loopStyle('py', 'paddingVertical'),
  ...loopStyle('p', 'padding'),
  ...loopStyle('m', 'margin'),

  flex: { display: 'flex' },
  hidden: { display: 'none' },
  // h100: { height: windowHeight('') },
  // header100: { height: windowHeight('minHeader') },
  // w100: { width: Dimensions.get('window').width }
})
