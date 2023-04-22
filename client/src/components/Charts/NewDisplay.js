import * as d3 from "d3v4";
import React from "react";
import ToggleSwitch from "../CustomButtons/ToggleSwitch";
import {snakeCase} from "lodash";
import './NewDisplay.css';
import Grid from "@material-ui/core/Grid";
import HSBar from "react-horizontal-stacked-bar-chart";
import MultiRangeSlider, { ChangeResult } from "multi-range-slider-react";



const filterTopics = [
    'Diagnosis', 'Stage', 'Age at Dx', 'Metastasis', 'Agents', 'Comorbidity'
];
// const Root = props => (
//     <Legend.Root {...props} sx={{ display: 'flex', margin: 'auto', flexDirection: 'row' }} />
// );
// const Label = props => (
//     <Legend.Label {...props} sx={{ whiteSpace: 'nowrap' }} />
// );
export default class NewDisplay extends React.Component {
    state = {
        loading: true,
        biomarkerData: null,
        //  width: 0,
        //  height: 0,
        only: filterTopics.map(snakeCase),
        filterData: null,
        isLoading: true

    }


    reset = () => {
        const that = this;
        const fetchData = async () => {
            const patientIds = that.props.patientsAndStagesInfo.patients.map(patient => patient.patientId)
            return new Promise(function (resolve, reject) {
                fetch('http://localhost:3001/api/biomarkers/' + patientIds.join('+')).then(function (response) {
                    if (response) {
                        resolve(response);
                    } else {
                        reject('User not logged in');
                    }
                });
            });
        }

        fetchData().then(function (response) {
            response.json().then(function (json) {
                that.setState({biomarkerData: json});
                that.setState({loading: false})
                that.updateDimensions()
            })
        })


    }
    updateDimensions = () => {
        const newWidth = document.getElementById('biomarkers').clientWidth;
        //  this.setState({width: newWidth, height: 350});
        let it = d3.select(".biomarkers_overview_chart")
        // it._groups[0][0].setAttribute("width", newWidth)

    };

    handleDateChange = (e: ChangeResult) => {

    };

    componentDidMount() {


        let filterDatas = new Array(filterTopics.length)

        filterTopics.forEach((topic, i) => {
            filterDatas[i] = [{
                value: Math.random(20),
                description: "",
                color: "blue"
            },
                {
                    value: Math.random(20),
                    description: "",
                    color: "lightblue"
                },
                {
                    value: Math.random(20),
                    description: "",
                    color: "lightgray"
                }]
        })

        this.setState({filterData: filterDatas, isLoading: false}, () => {

            //this.reset()
            this.show("new_control_svg");
        })
        window.addEventListener('resize', this.updateDimensions);

    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        //   if (this.state.width !== prevState.width) {
        //      this.show("new_control_svg");
        // }
    }

    onUpdate(vals) {
        console.log(vals);
    }

    show = (svgContainerId) => {
        if (!d3.select("#" + svgContainerId).empty()) {
            d3.select("#" + svgContainerId)._groups[0][0].remove();
        }
        const svgWidth = "100%"; //Math.max(300, this.state.width);
        const svgHeight = "100%";
        const svgPadding = {top: 10, right: 10, bottom: 15, left: 0};
        const chartTopMargin = 10;
        //  const chartWidth = svgWidth - svgPadding.left - svgPadding.right;
        // const chartHeight = svgHeight - svgPadding.top - svgPadding.bottom;
        const chart = d3.select(".new_control_group").append("svg").attr("id", svgContainerId).attr("width", svgWidth).attr("height", svgHeight);

        let innerChart = chart.append("g")
        //  .attr("transform", "translate(" + svgPadding.left + "," + chartTopMargin + ")");

        innerChart.append("rect").attr("x", 0).attr("y", 0).attr("width", svgWidth).attr("height", svgHeight).attr("fill", "white").attr("stroke", "black").attr("stroke-width", 1);

        const cohortSizeChart = d3.select("#cohort-size-bar").append("svg").attr("id", "cohort-size-svg").attr("width", "100%").attr("height", "100%");
        cohortSizeChart.append("rect").attr("x", 0).attr("y", 0).attr("width", "100%").attr("height", "100%").attr("fill", "white").attr("stroke", "black").attr("stroke-width", 1);
        cohortSizeChart.append("rect").attr("x", 0).attr("y", 0).attr("width", "20%").attr("height", "100%").attr("fill", "blue").attr("stroke", "blue").attr("stroke-width", 1);


    };


