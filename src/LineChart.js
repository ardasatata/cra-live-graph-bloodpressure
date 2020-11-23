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
                                max: 200,
                                stepSize: 50
                            }
                        }
                    ]
                }
            },
            data: {
                labels: this.props.labels,
                datasets: [{
                    label: this.props.title,
                    data: this.props.data,
                    fill: 'none',
                    backgroundColor: this.props.color,
                    pointRadius: 0,
                    borderColor: this.props.color,
                    borderWidth: 1,
                    lineTension: 0.5
                }]
            }
        });
    }

    render() {
        return <canvas ref={this.chartRef} />;
    }
}

export default LineChart
