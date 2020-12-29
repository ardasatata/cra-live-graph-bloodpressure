import React from 'react';
import 'chartjs-plugin-streaming';

var Chart = require('chart.js');

class LineChart extends React.Component {
    constructor(props) {
        super(props);
        this.chartRef = React.createRef();
    }

    componentDidUpdate() {
        this.myChart.data.labels = this.props.labels;
        this.myChart.data.datasets[0].data = this.props.data[0];
        this.myChart.data.datasets[1].data = this.props.data[1];
        // this.myChart.data.datasets[2].data = this.props.data[2];
        this.myChart.options.scales.xAxes[0].ticks.min = this.props.min
        this.myChart.update();
    }

    componentDidMount() {
        this.myChart = new Chart(this.chartRef.current, {
            type: 'line',
            options: {
                scales: {
                    yAxes: [
                        {
                            ticks: {
                                min: 0,
                                max: 1,
                                stepSize: 20
                            }
                        }
                    ],
                    xAxes: [
                        {
                            ticks: {
                                stepSize: 200,
                                maxTicksLimit: 10,
                                min: 0
                        }
                    }]
                }
            },
            data: {
                labels: this.props.labels,
                datasets: [{
                    label: 'ECG',
                    data: this.props.data[0],
                    fill: 'none',
                    backgroundColor: '#FFFFFF',
                    pointRadius: 0,
                    borderColor: this.props.lineColor[0],
                    borderWidth: 3,
                    lineTension: 0.2
                },
                {
                    label: 'PPG',
                    data: this.props.data[1],
                    fill: 'none',
                    backgroundColor: '#FFFFFF',
                    pointRadius: 0,
                    borderColor: this.props.lineColor[1],
                    borderWidth: 3,
                    lineTension: 0.2
                },
                // {
                //     label: 'MBP',
                //     data: this.props.data[2],
                //     fill: 'none',
                //     backgroundColor: '#FFFFFF',
                //     pointRadius: 0,
                //     borderColor: this.props.lineColor[2],
                //     borderWidth: 3,
                //     lineTension: 0.2
                // }
                ]
            }
        });
    }

    render() {
        return <canvas height={this.props.height} width={this.props.width} ref={this.chartRef} />;
    }
}

export default LineChart
