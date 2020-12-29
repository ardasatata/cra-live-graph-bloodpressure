import React, { Component } from 'react';
import { readString } from 'react-papaparse'
import Papa from 'papaparse';
import LineChart from "./LineChart";

var Chart = require('chart.js');

const timer = ms => new Promise(res => setTimeout(res, ms))

const RATE = 8 // 8 = 125Hz
const RANGE = 80
const CURRENT_DELAY = 10

const API = 'http://140.115.51.225:5000'

class DataParser extends Component {

    constructor(props) {
        super(props);

        this.state = {
            key: 0,
            data: {

                ECG: [],
                PPG: []
            },

            ECG : [1,0,0,1],
            PPG : [0,1,1,0],

            index: [1,2,3,4],

            currentSBP : 0,
            currentDBP : 0,
            currentMBP : 0,

            gtSBP : 0,
            gtDBP : 0,
            gtMBP : 0,

            maeSBP : 0,
            maeDBP : 0,
            maeMBP : 0,

            rmseSBP : 0,
            rmseDBP : 0,
            rmseMBP : 0,

            currentECG : 0,
            currentPPG : 0,

            patientNumber : 9601
        };

        this.chartRef = React.createRef();

        this.getData = this.getData.bind(this);
        this.setSBPData = this.setSBPData.bind(this);
        this.setDBPData = this.setDBPData.bind(this);
        this.setMBPData = this.setMBPData.bind(this);

        this.setECG = this.setECG.bind(this);
        this.setPPG = this.setPPG.bind(this);
        this.setECG_PPG = this.setECG_PPG.bind(this);


        this.handleInputPatient = this.handleInputPatient.bind(this);
    }

    componentWillMount() {
        // this.getCsvData();
    }

    componentDidMount() {

    }

