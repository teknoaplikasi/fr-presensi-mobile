import React, { Component } from 'react'

import { StyleSheet, View, StatusBar, ImageBackground, Animated, RefreshControl, TouchableOpacity as TouchableOpacityRN } from 'react-native'
import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import { Container, Row, Col, Text, Card, CardItem, Body, Badge, Thumbnail } from 'native-base';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Theme from '../../../utils/Theme'
import Modal from 'react-native-modal'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { connect } from 'react-redux';
import moment from 'moment'
import BadgePresensi from '../components/BadgePresensi'
import { ASSETS_URL } from '../../../../config'
import { currentDeviceLocation, shortestDistance } from '../../../utils/GeolocationHelper'
import { simpleToast } from '../../../utils/DisplayHelper';
import LocationNotAvailable from '../../../components/LocationNotAvailable';
import Loading from '../../../components/Loading';
import { AzureFaceAPI } from '../../../utils/Azure';
import HomeChart from '../components/HomeChart'
import HomePresensiOutModal from '../components/HomePresensiOutModal'
import Button from '../../../components/Button/Button'



export class HomeIndex extends Component {

  constructor() {
    super()
    this.state = {
      //move theme later
      location: null,
      presensiStatus: { flag: null, message: null },
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

    // this.initChart = this.initChart.bind(this)
    this.setLogoutModal = this.setLogoutModal.bind(this)
    this.setSignoutModal = this.setSignoutModal.bind(this)
    this.syncFace = this.syncFace.bind(this)
  }

  componentDidMount = async () => {
    this.getData()
    this.initValue()
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
    if (!last_presensi.tanggal && !last_presensi.jam) return

    let lastPresensi = `${last_presensi.tanggal} ${last_presensi.jam}`
    const diff = moment().utcOffset(420).diff(lastPresensi, 'hours')
    console.log('diff', diff)
    if (parseInt(diff) < 24) return
    this.setState({ faceSync: true })
    let face = await API.getDev('FaceId', true, {})
    console.log('face', JSON.stringify(face))
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
        this.props.setFaceID(newFace.result[0].faceId)
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

    const presensiStatus = await API.getDev('ValidatePresensi', true, {
      perusahaan_id: this.props.auth.profile.perusahaan_id
    })

    if (presensiStatus.success) {
      this.setState({
        presensiStatus: {
          flag: presensiStatus.flag,
          message: presensiStatus.failureMessage
        }
      })
    }

    if (lastPresensi.data) {
      this.props.setLastPresensi(lastPresensi.data)
    }

    // const announcement = await API.getDev('list/pengumuman', true, { aktif: 'Y' })
    // console.log('announcement', JSON.stringify(announcement))
    const presensiConfig = await API.getDev('ConfigPresensi', true, { perusahaan_id: this.props.auth.profile.perusahaan_id, user_id: this.props.auth.profile.id })
    console.log('config presensi', presensiConfig)
    if (!presensiConfig.success)
      simpleToast("Gagal mengambil data konfigurasi presensi")
    else
      this.props.setPresensiConfig(presensiConfig.data)

    // if (!announcement.success) {
    //   simpleToast('Gagal mengambil pengumuman perusahaan')
    // }
    // this.setState({
    //   announcement: announcement.pengumuman
    // })
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


  setLogoutModal = () => {
    this.setState({ logoutModalVisible: !this.state.logoutModalVisible })
  }

  setSignoutModal = () => {
    this.setState({ signoutModalVisible: !this.state.signoutModalVisible })
  }

  renderProfileModal() {
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
            marginLeft: w(5),
            paddingVertical: fs(5),
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Thumbnail large source={sourceAvatar} />
          <View style={{ width: '100%' }}>

            <Button
              wrapperStyle={{ paddingHorizontal: fs(2), marginVertical: fs(1.5) }}
              label={this.props.auth.profile.nama}
              onPress={() => {
                this.setSignoutModal()
                this.props.navigation.navigate('HomeProfile')
              }}
              schema={{
                color: 'grey',
                backgroundColor: 'white'
              }}
              pressableStyle={{ elevation: 0 }}
              icon="user"
            />
            <Button
              wrapperStyle={{ paddingHorizontal: fs(2), marginVertical: fs(1) }}
              label="Logout"
              onPress={() => {
                this.props.resetPresensi()
                this.props.logout()
              }}
              schema={{
                color: '#fff',
                backgroundColor: 'red'
              }}
            />
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
            <HomePresensiOutModal
              data={this.props.presensi.last_presensi}
              homeProps={this.props.home}
              setLogoutModal={this.setLogoutModal}
              hideLogoutModal={this.props.hideLogoutAlert}
              navigation={this.props.navigation}
              isPresensiIn={this.state.isPresensiIn}
              presensiProhibited={this.state.presensiProhibited}
              radius={this.state.presensiRadius}
            />
            {this.renderProfileModal()}
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
                <View
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
                        { translateY: fs(-3) }
                      ]
                    }]}
                >
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      width: '65%'
                    }}
                  >
                    <Text
                      style={[
                        {
                          fontWeight: 'bold',
                          fontSize: fs(5),
                          color: scheme.primaryText,
                          opacity: 1
                        }
                      ]}
                    >{this.state.currentTime}</Text>

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
                </View>


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
                rIf={auth.profile.face_status == 'Y' && !hasPresensi && this.state.presensiStatus.flag == 1}
              />

              <BadgePresensi
                bgColor="white"
                bordered
                textColor={this.state.secondary}
                text={presensi.last_presensi.lokasi}
                title={`${presensi.last_presensi.flag == 'I' ? 'Masuk' : 'Keluar'}, ${moment(presensi.last_presensi.tanggal).format('DD MMMM YYYY')}`}
                subtitle={`${presensi.last_presensi.jam} WIB`}
                rIf={auth.profile.face_status == 'Y' && hasPresensi && this.state.presensiStatus.flag == 1}
              />

              <BadgePresensi
                bgColor={this.state.secondary}
                text="Anda belum melakukan registrasi wajah"
                textColor="white"
                button="REGISTER"
                onPress={() => {
                  this.props.navigation.navigate('HomeRegisterFaceCamera')
                }}
                rIf={this.state.presensiStatus.flag == 4}
              />

              <BadgePresensi
                bgColor={this.state.primary}
                // text="Registrasi wajah anda sedang dalam proses verifikasi"
                // title={this.state.presensiStatus.message}
                text={this.state.presensiStatus.message}
                textColor="white"
                button="Refresh Status"
                onPress={() => {
                  this.setState({
                    refreshing: true
                  })
                  this.getData()
                }}
                rIf={this.state.presensiStatus.flag != 1}
              />

              <HomeChart />


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

    setLastPresensi: (payload) => dispatch({ type: 'SET_LAST_PRESENSI', payload: payload }),
    setFaceID: (payload) => dispatch({ type: 'SET_FACE_ID', faceId: payload })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(HomeIndex)
