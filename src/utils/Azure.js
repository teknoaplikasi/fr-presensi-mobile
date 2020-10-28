import axios from 'axios'
import { cos } from 'react-native-reanimated';
import { AZURE_BASE_URL, AZURE_KEY } from '../../config'

export const AzureFaceAPI = {
  async verify(faceId1, faceId2) {
    var data = { "faceId1": faceId1, "faceId2": faceId2 }

    var config = {
      method: 'post',
      url: `${AZURE_BASE_URL}/face-verification`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    return axios(config)
      .then(function (response) {
        // console.log(JSON.stringify(response.data));
        return {
          success: true,
          result: response.data
        }
      })
      .catch(function (error) {
        return {
          success: false,
          error: error.response.data
        }
      });

  },

  async detect(imageUrl) {

    var data = new FormData();
    var imgPayload = {
      uri: imageUrl,
      type: 'image/jpeg',
      name: '1.jpg',
    }
    data.append('file', imgPayload);

    var config = {
      method: 'post',
      url: `${AZURE_BASE_URL}/face-registration`,
      headers: {
        'Ocp-Apim-Subscription-Key': AZURE_KEY,
        'Content-Type': 'application/octet-stream'
      },
      data: data
    };
    // console.log("manggil azure api")

    return axios(config)
      .then(function (response) {
        return {
          success: true,
          result: response.data
        }
      })
      .catch(function (error) {
        // console.log("ada error", error.response)

        return {
          success: false,
          error: error.response.data
        }
      });

  }
}