import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { responsiveWidth as w, responsiveHeight as h, responsiveFontSize as fs } from 'react-native-responsive-dimensions'
import { Card } from 'native-base'
import { TextInput } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/FontAwesome5'

export class HomeProfile extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Card style={styles.wrapper}>
          <Text style={styles.cardTitle}>Edit Profile</Text>
          <View style={styles.editForm}>
            <View style={styles.formInput}>
              <View style={styles.formIcon}>
                <Icon name="user" size={fs(2.1)} style={{ alignSelf: 'center' }} />
              </View>

              <View style={styles.formText}>
                <Text style={styles.formLabel}>Nama Lengkap</Text>
                <TextInput
                  value="Hendriyantooz"
                />

              </View>
            </View>

          </View>


        </Card>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    width: w(100),
    height: h(100),
    backgroundColor: 'white',
    paddingVertical: w(2, 5),
    paddingHorizontal: w(2.5)
  },

  wrapper: {
    borderRadius: 5,
    padding: fs(3)
  },

  cardTitle: {
    fontWeight: 'bold',
    fontSize: fs(2.5)
  },

  editForm: {
    width: '80%',
    // backgroundColor: 'yellow'
  },

  formInput: {
    borderColor: '#E2E2E2',
    // borderBottomWidth: 1,
    justifyContent: 'space-around',
    flexDirection: 'row',
    display: 'flex'
  },

  formLabel: {
    fontSize: fs(1)
  },

  formIcon: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: fs(5),
    height: fs(5),
    backgroundColor: '#E2E2E2',
    borderRadius: 7
  },

  formText: {
    alignSelf: 'flex-end',
    borderBottomWidth: 1.5,
    borderColor: '#E2E2E2',
    flexDirection: 'column',
    width: '90%',
    paddingLeft: fs(2)
  },
})

export default HomeProfile
