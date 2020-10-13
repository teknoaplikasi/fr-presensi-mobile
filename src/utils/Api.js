var axios = require('axios');
var FormData = require('form-data');


export const API = {
  upload(imageFile, name) {

    var data = new FormData();
    var imgPayload = {
      uri: imageFile,
      type: 'image/jpeg',
      name: name + '.jpeg',
    }
    data.append('file', imgPayload);
    data.append('name', name);

    var config = {
      method: 'post',
      url: 'http://fr.pttas.xyz/register',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      data: data
    };

    return axios(config)
      .then(function (response) {
        return { success: true, result: response.data }
      })
      .catch(function (error) {
        console.log(error.response);
        return { success: false, error: error.response }

      });
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
      name: name + '.jpeg',
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
        console.log(error.response);
        return { success: false, error: error.response.data }

      });
  }
}

