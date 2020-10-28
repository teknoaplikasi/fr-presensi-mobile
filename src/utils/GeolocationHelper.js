import axios from 'axios'
import { GMAPS_KEY } from '../../config'
import {
  circleContainsLocation
} from "@goparrot/react-native-geometry-utils";


export function geocodeLatLong(latitude, longitude) {
  if (!latitude || !longitude) {
    return {
      success: false,
      error_message: 'Latitude & Longitude value is mandotary'
    }
  }

  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GMAPS_KEY}`)
    .then(response => {
      // console.log('result', response.data)
      return {
        success: true,
        result: response.data.results[0].formatted_address
      }
    })
    .catch(err => {
      // console.log('err', err.response.data)
      return {
        success: false,
        error: err.response.data
      }
    })

}

export async function geofenceRadius(geoIn, geoDevice, radius) {
  const cicle = {
    center: {
      latitude: geoIn.latitude,
      longitude: geoIn.longitude,
    },
    radius: radius
  }

  const pointIn = {
    latitude: geoDevice.latitude,
    longitude: geoDevice.longitude,
  }

  let isValid = await circleContainsLocation(pointIn, cicle)
  console.log('helper is valid', isValid)
  return isValid
}