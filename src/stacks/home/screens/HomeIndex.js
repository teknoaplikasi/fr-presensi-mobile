import React, { Component } from 'react'

import { StyleSheet, Image, View, StatusBar, ImageBackground, Animated, Easing, Appearance } from 'react-native'
import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import { Container, Header, Content, Form, Item, Input, Label, Row, Col, Text, Button, Card, CardItem, Body, Badge } from 'native-base';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit"; import { f } from '../../../utils/StyleHelper';
import { PanGestureHandler, ScrollView, TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import Theme from '../../../utils/Theme'
import Modal from 'react-native-modal'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { connect } from 'react-redux';
import moment from 'moment'


export class HomeIndex extends Component {

  constructor() {
    super()
    this.state = {
      //move theme later
      scheme: {},
      mode: null,
      primary: '#ffac1f',
      secondary: '#8335f4',
      chart: [],
      logoutModalVisible: false,

      blockBHeight: {
        initialY: h(100) * 0.4,
        value: h(100) * 0.4,
        Ybefore: 0
      },

      blockA: {
        opacity: new Animated.Value(1),
        transitionY: fs(-3)
      }

    }

    this.blockATransform = new Animated.Value(fs(7))
    this.blockAOpacity = new Animated.Value(1)
    this.blockBTop = new Animated.Value(h(40))

    this.initChart = this.initChart.bind(this)
    this.onBlockBPanned = this.onBlockBPanned.bind(this)
    this.onChangeStateBlockB = this.onChangeStateBlockB.bind(this)
    this.test = this.test.bind(this)
    this.setLogoutModal = this.setLogoutModal.bind(this)
    this.testAnimate = this.testAnimate.bind(this)
  }

  componentDidMount = async () => {
    this.initValue()

    this.isFocus = this.props.navigation.addListener('focus', () => {
      this.initValue()
    })

    this.initChart()
  }

  componentWillUnmount() {
    this.isFocus()
  }

  initValue = async () => {
    StatusBar.setBackgroundColor('#ffac1f')
    StatusBar.setBarStyle('light-content')
    // console.log(moment())
    const dateNow = moment().format('H')
    const dateIn = moment(`${this.props.presensi.last_presensi.tanggal} ${this.props.presensi.last_presensi.jam}`).format('H')
    const mode = Appearance.getColorScheme()
    await this.setState({
      scheme: Theme[mode],
      mode: mode
    })
  }

  initChart = () => {
    const data = [
      {
        name: "Terlambat",
        population: 300,
        color: this.state.scheme.secondaryColor,
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Ontime",
        population: 60,
        color: "#9b5df5",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
      },

    ];
    this.setState({ chart: data })
  }

  onBlockBPanned = (event) => {
    const { initialY } = this.state.blockBHeight
    const transY = event.nativeEvent.translationY
    console.log('value', initialY + transY)


    let value = h(40)
    if (initialY + transY < h(40))
      value = initialY + transY
    if (initialY + transY < 0)
      value = 0
    this.test(value)
    this.setState(prevState => ({
      blockBHeight: {
        ...prevState.blockBHeight,
        value: value
      }
    }))

  }

  onChangeStateBlockB = (event) => {
    //end state
    if (event.nativeEvent.state == 5) {
      console.log('initial Y, trans y', this.blockBTop, event.nativeEvent.translationY)
      const initialY = this.blockBTop
      const transY = event.nativeEvent.translationY
      const absoluteY = event.nativeEvent.absoluteY

      let value = initialY + transY > h(40) ? h(40) : initialY + transY
      const calculated = value / h(40)


      this.setState(prevState => ({
        blockBHeight: {
          ...prevState.blockBHeight,
          initialY: prevState.blockBHeight.value
        }
      }))
    }
  }

  test = (value) => {
    const calculated = value / h(40)
    this.state.blockA.opacity.setValue(calculated)
    this.setState(prevState => ({
      blockA: {
        ...prevState.blockA,
        transitionY: fs(-10 + (calculated * 7)),
      }
    }))
  }

  setLogoutModal = () => {
    this.setState({ logoutModalVisible: !this.state.logoutModalVisible })
  }

  testAnimate = () => {
    this.props.resetPresensi()
    this.props.logout()
  }

  renderModal() {
    const durasiKerja = `${parseInt(moment(`${this.props.presensi.last_presensi.tanggal} ${this.props.presensi.last_presensi.jam}`).format('H')) - parseInt(moment().format('H'))} jam`

    const { home, hideLogoutAlert } = this.props
    const { blockBHeight, blockA, mode, scheme, logoutModalVisible } = this.state
    const primaryText = '#705499'
    const buttonColor = '#6200ee'
    return (
      <Modal
        testID={'modal'}
        isVisible={home.logoutAlert}
        onBackButtonPress={this.setLogoutModal}
        backdropColor="rgba(0,0,0,.5)"
        backdropOpacity={0.8}
        animationIn="zoomInDown"
        animationOut="zoomOutUp"
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
          <Text style={{ fontWeight: 'bold', color: primaryText }}>Presensi Masuk {this.props.presensi.last_presensi.jam} WIB</Text>
          <Text style={{ color: primaryText, fontSize: fs(1.5), textAlign: 'center' }}>di {this.props.presensi.last_presensi.lokasi}</Text>

          <Badge warning
            style={{ alignSelf: 'center', marginBottom: fs(4), marginTop: fs(2) }}
          >
            <Text>Durasi {durasiKerja}</Text>
          </Badge>
          <Text style={{ color: primaryText, fontWeight: 'bold', fontSize: fs(1.7), textAlign: 'center' }}>Anda akan melakukan presensi keluar, apakah anda yakin?</Text>
          <View style={styles.modalButton}>
            <Button
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'white',
                justifyContent: 'center',
                elevation: 0,
                width: '50%'
              }}
              onPress={() => {
                hideLogoutAlert()
              }}
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
                this.props.navigation.navigate('HomeFacePresensiCamera')
                hideLogoutAlert()

              }}
            >
              <Text>KELUAR</Text>
            </Button>
          </View>
        </View>
      </Modal>
    )
  }

  renderRegisterLink() {
    return (
      // <View><Text>Here</Text></View>
      <Row style={{ height: 'auto' }}>
        <Button rounded onPress={() => {
          this.props.navigation.navigate('HomeRegisterFaceCamera')
        }}>
          <Text>Register Face</Text>
        </Button>
      </Row>
    )
  }



  render() {
    // console.log('home index props', this.props)
    const { home, hideLogoutAlert } = this.props
    const { blockBHeight, blockA, mode, scheme, logoutModalVisible } = this.state
    const primaryText = '#705499'
    const buttonColor = '#6200ee'
    // const imageBackground = mode == 'light' ? require('../../../../assets/images/home-bg-light.png') : require('../../../../assets/images/home-bg-dark.png')
    //interpolate
    // const blockAOpacity = {
    //   opacity: blockA.opacity.interpolate({
    //     inputRange: [0, 1],
    //     outputRange: [0, 1],
    //   })
    // }


    const blockBTopStyle = {
      top: this.blockBTop
    }
    const blockAOpacity = {
      opacity: this.blockAOpacity
    }

    const blockATransform = {
      transform: [
        { translateY: this.blockATransform }
      ]
    }


    return (
      <Container>

        {this.renderModal()}
        {/* SUMMARY */}
        {/* <Content> */}
        <View>
          <ImageBackground
            style={{
              position: 'relative',
              height: h(50),
              width: w(100),
              justifyContent: 'center'
            }}
            source={mode == 'light' ? require('../../../../assets/images/home-bg-light.png') : require('../../../../assets/images/home-bg-dark.png')}
          >
            <Animated.View
              style={[
                // blockATransform,
                {
                  paddingHorizontal: fs(3),
                  paddingVertical: fs(5),
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  alignItems: 'center',
                  // backgroundColor: 'blue',
                  // height: '100%',

                  alignSelf: 'center',
                  alignContent: 'center',
                  transform: [
                    { translateY: blockA.transitionY }
                    // { translateY: h(-10) }
                  ]
                }]}
            >
              {/* <Row> */}
              {/* <Col size={7}> */}
              <View
                style={{
                  alignSelf: 'flex-start',
                  width: '65%'
                }}
              >
                <Animated.Text
                  style={[
                    // blockAOpacity,
                    {
                      fontWeight: 'bold',
                      fontSize: fs(5),
                      color: scheme.primaryText,
                      opacity: blockA.opacity
                    }
                  ]}
                >{moment(`${this.props.presensi.last_presensi.tanggal} ${this.props.presensi.last_presensi.jam}`).format('HH:mm')}</Animated.Text>

                <Card style={{
                  overflow: 'hidden',
                  borderRadius: fs(2),
                  width: '90%',
                }}>
                  <CardItem style={{
                    backgroundColor: scheme.thirdBg
                  }}>
                    <Body>
                      <Animated.Text
                        style={[{ fontSize: fs(1.5), color: scheme.primaryText, opacity: blockA.opacity }]}
                      >{this.props.presensi.last_presensi.lokasi}</Animated.Text>
                    </Body>
                  </CardItem>
                </Card>

              </View>
              {/* </Col> */}

              {/* <Col size={5} style={{ display: 'flex' }}> */}
              <View
                style={{
                  alignSelf: 'flex-end',
                  width: '35%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  // flexDirection: 'row'
                }}
              >
                <Animated.Image
                  source={require('../../../../assets/images/presensi.png')}
                  style={[{
                    width: '100%',
                    alignSelf: 'center',
                    opacity: blockA.opacity
                  }]}
                />
              </View>
            </Animated.View>
          </ImageBackground>
        </View>
        <PanGestureHandler
          onGestureEvent={this.onBlockBPanned}
          onHandlerStateChange={this.onChangeStateBlockB}
        >
          <Animated.ScrollView
            style={[
              // blockBTopStyle,
              {
                position: 'absolute',
                width: w(100),
                backgroundColor: scheme.primaryBg,
                // top: h(40),
                top: blockBHeight.value,
                // top: h(40),
                borderTopRightRadius: 30,
                borderTopLeftRadius: 30,
                paddingHorizontal: fs(2.5),
                paddingVertical: fs(5),
                zIndex: 99999,
                // backgroundColor: 'blue',
                // transform: [
                //   { translateY: 100 }
                // ]
              }]}
            contentContainerStyle={{
              // flexGrow: 1,
              height: h(200),
              // flex: 1
            }}

            scrollEventThrottle={1}
            stickyHeaderIndices={[1]}
          >
            <View style={{ flex: 1 }}>


              <Row style={{ height: 'auto' }}>
                <Col>
                  <Card style={{ borderRadius: fs(1), overflow: 'hidden' }}>
                    <CardItem style={{ backgroundColor: this.state.secondary }}>
                      <Body style={{ paddingBottom: fs(1) }}>
                        <Text style={{
                          color: 'white',
                          fontSize: fs(2.2),
                          width: w(70),
                          lineHeight: fs(3.8)
                        }}>Anda belum melakukan presensi hari ini</Text>
                        <Button transparent>
                          <Text style={{ color: 'white', fontWeight: 'bold', alignSelf: 'flex-end' }}>PRESENSI</Text>
                        </Button>
                      </Body>
                    </CardItem>
                  </Card>
                </Col>
              </Row>
              {this.renderRegisterLink()}
              <Row style={{ backgroundColor: scheme.primaryBg, marginVertical: fs(2), height: 'auto' }}>
                <Col size={6}>
                  <Card style={{ borderRadius: fs(1), overflow: 'hidden', }}>
                    <CardItem style={{ backgroundColor: scheme.secondaryBg }}>
                      <Body style={{ display: 'flex', justifyContent: 'center' }}>
                        <PieChart
                          data={this.state.chart}
                          width={100}
                          height={100}
                          hasLegend={false}
                          // width={screenWidth}
                          // height={220}

                          chartConfig={{
                            backgroundGradientFrom: "#1E2923",
                            backgroundGradientFromOpacity: 0,
                            backgroundGradientTo: "#08130D",
                            backgroundGradientToOpacity: 0.5,
                            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                            strokeWidth: 2, // optional, default 3
                            barPercentage: 0.5,
                            useShadowColorFromDataset: false // optional
                          }}
                          accessor="population"
                          backgroundColor="transparent"
                          paddingLeft="30"
                          absolute
                          style={{
                            alignSelf: 'center'
                          }}
                        />
                      </Body>
                    </CardItem>
                  </Card>
                </Col>
                <Col size={6}>
                  <Card style={{ borderRadius: fs(1), overflow: 'hidden' }}>
                    <CardItem style={{ backgroundColor: scheme.secondaryBg }}>
                      <Body style={{ display: 'flex', justifyContent: 'center' }}>
                        <PieChart
                          data={this.state.chart}
                          width={100}
                          height={100}
                          hasLegend={false}
                          // width={screenWidth}
                          // height={220}

                          chartConfig={{
                            backgroundGradientFrom: "#1E2923",
                            backgroundGradientFromOpacity: 0,
                            backgroundGradientTo: "#08130D",
                            backgroundGradientToOpacity: 0.5,
                            color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                            strokeWidth: 2, // optional, default 3
                            barPercentage: 0.5,
                            useShadowColorFromDataset: false // optional
                          }}
                          accessor="population"
                          backgroundColor="transparent"
                          paddingLeft="30"
                          absolute
                          style={{
                            alignSelf: 'center'
                          }}
                        />
                      </Body>
                    </CardItem>
                  </Card>
                </Col>
              </Row>

              <Row style={{ height: 'auto' }}>
                <Col size={12}>

                  <Card style={{ borderRadius: fs(1), overflow: 'hidden' }}>
                    <CardItem style={{ backgroundColor: scheme.secondaryBg }}>
                      <Body>
                        <Text style={{
                          fontSize: fs(2.2),
                          lineHeight: fs(3.8),
                          color: scheme.primaryText
                        }}>PENGUMUMAN</Text>
                        <Text style={{
                          fontSize: fs(1.6),
                          lineHeight: fs(3),
                          color: scheme.primaryText
                        }}>Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. </Text>
                      </Body>
                    </CardItem>
                  </Card>
                </Col>
              </Row>

              <View style={{ flexDirection: 'row' }}>

                <TouchableHighlight
                  onPress={this.testAnimate}
                  style={{
                    width: w(50),
                    height: h(10)
                  }}
                >
                </TouchableHighlight>
                <TouchableHighlight
                  onPress={() => {
                    this.props.navigation.navigate('HomeRegisterFaceCamera')
                  }}
                  style={{
                    width: w(50),
                    height: h(10)
                  }}
                >
                </TouchableHighlight>
              </View>
            </View>
          </Animated.ScrollView>
        </PanGestureHandler>
      </Container >
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: w(100),
    display: 'flex',
    height: h(100),

  },

  cameraView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'gray'
  },

  modalButton: {
    paddingTop: fs(5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  }
})


const mapStateToProps = (state) => ({
  home: state.home,
  auth: state.auth,
  presensi: state.presensi
})

const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch({ type: 'IS_LOGGED_OUT' }),
    hideLogoutAlert: () => dispatch({ type: 'HIDE_LOGOUT_ALERT' }),
    setCompany: (payload) => dispatch({ type: 'SET_COMPANY', company: payload }),
    resetPresensi: () => dispatch({ type: 'RESET_PRESENSI' })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeIndex)
