import { Body, Card, CardItem, Col, Row } from 'native-base';
import React, { Component } from 'react'
import { Text, View } from 'react-native'

import { PieChart } from "react-native-chart-kit";
import Theme from '../../../utils/Theme';
import { responsiveWidth as w, responsiveFontSize as fs } from 'react-native-responsive-dimensions'

export class HomeChart extends Component {
  constructor(props) {
    super()

    this.state = {
      chart: {
        attendance: [],
        presensi: []
      }
    }

  }

  componentDidMount() {
    const attendance = [
      {
        name: "Terlambat",
        population: 300,
        color: 'orange',
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Ontime",
        population: 60,
        color: "#9b5df5",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
      },

    ];

    const presensi = [
      {
        name: "Presensi",
        population: 160,
        color: 'orange',
        legendFontColor: "#7F7F7F",
        legendFontSize: 15,
      },
      {
        name: "Abstain",
        population: 200,
        color: "#9b5df5",
        legendFontColor: "#7F7F7F",
        legendFontSize: 15
      },

    ];
    this.setState({
      chart: {
        attendance: attendance,
        presensi: presensi
      }
    })
  }
  render() {
    return (
      <Row style={{ backgroundColor: Theme.default.primaryBg, marginVertical: fs(2), height: 'auto' }}>
        <Col size={6}>
          <Card style={{ borderRadius: fs(1), overflow: 'hidden', }}>
            <CardItem style={{ backgroundColor: Theme.default.secondaryBg }}>
              <Body style={{ display: 'flex', justifyContent: 'center' }}>
                <PieChart
                  data={this.state.chart.attendance}
                  width={100}
                  height={100}
                  hasLegend={false}
                  chartConfig={{
                    backgroundGradientFrom: "#1E2923",
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientTo: "#08130D",
                    backgroundGradientToOpacity: 0.5,
                    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                    strokeWidth: 2, // optional, default 3
                    barPercentage: 0.5,
                    useShadowColorFromDataset: false // optional
                  }}
                  accessor="population"
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
                }}>ATTENDANCE</Text>

                {/* LEGEND */}
                <Row style={{ marginVertical: fs(1) }}>
                  {
                    this.state.chart.attendance.map((data, i) => (
                      <Col style={{ flexDirection: 'row' }} key={i}>
                        <View style={{ width: fs(1.5), height: fs(1.5), backgroundColor: data.color, borderRadius: 1.5 }}
                        />
                        <Text style={{ fontSize: fs(1.3), paddingLeft: fs(.5) }}>{data.name}</Text>
                      </Col>
                    ))
                  }
                </Row>
              </Body>
            </CardItem>
          </Card>
        </Col>
        <Col size={6}>
          <Card style={{ borderRadius: fs(1), overflow: 'hidden' }}>
            <CardItem style={{ backgroundColor: Theme.default.secondaryBg }}>
              <Body style={{ display: 'flex', justifyContent: 'center' }}>
                <PieChart
                  data={this.state.chart.presensi}
                  width={100}
                  height={100}
                  hasLegend={false}
                  chartConfig={{
                    backgroundGradientFrom: "#1E2923",
                    backgroundGradientFromOpacity: 0,
                    backgroundGradientTo: "#08130D",
                    backgroundGradientToOpacity: 0.5,
                    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                    strokeWidth: 2, // optional, default 3
                    barPercentage: 0.5,
                    useShadowColorFromDataset: false // optional
                  }}
                  accessor="population"
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
                }}>PRESENSI</Text>

                {/* LEGEND */}
                <Row style={{ marginVertical: fs(1) }}>
                  {
                    this.state.chart.presensi.map((data, i) => (
                      <Col style={{ flexDirection: 'row' }} key={i}>
                        <View style={{ width: fs(1.5), height: fs(1.5), backgroundColor: data.color, borderRadius: 1.5 }}
                        />
                        <Text style={{ fontSize: fs(1.3), paddingLeft: fs(.5) }}>{data.name}</Text>
                      </Col>
                    ))
                  }
                </Row>
              </Body>
            </CardItem>
          </Card>
        </Col>

      </Row>
    )
  }
}

export default React.memo(HomeChart)
