
import axios from 'axios'
import { Store } from '../../Store'
import { BASE_URL, API_URL } from '../../config'
import { useDispatch } from 'react-redux'


export const API = {
  async getDev(path = '', auth = false, params = {}) {
    path = `${API_URL}${path}`
    // console.log(params)
    let headers = {}
    headers['Content-Type'] = 'application/json'
    if (auth) {
      let state = Store.getState()
      auth = state.auth.token
      headers['X-Authorization'] = auth
    }

    console.log('called')
    return axios.get(path, {
      headers: headers,
      params: params
    })
      .then(res => {
        //53w5 redux hook

        // const dispatch = useDispatch()
        if (res.success) {
          // return dispatch({
          //   type: 'IS_LOGGED_OUT'
          // })
          return {
            success: true,
            result: res.data
          }
        }

        else {
          // const dispatch = useDispatch()
          // if (res.data.failureMesssage == 'Not authorized')
          //   return dispatch({
          //     type: 'IS_LOGGED_OUT'
          //   })
          return res.data
        }

      })
      .catch(err => {
        console.log('error get', JSON.stringify(err))
        return {
          success: false,
          error: err.response.data,
          response: err.response
        }
      })
  },
  async postDev(path = '', auth = false, body = {}) {
    path = `${API_URL}${path}`
    let headers = {}
    headers['Content-Type'] = 'application/json'
    if (auth) {
      let state = Store.getState()
      auth = state.auth.token
      headers['X-Authorization'] = auth
    }

    return axios({
      method: 'POST',
      url: path,
      headers: headers,
      data: body
    })
      .then(res => {
        if (res.success) {
          return {
            success: true,
            result: res.data
          }
        }

        else {
          return res.data
        }

      })
      .catch(err => {
        console.log('err post', JSON.stringify(err))
        return {
          success: false,
          // error: err.response.data,
          response: err.response
        }
      })
  },

  async get(path = '', auth = false, params = {}) {
    path = `${BASE_URL}${path}`
    console.log(params)
    let headers = {}
    headers['Content-Type'] = 'application/json'
    if (auth) {
      let state = Store.getState()
      auth = state.auth.token
      headers['X-Authorization'] = auth
    }

    console.log('called')
    return axios.get(path, {
      headers: headers,
      params: params
    })
      .then(res => {
        // const dispatch = useDispatch()
        // return dispatch({
        //   type: 'IS_LOGGED_OUT'
        // })
        if (res.success) {
          return {
            success: true,
            result: res.data
          }
        }

        else {
          return res.data
        }

      })
      .catch(err => {
        console.log('err', err)
        return {
          success: false,
          error: err.response.data,
          response: err.response
        }
      })
  },

  async post(path = '', auth = false, body = {}) {
    path = `${BASE_URL}${path}`

    let headers = {}
    headers['Content-Type'] = 'application/json'
    if (auth) {
      let state = Store.getState()
      auth = state.auth.token
      headers['X-Authorization'] = auth
    }

    return axios.get(path, {
      headers: headers,
      data: body
    })
      .then(res => {
        if (res.success) {
          return {
            success: true,
            result: res.data
          }
        }

        else {
          return res.data
        }
      })
      .catch(err => {
        return {
          success: false,
          error: err.response.data,
          response: err.response
        }
      })
  },

  recognition(imageFile) {

    var data = new FormData();
    var imgPayload = {
      uri: imageFile,
      type: 'image/jpeg',
      name: 'hmm.jpeg',
    }
    data.append('file', imgPayload);

    var config = {
      method: 'post',
      url: 'http://fr.pttas.xyz/recognition',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: data
    };

    return axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.status));
        // return Promise.resolve(response.data)
        return { success: true, result: response.data }
      })
      .catch(function (error) {
        console.log(error.response);
        // return Promise.reject(error.response)
        return { success: false, error: error.response.data }
      });
  },

  verification(imageFile, name) {

    var data = new FormData();
    var imgPayload = {
      uri: imageFile,
      type: 'image/jpeg',
      name: 'verif.jpg',
    }
    data.append('file', imgPayload);
    data.append('name', name);

    var config = {
      method: 'post',
      url: 'http://fr.pttas.xyz/verification',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: data
    };

    return axios(config)
      .then(function (response) {
        console.log('success')
        return { success: true, result: response.data }
      })
      .catch(function (error) {
        // console.log(error.response);
        return { success: false, error: error.response.data }

      });
  },

  registerFace(imageFile, userId, faceId) {
    let data = new FormData()
    let imgPayload = {
      uri: imageFile,
      type: 'image/jpeg',
      name: '1.jpg'
    }

    data.append('foto_wajah', imgPayload)
    data.append('users_id', userId)
    data.append('face_id', faceId)

    const state = Store.getState()
    // alert(state.auth.token)
    return axios({
      method: 'POST',
      url: `${API_URL}add/wajah`,
      // url: 'http://192.168.0.184/presensi21/api/add/wajah',
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Authorization': state.auth.token
      },
      data: data
    })
      .then(response => {
        return {
          success: true,
          result: response.data
        }
      })
      .catch(err => {
        return {
          success: false,
          err: err.response.data ? err.response.data : 'Network Error'
        }
      })
  },

  test(imageFile) {

    var data = new FormData();
    var imgPayload = {
      uri: imageFile,
      type: 'image/jpeg',
      name: 'verif.jpg',
    }
    data.append('file', imgPayload);
    // data.append('name', name);

    var config = {
      method: 'post',
      url: 'http://192.168.0.110:8010/upload',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: data
    };

    return axios(config)
      .then(function (response) {
        console.log('success')
        return { success: true, result: response.data }
      })
      .catch(function (error) {
        console.log(error.response);
        return { success: false, error: error.response.data }

      });
  }


}

// export default API

