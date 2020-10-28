import React from 'react'
import { View, Text } from 'react-native'
import { connect } from 'react-redux'
import AppNavigation from './AppNavigation'
import AuthNavigation from './AuthNavigation'

function NavigationController(props) {
  console.log('props', props.isLoggedIn)
  if (props.isLoggedIn) {
    return <AppNavigation />
  }

  else if (!props.isLoggedIn) {
    return <AuthNavigation />
  }

  else {
    return null
  }
}


const mapStateToProps = (state) => ({
  ...state.auth
})
export default connect(mapStateToProps, null)(NavigationController)
