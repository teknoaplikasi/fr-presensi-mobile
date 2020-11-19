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
import { ASSETS_URL } from '../../../../config'

import Geolocation from '@react-native-community/geolocation'
import { currentDeviceLocation, geocodeLatLong, geofenceRadius, shortestDistance } from '../../../utils/GeolocationHelper'
import { simpleToast } from '../../../utils/DisplayHelper';
import { checkAllPermission } from '../../../utils/Permissions';
import LocationNotAvailable from '../../../components/LocationNotAvailable';
import Loading from '../../../components/Loading';
import { AzureFaceAPI } from '../../../utils/Azure';



export class HomeIndex extends Component {

  constructor() {
    super()
    this.state = {
      //move theme later
      location: null,
      faceSync: false,
      locationServiceAlert: null,
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
        transitionY: fs(-3)
      },

      presensiProhibited: null,
      presensiRadius: 0

    }

    this.initChart = this.initChart.bind(this)
    this.setLogoutModal = this.setLogoutModal.bind(this)
    this.setSignoutModal = this.setSignoutModal.bind(this)
    this.syncFace = this.syncFace.bind(this)
  }

  componentDidMount = async () => {

    // console.log('did mount')
    this.getData()
    this.initValue()
    this.initChart()
    this.syncFace()

    this.intervalCurrentTime = setInterval(() => {
      this.setState({
        currentTime: moment().format('HH:mm:ss')
      })
    }, 1000)

    // login
    this.isFocus = this.props.navigation.addListener('focus', () => {
      console.log('nav is focus')

      this.getData()
      this.initValue()
      this.initChart()
      this.syncFace()

      this.intervalCurrentTime = setInterval(() => {
        this.setState({
          currentTime: moment().format('HH:mm:ss')
        })
      }, 1000)
    })
  }

  syncFace = async () => {
    let { last_presensi } = this.props.presensi
    console.log('last presensi', last_presensi)
    if (!last_presensi.tanggal && !last_presensi.jam) return

    let lastPresensi = `${last_presensi.tanggal} ${last_presensi.jam}`
    const diff = moment().utcOffset(420).diff(lastPresensi, 'hours')
    console.log('diff', diff)
    if (parseInt(diff) < 24) return
    this.setState({ faceSync: true })
    let face = await API.getDev('FaceId', true, {})
    if (!face.success) {
      this.setState({ faceSync: false })
      return simpleToast('Gagal sinkronasi Face ID')
    }

    if (face.data.length == 0)
      return this.setState({ faceSync: false })

    let faceUri = face.data[0].face_display

    let newFace = await AzureFaceAPI.updateFace(faceUri)
    if (!newFace.success) {
      this.setState({ faceSync: false })
      return simpleToast('Gagal sinkronasi Face ID')
    }
    API.postDev('UpdateFaceId', true, {
      face_id: newFace.result[0].faceId,
      wajah_id: face.data[0].id
    })
      .then(res => {

        this.setState({ faceSync: false })
        if (!res.success)
          return simpleToast(res.failureMessage)

        return simpleToast('Sinkronasi Face ID berhasil')
      })
      .catch(err => {

        this.setState({ faceSync: false })
        return simpleToast(JSON.stringify(err))
      })



  }

  testValidasi = async () => {
    const check = await shortestDistance(this.state.location, this.props.presensi.presensi_conf)

    this.setState({
      presensiProhibited: check.presensiProhibited,
      presensiRadius: check.shortestDistance.radius,
    })

  }

  getData = async () => {
    const faceStatus = await API.getDev('ValidateFace', true, { user_id: this.props.auth.profile.id })

    const lastPresensi = await API.getDev('LastPresensi', true, {
      id: this.props.auth.profile.id,
      perusahaan_id: this.props.auth.profile.perusahaan_id
    })


    if (lastPresensi.data) {
      this.props.setLastPresensi(lastPresensi.data)
    }

    const announcement = await API.getDev('list/pengumuman', true, { aktif: 'Y' })
    console.log('announcement', JSON.stringify(announcement))
    const presensiConfig = await API.getDev('ConfigPresensi', true, { perusahaan_id: this.props.auth.profile.perusahaan_id, user_id: this.props.auth.profile.id })
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

    this.props.setPresensiPermission(faceStatus.data.face == 'Y')

    currentDeviceLocation()
      .then((res) => {
        this.setState({
          locationServiceAlert: false,
          refreshing: false,
          location: res.coordinates
        }, () => this.testValidasi())
      })
      .catch((err) => {
        this.setState({
          refreshing: false,
          locationServiceAlert: true,
          location: { detail: err.errorMessage }
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
      // console.log('masuk')
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


    if (this.props.auth.profile.foto_profil) {
      this.setState({
        sourceAvatar: {
          uri: `${ASSETS_URL}/users/foto_profil/${this.props.auth.profile.foto_profil}`
        }
      })
    }

    else {
      this.setState({
        sourceAvatar: require('../../../../assets/images/default-user.png')
      })
    }
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

  setLogoutModal = () => {
    this.setState({ logoutModalVisible: !this.state.logoutModalVisible })
  }

  setSignoutModal = () => {
    this.setState({ signoutModalVisible: !this.state.signoutModalVisible })
  }

  renderModal() {
    const durasiKerja = `${parseInt(moment(`${this.props.presensi.last_presensi.tanggal} ${this.props.presensi.last_presensi.jam}`).format('H')) - parseInt(moment().format('H'))} jam`

    const { home, hideLogoutAlert } = this.props
    const primaryText = '#705499'
    const buttonColor = '#6200ee'
    return (
      <Modal
        testID={'modal'}
        isVisible={home.logoutAlert}
        onBackButtonPress={this.setLogoutModal}
        backdropColor="rgba(0,0,0,.5)"
        backdropOpacity={0.8}
        animationInTiming={400}
        animationOutTiming={400}
        backdropTransitionInTiming={400}
        backdropTransitionOutTiming={600}
      >
        <View
          style={styles.modalPresensiOutWrapper}
        >
          <Icon name="stopwatch" color="green" size={fs(5)} />
          <Text style={{ fontWeight: 'bold', color: primaryText }}>Presensi Masuk {this.props.presensi.last_presensi.jam} WIB</Text>
          <Text style={{ color: primaryText, fontSize: fs(1.5), textAlign: 'center' }}>di {this.props.presensi.last_presensi.lokasi}</Text>

          <Badge warning style={{ alignSelf: 'center', marginBottom: fs(4), marginTop: fs(2) }}>
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
                  flag: this.state.isPresensiIn ? 'I' : 'O',
                  presensiProhibited: this.state.presensiProhibited,
                  radius: this.state.presensiRadius
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

    let sourceAvatar = this.state.sourceAvatar

    return (

      <Modal
        testID={'modal'}
        isVisible={this.state.signoutModalVisible}
        onBackButtonPress={this.setSignoutModal}
        backdropColor="rgba(0,0,0,.5)"
        backdropOpacity={0.8}
        animationInTiming={400}
        animationIn="fadeIn"
        animationOut="fadeOut"
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
              onPress={() => {
                // alert('profile page coming soom')
                this.setSignoutModal()
                this.props.navigation.navigate('HomeProfile')
              }}
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
    const { mode, scheme, blockA, locationServiceAlert, faceSync } = this.state
    const { auth, presensi } = this.props
    const hasPresensi = this.props.presensi.last_presensi.tanggal && this.props.presensi.last_presensi.tanggal == moment().format('YYYY-MM-DD')
    return (
      <React.Fragment>
        <Loading
          rIf={faceSync}
          message="Sinkronasi Face ID"
        />
        <LocationNotAvailable
          rIf={locationServiceAlert}
          onRefresh={() => {
            this.setState({ refreshing: true })
            this.getData()
          }}
        />
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
                style={styles.bgImageTop}
                source={require('../../../../assets/images/home-bg-light.png')}
              >
                <View style={styles.bgImageTopInner}>
                  <TouchableOpacity onPress={this.setSignoutModal}>
                    <Icon name="ellipsis-v" color="white" size={fs(3)} style={styles.bgImageTopIcon} />
                  </TouchableOpacity>

                </View>
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
            <View style={styles.contentWrapper}>
              <BadgePresensi
                bgColor={this.state.secondary}
                textColor="white"
                button="PRESENSI"
                onPress={() => {
                  this.props.navigation.navigate('HomeFacePresensiCamera', {
                    flag: 'I',
                    presensiProhibited: this.state.presensiProhibited,
                    radius: this.state.presensiRadius
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
                            this.state.chart.attendance.map((data, i) => (
                              <Col style={{ flexDirection: 'row' }} key={i}>
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
                <Col size={6}>
                  <Card style={{ borderRadius: fs(1), overflow: 'hidden' }}>
                    <CardItem style={{ backgroundColor: scheme.secondaryBg }}>
                      <Body style={{ display: 'flex', justifyContent: 'center' }}>
                        <PieChart
                          data={this.state.chart.presensi}
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
                        }}>PRESENSI</Text>

                        {/* LEGEND */}
                        <Row style={{ marginVertical: fs(1) }}>
                          {
                            this.state.chart.presensi.map((data, i) => (
                              <Col style={{ flexDirection: 'row' }} key={i}>
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
                {this.state.announcement.map((list, i) => (
                  <Col size={12} key={i}>

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
      </React.Fragment>
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
  },

  bgImageTop: {
    position: 'relative',
    height: h(50),
    width: w(100),
    justifyContent: 'center'
  },

  bgImageTopInner: {
    position: 'absolute',
    width: 40,
    top: 0,
    right: 0,
    height: 50,
    justifyContent: 'center',
  },

  bgImageTopIcon: { alignSelf: 'center', height: '100%', paddingTop: fs(1.2) },

  modalPresensiOutWrapper: {
    backgroundColor: 'white',
    width: w(90),
    borderRadius: fs(2),
    paddingHorizontal: fs(5),
    paddingVertical: fs(5),
    justifyContent: 'center',
    alignItems: 'center'
  },

  contentWrapper: {
    top: fs(-10),
    backgroundColor: 'white',
    paddingTop: fs(2),
    paddingHorizontal: fs(2),
    borderTopRightRadius: fs(2),
    borderTopLeftRadius: fs(2)
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
    setPresensiPermission: (payload) => dispatch({ type: 'SET_PRESENSI_PERMISSION', permission: payload }),

    setLastPresensi: (payload) => dispatch({ type: 'SET_LAST_PRESENSI', payload: payload })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeIndex)
