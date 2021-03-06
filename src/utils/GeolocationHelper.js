import axios from 'axios'
import { GMAPS_KEY } from '../../config'
import Geolocation from '@react-native-community/geolocation';


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

export async function distanceBeetweenCoordinates(lat1, lon1, lat2, lon2, unit = "K") {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  }
  else {
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist;
  }
}

export async function shortestDistance(coords, arrayOfCoords) {
  let shortestDistance = null
  let shortestDistanceValue = 0
  await Promise.all(
    arrayOfCoords.map(async (coord, i) => {
      let dist = await distanceBeetweenCoordinates(coords.latitude, coords.longitude, parseFloat(coord.latitude), parseFloat(coord.longitude))

      if (dist > shortestDistanceValue) {
        shortestDistance = coord
        shortestDistance.distance = dist * 1000
      }
    })
  )
  console.log('coords', coords)
  console.log('shortest distance', shortestDistance)
  return {
    shortestDistance: shortestDistance,
    presensiProhibited: shortestDistance.distance > parseFloat(shortestDistance.radius)
  }
}

export async function currentDeviceLocation() {
  return new Promise(async (resolve, reject) => {
    Geolocation.getCurrentPosition(async ({ coords }) => {

      let locationDetail = await geocodeLatLong(coords.latitude, coords.longitude)
      if (!locationDetail.success) {

        return resolve({
          success: false,
          coordinates: coords,
          errorMessage: 'Gagal mengambil informasi lokasi'
        })
      }
      coords.detail = locationDetail.result
      return resolve({
        success: true,
        coordinates: coords
      })
    }, (err) => {
      if ('PERMISSION_DENIED' in err && err.PERMISSION_DENIED == 1) {
        return resolve({
          success: false,
          locationService: false,
          errorMessage: 'Lokasi tidak aktif',
          debug: JSON.stringify(err)
        })
      }
      return resolve({
        success: false,
        locationService: false,
        errorMessage: JSON.stringify(err)
      })
    })
  })
}