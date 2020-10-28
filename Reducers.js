import { combineReducers } from 'redux'

import AuthReducer from './src/stacks/auth/AuthReducer'
import HomeReducer from './src/stacks/home/HomeReducer'
import PresensiReducer from './src/stacks/home/PresensiReducer'
const RootReducer = combineReducers({
  auth: AuthReducer,
  home: HomeReducer,
  presensi: PresensiReducer
})

export default RootReducer
