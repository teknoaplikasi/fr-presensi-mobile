import { PieChart } from "react-native-chart-kit";

import React from 'react'
import { View, Text } from 'react-native'
import { Body, Col, Row } from 'native-base'
import { responsiveFontSize as fs } from 'react-native-responsive-dimensions'

const PieChartComponent = ({ data, title, rIf }) => {
  console.log(data)
  if (!rIf) return null
  return (

    <Body style={{ display: 'flex', justifyContent: 'center' }}>
      <PieChart
        data={data}
        width={100}
        height={100}
        hasLegend={false}
        // width={screenWidth}
        // height={220}

        chartConfig={{
          backgroundGradientFrom: "#1E2923",
          backgroundGradientFromOpacity: 0,
          backgroundGradientTo: "#08130D",
          backgroundGradientToOpacity: 0.5,
          color: (opacity = 1) => `rgba(26, 255, 146, 1)`,
          strokeWidth: 2, // optional, default 3
          barPercentage: 0.5,
          useShadowColorFromDataset: false // optional
        }}
        // accessor="population"
        backgroundColor="transparent"
        paddingLeft="30"
        absolute
        style={{
          alignSelf: 'center'
        }}
      />

      <Text style={{
        alignSelf: 'center',
        color: '#493a76',
        fontWeight: 'bold',
        fontSize: fs(1.8)
      }}>{title}</Text>

      {/* LEGEND */}
      <Row style={{ marginVertical: fs(1) }}>
        {
          data.map(d => (
            <Col style={{ flexDirection: 'row' }}>
              <View style={{ width: fs(1.5), height: fs(1.5), backgroundColor: d.color, borderRadius: 1.5 }}
              />
              <Text style={{ fontSize: fs(1.3), paddingLeft: fs(.5) }}>{d.name}</Text>
            </Col>
          ))
        }
      </Row>
    </Body>
  )
}

export default React.memo(PieChartComponent)
