import React from 'react'
import { View, Text } from 'react-native'
import { Row, Col, Card, CardItem, Button, Body } from 'native-base'
import { responsiveFontSize as fs, responsiveWidth as w } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'

const BadgePresensi = ({
  bgColor,
  text,
  title,
  subtitle,
  textColor,
  bordered,
  button,
  onPress,
  rIf
}) => {
  if (!rIf) return null;
  return (

    <Row style={{ height: 'auto' }}>
      <Col>
        <Card style={[
          { borderRadius: fs(1), overflow: 'hidden' }
        ]}>
          <CardItem
            style={[
              bordered && { borderWidth: 2, borderColor: textColor },
              { backgroundColor: bgColor },
              { borderRadius: fs(1), overflow: 'hidden' }
              // bordered && { borderWidth: 1, borderColor: textColor }
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                onPress ? onPress() : null
              }}
            >
              <Body style={{ paddingBottom: fs(1) }}>
                {title &&
                  <Text
                    style={{
                      color: textColor,
                      fontSize: fs(2),
                      fontWeight: 'bold'
                    }}
                  >{title}</Text>
                }
                {subtitle &&
                  <Text
                    style={{
                      color: textColor,
                      fontWeight: 'bold',
                      fontSize: fs(2)
                    }}
                  >{subtitle}</Text>
                }
                <Text
                  style={{
                    color: textColor,
                    fontSize: fs(2),
                    width: w(80),
                    // paddingRight: fs(3),
                    // lineHeight: fs(3.8)
                  }}
                  numberOfLines={3}
                >{text}</Text>
                {
                  button &&
                  <Button transparent>
                    <Text style={{ color: textColor, fontWeight: 'bold', alignSelf: 'flex-end' }}>{button}</Text>
                  </Button>

                }
              </Body>
            </TouchableOpacity>
          </CardItem>
        </Card>
      </Col>
    </Row >
  )
}

export default React.memo(BadgePresensi)