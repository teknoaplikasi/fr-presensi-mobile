import React, { Component } from 'react'
import { RefreshControl, Text, View } from 'react-native'
import { Item, Input, Icon, Button } from 'native-base'
import { FlatList, ScrollView, TouchableOpacity } from 'react-native-gesture-handler'
import { responsiveScreenWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { API } from '../../../utils/Api'

export class SearchKota extends Component {

  constructor() {
    super()

    this.state = {
      cityList: [],
      loading: true,
      query: {
        recperpage: 20,
        start: 0,
        psearch: ''
      }
    }

    this.renderItem = this.renderItem.bind(this)
    this.renderHeader = this.renderHeader.bind(this)
    this.onEndSearch = this.onEndSearch.bind(this)
    this.onInfinite = this.onInfinite.bind(this)
    this.onChangeSearch = this.onChangeSearch.bind(this)
  }

  componentDidMount = async () => {
    this.getData()


    this.isFocus = this.props.navigation.addListener('focus', async () => {
      // this.initValue()
      this.getData()
    })
  }

  getData = async () => {
    this.setState({ loading: true })
    let cityList = await API.getDev('list/kota', false, this.state.query)
    // alert(cityList.kota.length)
    this.setState({
      cityList: cityList.kota,
      loading: false
    })
  }

  onEndSearch = async () => {
    // alert('wkwk')
  }

  onChangeSearch = async (value) => {
    // alert(value)
    this.setState(prevState => ({
      query: {
        ...prevState.query,
        psearch: value
      }
    }))
  }

  onSelectItem = (item) => {
    // this.props.onSelect(item)
    this.props.route.params.onSelect(item)
    this.props.navigation.pop()
  }

  onInfinite = async () => {
    this.setState(prevState => ({
      query: {
        ...prevState.query,
        recperpage: prevState.query.recperpage += 20
      }
    }), () => {
      this.getData()
    })
  }

  componentWillUnmount = () => {
    this.isFocus()
  }

  renderItem({ item }) {
    return (
      <TouchableOpacity
        style={{
          borderColor: 'rgba(172,172,172,.5)',
          paddingVertical: fs(1.5),
          borderBottomWidth: 1,
          marginHorizontal: fs(2)
        }}
        onPress={() => { this.onSelectItem(item) }}
      >
        <Text>{item.nama}</Text>
      </TouchableOpacity>
    )
  }

  renderHeader() {
    return (
      <View
        style={{
          backgroundColor: 'rgba(172,172,172,.2)',
          borderRadius: 7,
          paddingHorizontal: fs(1.5),
          marginVertical: fs(2),
          marginHorizontal: fs(1.5)
        }}
      >
        <Item>
          <Icon name="ios-search" />
          <Input
            placeholder="Search"
            onChangeText={(e) => { this.onChangeSearch(e) }}
            onEndEditing={this.getData}
            returnKeyType="search"
            returnKeyLabel="Cari"
          />
        </Item>
      </View>
    )
  }


  render() {
    return (
      <View style={{
        width: w(100),
        backgroundColor: 'white'
      }}>
        {/* {this.renderItem()} */}
        <FlatList
          onEndReached={this.onInfinite}
          onEndReachedThreshold={0.1}
          data={this.state.cityList}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
          ListHeaderComponent={this.renderHeader}
          refreshControl={<RefreshControl refreshing={this.state.loading} />}
        />
      </View>
    )
  }
}

export default SearchKota
