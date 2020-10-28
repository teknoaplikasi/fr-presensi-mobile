const intitialState = {
  logoutAlert: false
}

const HomeReducer = (state = intitialState, action) => {
  switch (action.type) {
    case 'PRESENT_LOGOUT_ALERT':
      return {
        ...state,
        logoutAlert: true
      }
    case 'HIDE_LOGOUT_ALERT':
      return {
        ...state,
        logoutAlert: false
      }
    default:
      return state
  }
}

export default HomeReducer