    fetchCsv(path) {
        console.log('get csv from api'+ path)
        return fetch(path).then(function (response) {
        // return fetch(API+'/get-csv-result?number=3000').then(function (response) {
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

    setSBPData(result) {
        this.setState(prevState => ({data: {
                ...prevState.data,
                SBP: result.data
            }}));
    }

    setDBPData(result) {
        this.setState(prevState => ({data: {
                ...prevState.data,
                DBP: result.data
            }}));
    }

    setMBPData(result) {
        this.setState(prevState => ({data: {
                ...prevState.data,
                MBP: result.data
            }}));
    }

    setECG(result) {
        this.setState(prevState => ({data: {
                ...prevState.data,
                ECG: result
            }}));
    }

    setPPG(result) {
        this.setState(prevState => ({data: {
                ...prevState.data,
                PPG: result
            }}));
    }

    setECG_PPG(result){

        let resultECG = []
        let resultPPG = []

        for (var i = 0; i < result.data.length; i++) {
            resultECG[i] = result.data[i][1]
            resultPPG[i] = result.data[i][0]
        }

        this.setECG(resultECG)
        this.setPPG(resultPPG)

    }

    async convertData(){

        const localIndex = []

        const localECG = []
        const localPPG = []

        let delay = 0

        for (var i = 1; i < this.state.data.ECG.length; i++) {
            // console.log(this.state.data[i][0])
            // localIndex[i] = this.state.data[i][0].replace(/\n/g, '')
            localIndex.push(i)

            localECG[i] = this.state.data.ECG[i]
            localPPG[i] = this.state.data.PPG[i]

            await timer(RATE)
            this.setState({
                index : localIndex,
                ECG : localECG,
                PPG : localPPG
            })

            // console.log(this.state.data.PPG)
            // console.log(this.state.index)

            if(delay===0) {
                this.setState({
                    currentECG : this.state.data.ECG[i],
                    currentPPG : this.state.data.PPG[i]
                })
            }

            delay +=1
            if (delay===CURRENT_DELAY)
                delay = 0
        }

    }

    async getCsvData() {
        // let sbp_data = await this.fetchCsv('result/testing_7_feature_RF_SBP.csv');
        // console.log('parse csv SBP')
        // Papa.parse(sbp_data, {
        //     skipEmptyLines: true,
        //     complete: this.setSBPData
        // });
        //
        // let dbp_data = await this.fetchCsv('result/testing_7_feature_RF_DBP.csv');
        // console.log('parse csv DBP')
        // Papa.parse(dbp_data, {
        //     skipEmptyLines: true,
        //     complete: this.setDBPData
        // });
        //
        // let mbp_data = await this.fetchCsv('result/testing_7_feature_RF_MBP.csv');
        // console.log('parse csv MBP')
        // Papa.parse(mbp_data, {
        //     skipEmptyLines: true,
        //     complete: this.setMBPData
        // });

        if(this.state.patientNumber > 9600 && this.state.patientNumber <= 12000){
            let ecg_ppg = await this.fetchCsv(API + "/get-ecg-ppg?index="+this.state.patientNumber);
            console.log('parse csv ECG PPG')
            Papa.parse(ecg_ppg, {
                skipEmptyLines: true,
                complete: this.setECG_PPG
            });

            let predictData = await this.fetchCsv(API + "/predict?index="+this.state.patientNumber);

            let predictResult = JSON.parse(predictData.toString())

            // console.log(predictResult.data)

            this.setState({
                currentMBP : predictResult.data.mbp,
                currentSBP : predictResult.data.sbp,
                currentDBP : predictResult.data.dbp,

                gtSBP: predictResult.data.gt_sbp,
                gtMBP: predictResult.data.gt_mbp,
                gtDBP: predictResult.data.gt_dbp,

                maeSBP : predictResult.data.sbp_mae,
                maeDBP : predictResult.data.dbp_mae,
                maeMBP : predictResult.data.mbp_mae,

                rmseSBP : predictResult.data.sbp_rmse,
                rmseDBP : predictResult.data.dbp_rmse,
                rmseMBP : predictResult.data.mbp_rmse,
            })
        } else {
            alert("please submit a value between 9601 and 12000")
            this.setState({
                patientNumber : 9601
            })
        }

    }

    handleInputPatient(evt) {
        this.setState({
            patientNumber : evt.target.value
        })
    }

    render() {
        // Your render function
        return (
            <div className={"flex flex-col h-screen justify-center items-center bg-white"}>
                <div className={"mb-2 flex flex-col items-center"}>
                    <svg width="335" height="104" viewBox="0 0 335 104" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24.912 28.712C31.68 33.536 40.104 40.664 43.992 45.2L47.376 41.672C43.344 37.136 34.776 30.296 28.08 25.616L24.912 28.712ZM55.008 48.224C59.04 56.648 63.072 68.024 64.512 75.368L69.12 73.568C67.68 66.224 63.576 55.136 59.4 46.496L55.008 48.224ZM10.152 48.296C9.072 56.576 6.696 67.88 3.528 75.152L8.28 77.24C11.232 69.608 13.608 57.512 14.76 49.232L10.152 48.296ZM21.384 42.752V78.536C21.384 85.304 23.544 87.176 31.032 87.176H45.936C53.856 87.176 55.296 83.144 56.088 69.608C54.72 69.176 52.704 68.312 51.552 67.376C50.976 80.048 50.328 82.64 45.72 82.64H31.248C27.144 82.64 26.28 81.92 26.28 78.68V42.752H21.384Z" fill="#FB7171"/>
                        <path d="M100.473 76.5469C96.043 76.5469 92.543 75.1979 89.9727 72.5C87.4206 69.8021 86.1445 66.056 86.1445 61.2617C86.1445 56.431 87.3294 52.5938 89.6992 49.75C92.0872 46.9062 95.2865 45.4844 99.2969 45.4844C103.052 45.4844 106.023 46.724 108.211 49.2031C110.398 51.6641 111.492 54.918 111.492 58.9648V61.8359H90.8477C90.9388 65.3542 91.8229 68.0247 93.5 69.8477C95.1953 71.6706 97.5742 72.582 100.637 72.582C103.863 72.582 107.053 71.9076 110.207 70.5586V74.6055C108.603 75.2982 107.081 75.7904 105.641 76.082C104.219 76.3919 102.496 76.5469 100.473 76.5469ZM99.2422 49.2852C96.8359 49.2852 94.9128 50.069 93.4727 51.6367C92.0508 53.2044 91.2122 55.3737 90.957 58.1445H106.625C106.625 55.2826 105.987 53.0951 104.711 51.582C103.435 50.0508 101.612 49.2852 99.2422 49.2852ZM138.59 67.8242C138.59 70.6133 137.551 72.7643 135.473 74.2773C133.395 75.7904 130.478 76.5469 126.723 76.5469C122.749 76.5469 119.65 75.918 117.426 74.6602V70.4492C118.866 71.1784 120.406 71.7526 122.047 72.1719C123.706 72.5911 125.301 72.8008 126.832 72.8008C129.202 72.8008 131.025 72.4271 132.301 71.6797C133.577 70.9141 134.215 69.7565 134.215 68.207C134.215 67.0404 133.704 66.0469 132.684 65.2266C131.681 64.388 129.712 63.4036 126.777 62.2734C123.988 61.2344 122.001 60.332 120.816 59.5664C119.65 58.7826 118.775 57.8984 118.191 56.9141C117.626 55.9297 117.344 54.7539 117.344 53.3867C117.344 50.944 118.337 49.0208 120.324 47.6172C122.311 46.1953 125.036 45.4844 128.5 45.4844C131.727 45.4844 134.88 46.1406 137.961 47.4531L136.348 51.1445C133.34 49.9049 130.615 49.2852 128.172 49.2852C126.021 49.2852 124.398 49.6224 123.305 50.2969C122.211 50.9714 121.664 51.901 121.664 53.0859C121.664 53.888 121.865 54.5716 122.266 55.1367C122.685 55.7018 123.35 56.2396 124.262 56.75C125.173 57.2604 126.923 57.9987 129.512 58.9648C133.066 60.2591 135.464 61.5625 136.703 62.875C137.961 64.1875 138.59 65.8372 138.59 67.8242ZM155.68 72.8008C156.482 72.8008 157.257 72.7461 158.004 72.6367C158.751 72.5091 159.344 72.3815 159.781 72.2539V75.7266C159.289 75.9635 158.56 76.1549 157.594 76.3008C156.646 76.4648 155.789 76.5469 155.023 76.5469C149.227 76.5469 146.328 73.4935 146.328 67.3867V49.5586H142.035V47.3711L146.328 45.4844L148.242 39.0859H150.867V46.0312H159.562V49.5586H150.867V67.1953C150.867 69 151.296 70.3854 152.152 71.3516C153.009 72.3177 154.185 72.8008 155.68 72.8008ZM170.336 76H165.797V46.0312H170.336V76ZM165.414 37.9102C165.414 36.8711 165.669 36.1146 166.18 35.6406C166.69 35.1484 167.328 34.9023 168.094 34.9023C168.823 34.9023 169.452 35.1484 169.98 35.6406C170.509 36.1328 170.773 36.8893 170.773 37.9102C170.773 38.931 170.509 39.6966 169.98 40.207C169.452 40.6992 168.823 40.9453 168.094 40.9453C167.328 40.9453 166.69 40.6992 166.18 40.207C165.669 39.6966 165.414 38.931 165.414 37.9102ZM218.16 76V56.5039C218.16 54.1159 217.65 52.3294 216.629 51.1445C215.608 49.9414 214.022 49.3398 211.871 49.3398C209.046 49.3398 206.958 50.151 205.609 51.7734C204.26 53.3958 203.586 55.8932 203.586 59.2656V76H199.047V56.5039C199.047 54.1159 198.536 52.3294 197.516 51.1445C196.495 49.9414 194.9 49.3398 192.73 49.3398C189.887 49.3398 187.799 50.1966 186.469 51.9102C185.156 53.6055 184.5 56.3945 184.5 60.2773V76H179.961V46.0312H183.652L184.391 50.1328H184.609C185.466 48.6745 186.669 47.5352 188.219 46.7148C189.786 45.8945 191.536 45.4844 193.469 45.4844C198.154 45.4844 201.216 47.1797 202.656 50.5703H202.875C203.768 49.0026 205.062 47.763 206.758 46.8516C208.453 45.9401 210.385 45.4844 212.555 45.4844C215.945 45.4844 218.479 46.3594 220.156 48.1094C221.852 49.8411 222.699 52.6211 222.699 56.4492V76H218.16ZM250.508 76L249.605 71.7344H249.387C247.892 73.612 246.397 74.888 244.902 75.5625C243.426 76.2188 241.576 76.5469 239.352 76.5469C236.38 76.5469 234.047 75.7812 232.352 74.25C230.674 72.7188 229.836 70.5404 229.836 67.7148C229.836 61.6628 234.676 58.4909 244.355 58.1992L249.441 58.0352V56.1758C249.441 53.8242 248.931 52.0924 247.91 50.9805C246.908 49.8503 245.294 49.2852 243.07 49.2852C240.573 49.2852 237.747 50.0508 234.594 51.582L233.199 48.1094C234.676 47.3073 236.289 46.6784 238.039 46.2227C239.807 45.7669 241.576 45.5391 243.344 45.5391C246.917 45.5391 249.56 46.332 251.273 47.918C253.005 49.5039 253.871 52.0469 253.871 55.5469V76H250.508ZM240.254 72.8008C243.079 72.8008 245.294 72.026 246.898 70.4766C248.521 68.9271 249.332 66.7578 249.332 63.9688V61.2617L244.793 61.4531C241.184 61.5807 238.577 62.1458 236.973 63.1484C235.387 64.1328 234.594 65.6732 234.594 67.7695C234.594 69.4102 235.086 70.6589 236.07 71.5156C237.073 72.3724 238.467 72.8008 240.254 72.8008ZM272.93 72.8008C273.732 72.8008 274.507 72.7461 275.254 72.6367C276.001 72.5091 276.594 72.3815 277.031 72.2539V75.7266C276.539 75.9635 275.81 76.1549 274.844 76.3008C273.896 76.4648 273.039 76.5469 272.273 76.5469C266.477 76.5469 263.578 73.4935 263.578 67.3867V49.5586H259.285V47.3711L263.578 45.4844L265.492 39.0859H268.117V46.0312H276.812V49.5586H268.117V67.1953C268.117 69 268.546 70.3854 269.402 71.3516C270.259 72.3177 271.435 72.8008 272.93 72.8008ZM308.914 60.9883C308.914 65.8737 307.684 69.6927 305.223 72.4453C302.762 75.1797 299.362 76.5469 295.023 76.5469C292.344 76.5469 289.965 75.918 287.887 74.6602C285.809 73.4023 284.204 71.5977 283.074 69.2461C281.944 66.8945 281.379 64.1419 281.379 60.9883C281.379 56.1029 282.6 52.3021 285.043 49.5859C287.486 46.8516 290.876 45.4844 295.215 45.4844C299.408 45.4844 302.734 46.8789 305.195 49.668C307.674 52.457 308.914 56.2305 308.914 60.9883ZM286.082 60.9883C286.082 64.8164 286.848 67.7331 288.379 69.7383C289.91 71.7435 292.161 72.7461 295.133 72.7461C298.104 72.7461 300.355 71.7526 301.887 69.7656C303.436 67.7604 304.211 64.8346 304.211 60.9883C304.211 57.1784 303.436 54.2891 301.887 52.3203C300.355 50.3333 298.086 49.3398 295.078 49.3398C292.107 49.3398 289.865 50.3151 288.352 52.2656C286.839 54.2161 286.082 57.1237 286.082 60.9883ZM330.57 45.4844C331.901 45.4844 333.095 45.5938 334.152 45.8125L333.523 50.0234C332.284 49.75 331.19 49.6133 330.242 49.6133C327.818 49.6133 325.74 50.5977 324.008 52.5664C322.294 54.5352 321.438 56.987 321.438 59.9219V76H316.898V46.0312H320.645L321.164 51.582H321.383C322.495 49.6315 323.835 48.1276 325.402 47.0703C326.97 46.013 328.693 45.4844 330.57 45.4844Z" fill="#FB7171"/>
                    </svg>
                </div>
                <div className={"flex flex-col md:flex-row items-center"}>
                    <div className="flex flex-row mb-4 md:mb-0 items-center">
                        <div className={"mr-2 text-md font-semibold text-gray-800"}>Index Number : </div>
                        <input value={this.state.patientNumber} onChange={this.handleInputPatient} className={"border-2 border-blue-500 p-2 rounded-md mr-2 w-32"}></input>
                    </div>
                    <div className="flex flex-row">
                        <button className={"bg-blue-500 text-sm p-2 rounded-md text-white font-bold hover:bg-blue-700 mr-2 w-20"} onClick={()=>this.getCsvData()}>Predict</button>
                        <button className={"bg-green-500 text-sm p-2 rounded-md text-white font-bold hover:bg-green-700 w-20"} onClick={()=>this.convertData()}>Start</button>
                    </div>
                </div>
                <div className={"flex flex-col md:flex-row w-full p-4 mt-4 md:mt-12"}>
                    <div className={"flex flex-row md:w-1/2 items-center mb-4 md:mb-0 md:mr-4"}>
                        {/*<div className={"flex flex-col justify-center items-start w-full"}>*/}
                        {/*    /!*<CurrentPressure prefix={"SBP"} prefixColor={"text-blue-500"} value={this.state.currentDBP}/>*!/*/}
                        {/*    /!*<CurrentPressure prefix={"DBP"} prefixColor={"text-blue-500"} value={this.state.currentSBP}/>*!/*/}
                        {/*    <CurrentPressure prefix={"MBP"} prefixColor={"text-blue-500"}*/}
                        {/*                     value={parseFloat(this.state.currentMBP).toFixed(2)}/>*/}
                        {/*    <CurrentPressure prefix={"SBP"} prefixColor={"text-blue-500"}*/}
                        {/*                     value={parseFloat(this.state.currentSBP).toFixed(2)}/>*/}
                        {/*    <CurrentPressure prefix={"DBP"} prefixColor={"text-blue-500"}*/}
                        {/*                     value={parseFloat(this.state.currentDBP).toFixed(2)}/>*/}
                        {/*</div>*/}
                        {/*<div className={"flex flex-col justify-center items-start w-full"}>*/}
                        {/*    <CurrentPressure prefix={"GT MBP"} prefixColor={"text-blue-500"}*/}
                        {/*                     value={parseFloat(this.state.gtMBP).toFixed(2)}/>*/}
                        {/*    <CurrentPressure prefix={"GT SBP"} prefixColor={"text-blue-500"}*/}
                        {/*                     value={parseFloat(this.state.gtSBP).toFixed(2)}/>*/}
                        {/*    <CurrentPressure prefix={"GT DBP"} prefixColor={"text-blue-500"}*/}
                        {/*                     value={parseFloat(this.state.gtDBP).toFixed(2)}/>*/}
                        {/*</div>*/}

                        <table className="table-fixed bg-white w-full text-sm text-gray-700">
                            <thead>
                                <tr>
                                    <th className="w-1/5 p-2">-</th>
                                    <th className="">Prediction Result</th>
                                    <th className="">Ground Truth</th>
                                    <th className="">MAE</th>
                                    <th className="">RMSE</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="font-bold p-2">SBP</td>
                                    <td>{parseFloat(this.state.currentSBP).toFixed(2)}</td>
                                    <td>{parseFloat(this.state.gtSBP).toFixed(2)}</td>
                                    <td>{parseFloat(this.state.maeSBP).toFixed(2)}</td>
                                    <td>{parseFloat(this.state.rmseSBP).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold p-2">DBP</td>
                                    <td>{parseFloat(this.state.currentDBP).toFixed(2)}</td>
                                    <td>{parseFloat(this.state.gtDBP).toFixed(2)}</td>
                                    <td>{parseFloat(this.state.maeDBP).toFixed(2)}</td>
                                    <td>{parseFloat(this.state.rmseDBP).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold p-2">MBP</td>
                                    <td>{parseFloat(this.state.currentMBP).toFixed(2)}</td>
                                    <td>{parseFloat(this.state.gtMBP).toFixed(2)}</td>
                                    <td>{parseFloat(this.state.maeMBP).toFixed(2)}</td>
                                    <td>{parseFloat(this.state.rmseMBP).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class={"w-full md:w-1/2"}>
                        <div className={"flex flex-row justify-around md:px-12"}>
                            <CurrentPressure prefix={"ECG"} unit={""} prefixColor={"text-green-500"} value={this.state.currentECG}/>
                            <CurrentPressure prefix={"PPG"} unit={""} prefixColor={"text-pink-500"} value={this.state.currentPPG}/>
                        </div>
                        <LineChart
                            // title={'Blood Pressure'}
                            labels={this.state.index}
                            data={[this.state.ECG, this.state.PPG]} // ECG PPG
                            min={this.state.index.length - RANGE}
                            height={420}
                            width={720}
                            color="#3E517A"
                            lineColor={["#9ad3bc","#e73e8b","#e3ba47"]}
                        />
                    </div>

                </div>
            </div>
        )


    }
}

const CurrentPressure = ({prefix="", value=0, unit='mm Hg', prefixColor="text-gray-700"}) => {

    const valueColor = (value) => {
        if(value > 0.4 && value < 0.8){
            return "text-green-700"
        } else if (value < 0.4){
            return "text-yellow-700"
        } else if (value > 0.8){
            return "text-red-700"
        } else {
            return "text-grey-700"
        }
    }

    return (
        <div class={"flex flex-row text-md font-bold"}>
            <div class={"mr-2 "+prefixColor}>{prefix} : </div>
            <div className={"transition duration-300 ease-in-out text-gray-700"}>
                {value} {unit}
            </div>
        </div>
    )
}

export default DataParser;