    toggleActivityEnabled = activity => ({enabled}) => {
        let {only} = this.state;

        if (enabled && !only.includes(activity)) {
            only.push(activity);
            return this.setState({only});
        }

        if (!enabled && only.includes(activity)) {
            only = only.filter(item => item !== activity);
            return this.setState({only});
        }
    }


    render() {
        if (this.state.isLoading)
            return <div>Data is coming soon...</div>
        else
            return (
                <React.Fragment>
                    <div id="NewControl">
                        <h3></h3>
                        <Grid className={"cohort-size-bar-container"} container direction="row"
                              justifyContent="center"
                              align="center" spacing={1}>
                            <Grid item md={2}>
                            </Grid>
                            <Grid className={"cohort-size-label-container"} item md={2}>
                                <span className={"cohort-size-label"}>Cohort Size</span>
                            </Grid>
                            <Grid item md={6} className={"no_padding_grid"}>
                                <div id={"cohort-size-bar"}></div>
                            </Grid>
                            <Grid item md={2}>

                            </Grid>

                        </Grid>
                        <Grid container direction="row" justifyContent="center" align="center" >

                            <Grid className="switch_list no_padding_grid" item md={1}>
                                {filterTopics.map((activity, index) => (
                                    <ToggleSwitch wantsDivs={true} key={index} label={activity} theme="graphite-small" enabled={true}
                                                  onStateChanged={this.toggleActivityEnabled({activity})}/>

                                ))}
                            </Grid>
                            <Grid item md={6} className="filter-inner-container no_padding_grid">
                                <div id={"diagnosis-row"} className={"row filter_center_rows"}>

                                </div>
                                {/*<svg className="new_control" height="100%" width="100%">*/}
                                {/*    <g className="new_control_group"/>*/}
                                <div id={"stage-row"} className={"row filter_center_rows"}>
                                    <MultiRangeSlider

                                        labels={["Stage 0", "Stage I", "Stage II", "Stage III", "Stage IV"]}
                                        barLeftColor='red'
                                        barInnerColor='limegreen'
                                        barRightColor='red'
                                        ruler={false}
                                        min={1}
                                        max={5}
                                        minValue={1}
                                        maxValue={5}
                                        step={1}
                                        onInput={this.handleDateChange}
                                        // minCaption={minMonthCaption}
                                        // maxCaption={maxMonthCaption}
                                        // onInput={handleDateChange}
                                        // onChange={(e: ChangeResult) => {
                                        //     setMinValue2(e.minValue);
                                        //     setMaxValue2(e.maxValue);
                                        // }}
                                    />
                                    <ToggleSwitch wantsDivs={false} label={"Present"} theme="graphite-small" enabled={true}
                                                  onStateChanged={this.toggleActivityEnabled("Unknown")}/>
                                </div>

                                <div id={"age-at-dx-row"} className={"row filter_center_rows"}>
                                    <MultiRangeSlider

                                        labels={["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"]}
                                        barLeftColor='red'
                                        barInnerColor='limegreen'
                                        barRightColor='red'
                                        ruler={false}
                                        min={1}
                                        max={11}
                                        minValue={1}
                                        maxValue={11}
                                        step={1}
                                        onInput={this.handleDateChange}
                                        // minCaption={minMonthCaption}
                                        // maxCaption={maxMonthCaption}
                                        // onInput={handleDateChange}
                                        // onChange={(e: ChangeResult) => {
                                        //     setMinValue2(e.minValue);
                                        //     setMaxValue2(e.maxValue);
                                        // }}
                                    />
                                    <ToggleSwitch wantsDivs={false} label={"Present"} theme="graphite-small" enabled={true}
                                                  onStateChanged={this.toggleActivityEnabled("Unknown")}/>
                                </div>

                                <div id={"metastasis-row"} className={"row filter_center_rows"}>
                                    <ToggleSwitch wantsDivs={false} label={"Present"} theme="graphite-small" enabled={true}
                                                  onStateChanged={this.toggleActivityEnabled("Present")}/>
                                    <ToggleSwitch wantsDivs={false} label={"Unknown"} theme="graphite-small" enabled={true}
                                                  onStateChanged={this.toggleActivityEnabled("Unknown")}/>


                                </div>

                                <div id={"agents-row"} className={"row filter_center_rows"}>

                                </div>

                                <div id={"comorbidity-row"} className={"row filter_center_rows"}>

                                </div>


                            </Grid>
                            <Grid className={"no_padding_grid"} item md={2}>
                                {filterTopics.map((activity, index) => (
                                    <HSBar
                                        height={47.3}
                                        data={this.state.filterData[index]}
                                    />
                                ))}
                            </Grid>




                        </Grid>

                    </div>
                </React.Fragment>
            )
    }
}