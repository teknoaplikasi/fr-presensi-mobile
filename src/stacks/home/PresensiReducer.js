const intitialState = {
  last_presensi: {
    latitude: null,
    longitude: null,
    lokasi: '',
    tanggal: null,
    jam: null,
    flag: null,
    perusahaan_id: null
  }
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
    default:
      return state
  }
}

export default PresensiReducer