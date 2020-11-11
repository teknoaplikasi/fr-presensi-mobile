import { checkMultiple, PERMISSIONS } from 'react-native-permissions';


export const checkAllPermission = async () => {
  let check = await checkMultiple([PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION])

  console.log(JSON.stringify(check))
}