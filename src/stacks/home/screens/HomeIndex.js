import React, { Component } from 'react'

import { StyleSheet, Image, View, StatusBar, ImageBackground, Animated, Easing, Appearance, ActivityIndicator, RefreshControl, TouchableOpacity as TouchableOpacityRN } from 'react-native'
import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import { Container, Header, Content, Form, Item, Input, Label, Row, Col, Text, Button, Card, CardItem, Body, Badge, Thumbnail } from 'native-base';
import { PieChart } from "react-native-chart-kit";
import { PanGestureHandler, ScrollView, TouchableHighlight, TouchableOpacity } from 'react-native-gesture-handler';
import Theme from '../../../utils/Theme'
import Modal from 'react-native-modal'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { connect } from 'react-redux';
import moment from 'moment'
import BadgePresensi from '../components/BadgePresensi'

import Geolocation from '@react-native-community/geolocation'
import { geocodeLatLong, geofenceRadius, shortestDistance } from '../../../utils/GeolocationHelper'
import { simpleToast } from '../../../utils/DisplayHelper';



export class HomeIndex extends Component {

  constructor() {
    super()
    this.state = {
      //move theme later
      location: null,
      refreshing: true,
      isPresensiIn: null,
      scheme: {},
      currentTime: moment().format('HH:mm:ss'),
      mode: null,
      primary: '#ffac1f',
      secondary: '#8335f4',
      announcement: [],
      chart: {
        attendance: [],
        presensi: []
      },
      logoutModalVisible: false,
      signoutModalVisible: false,

      blockBHeight: {
        initialY: h(100) * 0.4,
        value: h(100) * 0.4,
        Ybefore: 0
      },

      blockA: {
        opacity: new Animated.Value(1),
        transitionY: fs(-3)
      },

      presensiProhibited: null,
      presensiRadius: 0

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
    this.setSignoutModal = this.setSignoutModal.bind(this)
  }

  componentDidMount = async () => {
    // login
    // this.getData()
    // this.initValue()
    // this.initChart()
    this.isFocus = this.props.navigation.addListener('focus', () => {
      this.getData()
      this.initValue()
      this.initChart()
      this.intervalCurrentTime = setInterval(() => {
        this.setState({
          currentTime: moment().format('HH:mm:ss')
        })
      }, 1000)
    })
    // this.intervalCurrentTime = setInterval(() => {
    //   this.setState({
    //     currentTime: moment().format('HH:mm:ss')
    //   })
    // }, 1000)
  }

  testValidasi = async () => {
    // simpleToast(JSON.stringify(this.state.location))
    const check = await shortestDistance(this.state.location, this.props.presensi.presensi_conf)

    this.setState({
      presensiProhibited: check.presensiProhibited,
      // presensiProhibited: true,
      presensiRadius: check.shortestDistance.radius,
    })

  }

  getData = async () => {
    const faceStatus = await API.getDev('ValidateFace', true, { user_id: this.props.auth.profile.id })
    const announcement = await API.getDev('list/pengumuman', true, { aktif: 'Y' })
    const presensiConfig = await API.getDev('ConfigPresensi', true, { id: this.props.auth.profile.perusahaan_id })
    // simpleToast(JSON.stringify(presensiConfig))

    //dispatch presensi config
    // simpleToast(typeof (presensiConfig.data))
    console.log(presensiConfig)
    if (!presensiConfig.success)
      simpleToast("Gagal mengambil data konfigurasi presensi")
    else
      this.props.setPresensiConfig(presensiConfig.data)

    if (!announcement.success) {
      simpleToast('Gagal mengambil pengumuman perusahaan')
    }
    this.setState({
      announcement: announcement.pengumuman
    })
    if (!faceStatus.success) {
      simpleToast('Gagal mengambil status wajah')
    }

    this.props.editProfile({
      face_status: faceStatus.data.face
    })

    Geolocation.getCurrentPosition(async ({ coords }) => {
      let locationDetail = await geocodeLatLong(coords.latitude, coords.longitude)
      if (!locationDetail.success) {

        this.setState({ refreshing: false })
        return simpleToast('Gagal mendapatkan lokasi anda')
      }
      coords.detail = locationDetail.result
      this.setState({
        refreshing: false,
        location: coords
      }, () => {

        this.testValidasi()
      })
    })
  }

  componentWillUnmount() {
    this.isFocus()
    this.intervalCurrentTime
  }

  initValue = async () => {
    let isPresensiIn = false
    const lastPresensi = this.props.presensi.last_presensi
    const dateNow = moment().format('YYYY-MM-DD')
    if (!lastPresensi || !lastPresensi.tanggal) {
      isPresensiIn = true
    }

    else if (lastPresensi.tanggal == dateNow && lastPresensi.flag == 'I') {
      console.log('masuk')
      isPresensiIn = false
    }

    else if (lastPresensi.tanggal == dateNow && lastPresensi.flag == 'O') {
      isPresensiIn = true
    }

    else if (lastPresensi.tanggal != dateNow) {
      isPresensiIn = true
    }

    else {
      isPresensiIn = false
    }
    StatusBar.setBackgroundColor('#ffac1f')
    StatusBar.setBarStyle('light-content')
    await this.setState({
      scheme: Theme['light'],
      mode: 'light',
      isPresensiIn: isPresensiIn
    })
  }

  initChart = () => {
    const attendance = [
      {
        name: "Terlambat",
        population: 300,
        color: 'orange',
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

    const presensi = [
      {
        name: "Presensi",
        population: 160,
        color: 'orange',
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Abstain",
        population: 200,
        color: "#9b5df5",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
      },

    ];
    this.setState({
      chart: {
        attendance: attendance,
        presensi: presensi
      }
    })
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

  setSignoutModal = () => {
    this.setState({ signoutModalVisible: !this.state.signoutModalVisible })
  }

  testAnimate = () => {
    // this.blockBTop
    // Animated.timing(this.blockBTop, {
    //   duration: 200,
    //   toValue: h(10)
    // }).start()
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
                this.props.navigation.navigate('HomeFacePresensiCamera', {
                  flag: this.state.isPresensiIn ? 'I' : 'O'
                })
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
    return null
  }

  renderModalLogout() {

    let sourceAvatar = null
    if (this.props.auth.profile.foto_profil) {
      sourceAvatar = {
        uri: `${ASSETS_URL}/users/foto_profil/${this.props.auth.profile.foto_profil}`
      }
    }

    else {
      sourceAvatar = require('../../../../assets/images/default-user.png')
    }
    return (

      <Modal
        testID={'modal'}
        isVisible={this.state.signoutModalVisible}
        onBackButtonPress={this.setSignoutModal}
        backdropColor="rgba(0,0,0,.5)"
        backdropOpacity={0.8}
        animationIn="zoomInDown"
        animationOut="zoomOutUp"
        animationInTiming={400}
        animationOutTiming={400}
        backdropTransitionInTiming={400}
        backdropTransitionOutTiming={600}
        onBackdropPress={this.setSignoutModal}
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
          <Thumbnail large source={sourceAvatar} />
          <View style={{ width: '100%' }}>
            <TouchableOpacityRN
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Icon name="cog" color="grey" size={fs(2.5)} />
              <Text style={{ color: 'grey', paddingVertical: fs(1), paddingHorizontal: fs(2) }}>Setting</Text>
            </TouchableOpacityRN>
            <TouchableOpacityRN
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => alert('press')}
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
              onPress={() => {
                this.props.resetPresensi()
                this.props.logout()
              }}
            >
              <Text style={{ color: 'white', textAlign: 'center', width: '100%' }}>Logout</Text>
            </TouchableOpacityRN>
          </View>
        </View>

      </Modal >
    )
  }



  render() {
    const { mode, scheme, blockA } = this.state
    const { auth, presensi } = this.props
    const hasPresensi = this.props.presensi.last_presensi.tanggal && this.props.presensi.last_presensi.tanggal == moment().format('YYYY-MM-DD')
    return (
      <Container>
        <Animated.ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => {
                this.setState({ refreshing: true })
                this.getData()
              }}
            />
          }
        >
          {this.renderModal()}
          {this.renderModalLogout()}
          <View>

            <ImageBackground
              style={{
                position: 'relative',
                height: h(50),
                width: w(100),
                justifyContent: 'center'
              }}
              source={require('../../../../assets/images/home-bg-light.png')}
            >

              <View
                style={{
                  position: 'absolute',
                  // zIndex: 999,
                  width: 40,
                  top: 0,
                  right: 0,
                  height: 50,
                  justifyContent: 'center',

                }}
              >
                <TouchableOpacity
                  onPress={this.setSignoutModal}
                >
                  <Icon name="ellipsis-v" color="white" size={fs(3)} style={{ alignSelf: 'center', height: '100%', paddingTop: fs(1.2) }} />
                </TouchableOpacity>

              </View>
              {/* <View
                  style={{
                    width: w(40),
                    height: h(20),
                    position: 'absolute',
                    backgroundColor: 'yellow'
                  }}
                >

                </View> */}
              <Animated.View
                style={[
                  {
                    paddingHorizontal: fs(3),
                    paddingVertical: fs(5),
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'center',
                    alignContent: 'center',
                    transform: [
                      { translateY: this.state.blockA.transitionY }
                    ]
                  }]}
              >
                <View
                  style={{
                    alignSelf: 'flex-start',
                    width: '65%'
                  }}
                >
                  <Animated.Text
                    style={[
                      {
                        fontWeight: 'bold',
                        fontSize: fs(5),
                        color: scheme.primaryText,
                        opacity: blockA.opacity
                      }
                    ]}
                  >{this.state.currentTime}</Animated.Text>

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
                          numberOfLines={2}
                        >
                          {this.state.location && this.state.location.detail ? this.state.location.detail : 'Mengambil detail lokasi . . .'}
                        </Animated.Text>
                      </Body>
                    </CardItem>
                  </Card>

                </View>


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
          {/* <PanGestureHandler
          onGestureEvent={this.onBlockBPanned}
          onHandlerStateChange={this.onChangeStateBlockB}
        > */}
          {/* <Animated.ScrollView
          style={[
            // blockBTopStyle,
            {
              position: 'absolute',
              width: w(100),
              backgroundColor: scheme.primaryBg,
              top: h(40),
              // top: blockBHeight.value,
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
        > */}
          <View
            style={{
              top: fs(-10),
              backgroundColor: 'white',
              paddingTop: fs(2),
              paddingHorizontal: fs(2),
              borderTopRightRadius: fs(2),
              borderTopLeftRadius: fs(2)
            }}
          >

            <BadgePresensi
              bgColor={this.state.secondary}
              textColor="white"
              button="PRESENSI"
              onPress={() => {
                this.props.navigation.navigate('HomeFacePresensiCamera', {
                  flag: 'I'
                })
              }}
              text="Anda belum melakukan presensi hari ini"
              rIf={auth.profile.face_status == 'Y' && !hasPresensi}
            />

            <BadgePresensi
              bgColor="white"
              bordered
              textColor={this.state.secondary}
              text={presensi.last_presensi.lokasi}
              title={`${presensi.last_presensi.flag == 'I' ? 'Masuk' : 'Keluar'}, ${moment(presensi.last_presensi.tanggal).format('DD MMMM YYYY')}`}
              subtitle={`${presensi.last_presensi.jam} WIB`}
              rIf={auth.profile.face_status == 'Y' && hasPresensi}
            />

            <BadgePresensi
              bgColor={this.state.secondary}
              text="Anda belum melakukan registrasi wajah"
              textColor="white"
              button="REGISTER"
              onPress={() => {
                this.props.navigation.navigate('HomeRegisterFaceCamera')
              }}
              rIf={auth.profile.face_registered == "N" && auth.profile.face_status == 'N'}
            />

            <BadgePresensi
              bgColor={this.state.primary}
              text="Registrasi wajah anda sedang dalam proses verifikasi"
              title="Menunggu Verifikasi"
              textColor="white"
              button="Refresh Status Verifikasi"
              onPress={() => {
                this.setState({
                  refreshing: true
                })
                this.getData()
              }}
              rIf={auth.profile.face_status == 'W'}
            />
            {this.renderRegisterLink()}
            <Row style={{ backgroundColor: scheme.primaryBg, marginVertical: fs(2), height: 'auto' }}>
              <Col size={6}>
                <Card style={{ borderRadius: fs(1), overflow: 'hidden', }}>
                  <CardItem style={{ backgroundColor: scheme.secondaryBg }}>
                    <Body style={{ display: 'flex', justifyContent: 'center' }}>
                      <PieChart
                        data={this.state.chart.attendance}
                        width={100}
                        height={100}
                        hasLegend={false}
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

                      <Text style={{
                        alignSelf: 'center',
                        color: '#493a76',
                        fontWeight: 'bold',
                        fontSize: fs(1.8)
                      }}>ATTENDANCE</Text>

                      {/* LEGEND */}
                      <Row style={{ marginVertical: fs(1) }}>
                        {
                          this.state.chart.attendance.map(data => (
                            <Col style={{ flexDirection: 'row' }}>
                              <View style={{ width: fs(1.5), height: fs(1.5), backgroundColor: data.color, borderRadius: 1.5 }}
                              />
                              <Text style={{ fontSize: fs(1.3), paddingLeft: fs(.5) }}>{data.name}</Text>
                            </Col>
                          ))
                        }
                      </Row>
                    </Body>
                  </CardItem>
                </Card>

                {/* <View
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'blue'
                  }}
                /> */}
              </Col>
              <Col size={6}>
                <Card style={{ borderRadius: fs(1), overflow: 'hidden' }}>
                  <CardItem style={{ backgroundColor: scheme.secondaryBg }}>
                    <Body style={{ display: 'flex', justifyContent: 'center' }}>
                      <PieChart
                        data={this.state.chart.presensi}
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


                      <Text style={{
                        alignSelf: 'center',
                        color: '#493a76',
                        fontWeight: 'bold',
                        fontSize: fs(1.8)
                      }}>PRESENSI</Text>

                      {/* LEGEND */}
                      <Row style={{ marginVertical: fs(1) }}>
                        {
                          this.state.chart.presensi.map(data => (
                            <Col style={{ flexDirection: 'row' }}>
                              <View style={{ width: fs(1.5), height: fs(1.5), backgroundColor: data.color, borderRadius: 1.5 }}
                              />
                              <Text style={{ fontSize: fs(1.3), paddingLeft: fs(.5) }}>{data.name}</Text>
                            </Col>
                          ))
                        }
                      </Row>
                    </Body>
                  </CardItem>
                </Card>
              </Col>

            </Row>

            <Row style={{ height: 'auto' }}>
              {this.state.announcement.map(list => (
                <Col size={12}>

                  <Card style={{ borderRadius: fs(1), overflow: 'hidden' }}>
                    <CardItem style={{ backgroundColor: scheme.secondaryBg }}>
                      <Body>
                        <Text style={{
                          fontSize: fs(2.2),
                          lineHeight: fs(3.8),
                          color: scheme.primaryText
                        }}>{list.judul}</Text>
                        <Text style={{
                          fontSize: fs(1.6),
                          lineHeight: fs(3),
                          color: scheme.primaryText
                        }}>{list.isi}</Text>
                      </Body>
                    </CardItem>
                  </Card>
                </Col>

              ))}
            </Row>
          </View>
        </Animated.ScrollView>
        {/* </PanGestureHandler> */}
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
    resetPresensi: () => dispatch({ type: 'RESET_PRESENSI' }),
    editProfile: (payload) => dispatch({ type: 'EDIT_PROFILE', profile: payload }),
    setPresensiConfig: (payload) => dispatch({ type: 'SET_PRESENSI_CONFIG', presensi_conf: payload }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeIndex)
