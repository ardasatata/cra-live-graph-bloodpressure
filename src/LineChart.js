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
        this.myChart.data.datasets[0].data = this.props.data;
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
                                min: 60,
                                max: 140,
                                stepSize: 20
                            }
                        }
                    ],
                    xAxes: [
                        {
                            ticks: {
                                stepSize: 100,
                                maxTicksLimit: 10,
                                min: 0
                        }
                    }]
                }
            },
            data: {
                labels: this.props.labels,
                datasets: [{
                    label: this.props.title,
                    data: this.props.data,
                    fill: 'none',
                    backgroundColor: '#FFFFFF',
                    pointRadius: 0,
                    borderColor: this.props.lineColor,
                    borderWidth: 3,
                    lineTension: 0.2
                }]
            }
        });
    }

    render() {
        return <canvas height={this.props.height} width={this.props.width} ref={this.chartRef} />;
    }
}

export default LineChart
