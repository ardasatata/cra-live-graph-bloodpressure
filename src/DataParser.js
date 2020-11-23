import React, { Component } from 'react';
import { readString } from 'react-papaparse'
import Papa from 'papaparse';
import LineChart from "./LineChart";

var Chart = require('chart.js');

const timer = ms => new Promise(res => setTimeout(res, ms))

class DataParser extends Component {

    constructor(props) {
        super(props);

        this.state = {
            key: 0,
            data: [],
            SBP : [1,3,2,1],
            index: [1,2,3,4]
        };

        this.chartRef = React.createRef();

        this.getData = this.getData.bind(this);
    }

    componentWillMount() {
        this.getCsvData();
    }

    componentDidMount() {
        // this.myChart = new Chart(this.chartRef.current.getContext("2d"), {
        //     type: 'line',
        //     data: {
        //         labels: [5,12,51],
        //         datasets: [{
        //             label: '# of Votes',
        //             data: this.state.index,
        //             borderWidth: 1,
        //             backgroundColor:'rgba(255, 99, 132, 0.2)',
        //         }]
        //     }
        // });
    }

    fetchCsv() {
        return fetch('result.csv').then(function (response) {
            let reader = response.body.getReader();
            let decoder = new TextDecoder('utf-8');

            return reader.read().then(function (result) {
                return decoder.decode(result.value);
            });
        });
    }

    getData(result) {
        this.setState({data: result.data});
    }

    async convertData(){
        const localIndex = []
        const localSBP = []


        for (var i = 1; i < this.state.data.length; i++) {
            console.log(this.state.data[i][0])
            // localIndex[i] = this.state.data[i][0].replace(/\n/g, '')
            localIndex[i] = i
            localSBP[i] = this.state.data[i][0]
            await timer(8)
            this.setState({
                index : localIndex,
                SBP : localSBP
            })
        }

        console.log(this.myChart)
    }

    async getCsvData() {
        let csvData = await this.fetchCsv();

        Papa.parse(csvData, {
            skipEmptyLines: true,
            complete: this.getData
        });
    }

    render() {
        // Your render function
        return (
            <div>
                {/*{this.state.index}*/}
                <button onClick={()=>this.convertData()}>Convert Data</button>

                <LineChart
                    labels={this.state.index}
                    data={this.state.SBP}
                    min={this.state.index.length - 400}
                    color="#3E517A"
                >

                </LineChart>
            </div>
        )


    }
}

export default DataParser;
