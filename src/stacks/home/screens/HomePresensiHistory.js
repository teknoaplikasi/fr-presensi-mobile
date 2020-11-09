import { Card, Col, Row, CardItem, Body, Thumbnail, Left, Right } from 'native-base'
import React, { Component } from 'react'
import { Text, View, StyleSheet, StatusBar, RefreshControl, ImageBackground } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { responsiveHeight as h, responsiveFontSize as fs, responsiveScreenWidth as w } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { simpleToast } from '../../../utils/DisplayHelper'
import { geocodeLatLong } from '../../../utils/GeolocationHelper'
import moment from 'moment'
import { connect } from 'react-redux'
import { ASSETS_URL } from '../../../../config'

class HomePresensiHistory extends Component {

  constructor() {
    super()

    this.state = {
      histories: [],
      statusData: null,
      loading: true
    }

    this.onRefresh = this.onRefresh.bind(this)
  }

  componentDidMount = async () => {
    // moment.locale('id')
    // this.initValue()
    // this.getData()

    // this.getData()
    this.isFocus = this.props.navigation.addListener('focus', () => {
      // moment.locale('id')
      this.initValue()
      this.getData()
    })
  }

  initValue = async () => {
    StatusBar.setBarStyle('dark-content')
    StatusBar.setBackgroundColor('#ffffff')


    // let test = await geocodeLatLong("-6.9837541", "110.4619592")
    // console.log('test', test)
  }

  // https://www.google.com/maps/place/PT+TEKNO+APLIKASI+SEJAHTERA+BASECAMP/@-7.0320996,110.4948269,17z/data=!3m1!4b1!4m5!3m4!1s0x2e708dbfe592e8dd:0x443bbcd9ec773060!8m2!3d-7.0320996!4d110.4970156

  getData = async () => {
    // moment().locale('id')
    let histories = await API.getDev('RiwayatPresensi', true, {
      perusahaan_id: this.props.auth.profile.perusahaan_id,
      id: this.props.auth.profile.id
    })


    console.log('history', histories)

    if (!histories.success) {
      this.setState({ statusData: histories.success, loading: false })
      return simpleToast('Gagal mendapatkan history presensi')
    }

    let arrHistories = []
    for (const [key, value] of Object.entries(histories.data)) {
      // console.log(`${key}: ${value}`);
      // console.log(value)
      arrHistories.push({
        date: moment(value.tanggal).format('DD MMMM YYYY'),
        in: value.masuk,
        out: value.keluar,
        presensi: value.lokasi_masuk
      })
    }


    this.setState({
      histories: arrHistories,
      statusData: histories.success,
      loading: false
    })
  }

  onRefresh = () => {
    this.setState({ loading: true })
    this.getData()
  }

  componentWillUnmount() {
    this.isFocus()
  }

  _renderTest() {
    return (
      <ImageBackground
        style={{
          width: w(100),
          height: h(100)
        }}
        source={{ uri: 'http://api-presensi.pttas.xyz/api/file/wajah/W-5MBb4PYGEzOHyOTJglU4iykU7MmKIpiUtJWsc3oDxB3vzrH3oF15Ojvh9T-PVghnKo686HQiCfZ9_cTHP96FA4HikBlzo2XTLeTwfcE55T7p8zkKqInoZRtB8.' }}
      />
    )
  }

  render() {
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
      <View style={styles.container}>
        {/* {this._renderTest()} */}
        <View
          style={{
            padding: fs(1.2),
            marginVertical: fs(1)
          }}
        >
          <Card>
            <CardItem>
              <Left>
                <Thumbnail
                  source={sourceAvatar} />
                <Body>
                  <Text style={{ fontWeight: 'bold' }}>{this.props.auth.profile.nama}</Text>
                  <Text>{this.props.auth.company.nama}</Text>
                </Body>
              </Left>
            </CardItem>
          </Card>

        </View>

        <ScrollView
          refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.onRefresh} />}
        >


          {
            this.state.histories.map((history, index) => {
              return (

                <View style={[
                  styles.historyWrapper,
                  { backgroundColor: index % 2 ? '#fff' : 'rgba(94, 114, 228, 0.04)' }
                ]}>
                  <Row>
                    <Col size={1}>
                      {
                        index !== this.state.histories.length - 1 &&
                        <View style={{
                          marginLeft: fs(4),
                          borderStyle: 'dotted',
                          height: '80%',
                          borderLeftWidth: 1,
                          borderColor: '#ff813f',
                          position: 'absolute',
                          top: '20%'
                        }} />
                      }
                      <View style={{ width: fs(2), height: fs(2), position: 'absolute', left: fs(4 - 1), top: '20%', borderRadius: fs(1), backgroundColor: '#ff662d' }}></View>

                      {
                        index !== 0 &&

                        <View style={{
                          marginLeft: fs(4),
                          borderStyle: 'dotted',
                          height: '20%',
                          borderColor: '#ff813f',
                          borderLeftWidth: 1,
                          position: 'absolute',
                        }} />
                      }
                    </Col>
                    <Col size={11} style={{ paddingVertical: fs(2), paddingLeft: fs(3.5) }}>
                      <Text style={{ fontWeight: 'bold' }}>{history.date}</Text>

                      <Row
                        style={{
                          paddingVertical: fs(1),
                        }}
                      >
                        <Icon name="stopwatch" style={{ color: '#0cad71' }} size={fs(3)} />
                        <View style={{ paddingLeft: fs(1), paddingRight: fs(3) }}>
                          <Text style={{ fontWeight: 'bold', color: '#705499' }}>Masuk {history.in}</Text>
                          <Text style={{ fontWeight: 'bold', color: '#705499' }}>Keluar {history.out}</Text>
                          <Text numberOfLines={3} style={{ color: '#705499', marginTop: fs(1) }}> di {history.presensi}</Text>
                        </View>
                      </Row>
                    </Col>
                  </Row>
                </View>
              )
            })
          }

        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },

  historyWrapper: {
    width: w(100),
    // height: h(10),
    position: 'relative',
  }
})

const mapStateToProps = (state) => ({
  auth: state.auth,
})

export default connect(mapStateToProps, null)(HomePresensiHistory)
