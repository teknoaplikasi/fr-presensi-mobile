const intitialState = {
  isLoggedIn: false,
  token: null,
  profile: {},
  faceId: '',
  company: {
    name: '',
    latitude: null,
    longitude: null,
    radius: null
  }
}

const AuthReducer = (state = intitialState, action) => {
  switch (action.type) {
    case 'IS_LOGGED_IN':
      return {
        ...state,
        isLoggedIn: true
      }

    case 'SET_TOKEN':
      return {
        ...state,
        token: action.token
      }
    case 'IS_LOGGED_OUT':
      return {
        ...intitialState,
        isLoggedIn: false,
        token: null,
        profile: {},
        company: intitialState.company
      }
    case 'SET_PROFILE':
      return {
        ...state,
        profile: action.profile
      }
    case 'EDIT_PROFILE':
      return {
        ...state,
        profile: {
          ...action.profile
        }
      }

    case 'SET_FACE_ID':
      return {
        ...state,
        faceId: action.faceId
      }
    case 'SET_COMPANY':
      return {
        ...state,
        company: action.company
      }
    default:
      return state
  }
}

export default AuthReducer