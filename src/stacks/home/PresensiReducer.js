const intitialState = {
  last_presensi: {
    latitude: null,
    longitude: null,
    lokasi: '',
    tanggal: null,
    jam: null,
    flag: null,
    perusahaan_id: null
  },
  presensi_conf: []
}

const PresensiReducer = (state = intitialState, action) => {
  switch (action.type) {
    case 'SET_LAST_PRESENSI':
      return {
        ...state,
        last_presensi: {
          ...state.last_presensi,
          ...action.payload
        }
      }

    case 'RESET_PRESENSI':
      return intitialState


    case 'SET_PRESENSI_CONFIG':
      return {
        ...state,
        presensi_conf: action.presensi_conf
      }
    default:
      return state
  }
}

export default PresensiReducer