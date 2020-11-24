import React, { Component } from 'react';
import { readString } from 'react-papaparse'
import Papa from 'papaparse';
import LineChart from "./LineChart";

var Chart = require('chart.js');

const timer = ms => new Promise(res => setTimeout(res, ms))

const RATE = 8
const RANGE = 300
const CURRENT_DELAY = 25

class DataParser extends Component {

    constructor(props) {
        super(props);

        this.state = {
            key: 0,
            data: [],
            SBP : [1,3,2,1],
            index: [1,2,3,4],
            current : 0
        };

        this.chartRef = React.createRef();

        this.getData = this.getData.bind(this);
    }

    componentWillMount() {
        this.getCsvData();
    }

    componentDidMount() {

    }

    fetchCsv() {
        console.log('get csv from api')
        return fetch('http://140.115.51.225:5000/get-csv-result?number=3000').then(function (response) {
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

        let delay = 0

        for (var i = 1; i < this.state.data.length; i++) {
            // console.log(this.state.data[i][0])
            // localIndex[i] = this.state.data[i][0].replace(/\n/g, '')
            localIndex[i] = i
            localSBP[i] = this.state.data[i][0]
            await timer(RATE)
            this.setState({
                index : localIndex,
                SBP : localSBP
            })

            if(delay===0) {
                this.setState({
                    current : parseInt(this.state.data[i][0])
                })
            }

            delay +=1

            if (delay===CURRENT_DELAY)
                delay = 0
        }
    }

    async getCsvData() {
        let csvData = await this.fetchCsv();

        console.log('parse csv')

        Papa.parse(csvData, {
            skipEmptyLines: true,
            complete: this.getData
        });
    }

    render() {
        // Your render function
        return (
            <div className={"flex flex-col h-screen justify-center items-center bg-white"}>
                <button className={"bg-blue-500 text-sm p-2 rounded-md text-white hover:bg-blue-700"} onClick={()=>this.convertData()}>Convert Data</button>

                <div className={"flex flex-col w-full p-12"}>
                    <CurrentPressure value={this.state.current}/>
                    <LineChart
                        title={'Blood Pressure'}
                        labels={this.state.index}
                        data={this.state.SBP}
                        min={this.state.index.length - RANGE}
                        height={480}
                        width={0}
                        color="#3E517A"
                        lineColor="#9ad3bc"
                    />
                </div>
            </div>
        )


    }
}

const CurrentPressure = ({value=0, unit='mm Hg'}) => {

    const valueColor = (value) => {
        if(value > 80 && value < 120){
            return "text-green-700"
        } else if (value < 80){
            return "text-yellow-700"
        } else if (value > 120){
            return "text-red-700"
        } else {
            return "text-grey-700"
        }
    }

    return (
        <div className={"transition duration-300 ease-in-out text-2xl font-bold "+valueColor(value)}>
            {value} {unit}
        </div>
    )
}

export default DataParser;
