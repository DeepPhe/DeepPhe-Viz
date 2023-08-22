import * as d3 from "d3v4";
import React from "react";
import ToggleSwitch from "../CustomButtons/ToggleSwitch";
import {snakeCase} from "lodash";
import './CohortFilter.css';
import Grid from "@material-ui/core/Grid";
import HSBar from "react-horizontal-stacked-bar-chart";
import {ChangeResult} from "multi-range-slider-react";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import $ from 'jquery';
import DiscreteList from "./subcomponents/DiscreteList";
import CategoricalRangeSelector from "./subcomponents/CategoricalRangeSelector";
import NumericRangeSelector from "./subcomponents/NumericRangeSelector";
import BooleanList from "./subcomponents/BooleanList";
import * as dfd from "danfojs";


const ageRangeLookup = new Object;
ageRangeLookup[0] = "0-10";
ageRangeLookup[1] = "10-20";
ageRangeLookup[2] = "20-30";
ageRangeLookup[3] = "30-40";
ageRangeLookup[4] = "40-50";
ageRangeLookup[5] = "50-60";
ageRangeLookup[6] = "60-70";
ageRangeLookup[7] = "70-80";
ageRangeLookup[8] = "80-90";
ageRangeLookup[9] = "90-100";
ageRangeLookup[10] = "100-110";
ageRangeLookup[11] = "110-120";

const stageRangeLookup = new Object;
stageRangeLookup[0] = "0";
stageRangeLookup[1] = "I";
stageRangeLookup[2] = "II";
stageRangeLookup[3] = "III";
stageRangeLookup[4] = "IV";
stageRangeLookup[5] = "V";
stageRangeLookup[6] = "VI";
stageRangeLookup[7] = "VII";

export default class CohortFilter extends React.Component {
    state = {
        filterDefinitionLoading: true,
        patientArraysLoading: true,
        biomarkerData: null,
        filterDefinition: null,
        filterData: null,
        cohortSize: null,
        isLoading: true,
        selectedStages: null,
        selectedAges: null,
        stagePresent: null,
        ageAtDx: null,
        metastisis_present: null,
        metastisis_unknown: null,
        fieldNames: null,
        agents: [],
        comorbidity: [],
        diagnosis: [],
        patientArrays: null
    }

    flattenObject = (obj, parent) => {
        const flattened = {}
        Object.keys(obj).forEach((key) => {
            const value = obj[key]
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(flattened, this.flattenObject(value, key))
            } else {
                flattened[parent + "." + key] = value
            }
        })

        return flattened
    }

    fastIntersection = (...arrays) => {
        // if we process the arrays from shortest to longest
        // then we will identify failure points faster, i.e. when
        // one item is not in all arrays
        const ordered = (arrays.length === 1
                ? arrays :
                arrays.sort((a1, a2) => a1.length - a2.length)),
            shortest = ordered[0],
            set = new Set(), // used for bookeeping, Sets are faster
            result = [] // the intersection, conversion from Set is slow
        // for each item in the shortest array
        for (let i = 0; i < shortest.length; i++) {
            const item = shortest[i];
            // see if item is in every subsequent array
            let every = true; // don't use ordered.every ... it is slow
            for (let j = 1; j < ordered.length; j++) {
                if (ordered[j].includes(item)) continue;
                every = false;
                break;
            }
            // ignore if not in every other array, or if already captured
            if (!every || set.has(item)) continue;
            // otherwise, add to bookeeping set and the result
            set.add(item);
            result[result.length] = item;
        }
        return result;
    }

    reset = () => {
        const that = this;
        const fetchPatientArrays = async () => {
            return new Promise(function (resolve, reject) {
                fetch('https://gist.githubusercontent.com/JohnLevander/d11ca4e6f43c6ec0d956567cb204c363/raw/53ffde5db9ddefbd1a07a3553a3224f17da610a9/query-results.js').then(function (response) {
                    if (response) {
                        resolve(response);
                    } else {
                        reject('User not logged in');
                    }
                });
            });
        }
        fetchPatientArrays().then(function (response) {
            response.json().then(function (json) {
                that.setState({patientArrays: that.flattenObject(json, "")})
                that.setState({patientArraysLoading: false})
                //let intersection = that.fastIntersection(arrays["location.Breast"], arrays["laterality.Left"], arrays["histologic_type.Invasive_Ductal_Breast_Carcinoma"])
            })
        })

        const fetchFilterDefinition = async () => {
            return new Promise(function (resolve, reject) {
                fetch('http://localhost:3001/api/filter/definitions').then(function (response) {
                    if (response) {
                        resolve(response);
                    } else {
                        reject('User not logged in');
                    }
                });
            });
        }

        fetchFilterDefinition().then(function (response) {
            response.json().then(function (json) {
                that.setState({filterDefinitions: json});
                let fieldNames = []
                json.searchFilterDefinition.map(definition => {
                    fieldNames.push(definition.fieldName)
                })
                that.setState({fieldNames: fieldNames})
                let cohortSize = [{
                    value: 5,
                    description: "5",
                    color: "blue"
                }, {
                    value: 95,
                    description: "",
                    color: "lightgray"
                }]

                let filterDatas = new Array(fieldNames.length)

                fieldNames.forEach((topic, i) => {
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

                that.setState({filterData: filterDatas, cohortSize: cohortSize, isLoading: false}, () => {

                })
                that.setState({filterDefinitionLoading: false})
                that.updateDimensions()
            })
        })
    }

    updateDimensions = () => {

    };

    handleDateChange = (e: ChangeResult) => {
        console.log("date change:" + e);
    };

    buildQuery = () => {
        const getStageValuesForRange = (min, max) => {
            let stageValues = []
            for (let i = min; i <= max; i++) {
                stageValues.push(stageRangeLookup[i])
            }
            return stageValues
        }

        const getAgeValuesForRange = (min, max) => {
            let ageValues = []
            for (let i = min; i <= max; i++) {
                ageValues.push(ageRangeLookup[i])
            }
            return ageValues
        }
        let query = new Object()
        if (this.state.selectedStages) {
            query.stages = getStageValuesForRange(this.state.selectedStages[0], this.state.selectedStages[1] - 1)
        }
        if (this.state.selectedAges) {
            query.ages = getAgeValuesForRange(this.state.selectedAges[0], this.state.selectedAges[1] - 2)
        }
    }

    componentDidMount() {
        this.show("new_control_svg");
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.filterDefinitions !== this.state.filterDefinitions) {
            this.state.filterDefinitions.searchFilterDefinition.forEach((e) => {
                console.log(e.fieldName)
            })

        }
    }

    onUpdate(vals) {
        console.log(vals);
    }

    show = (svgContainerId) => {
        console.log("calling reset")
        this.reset()
        if (!d3.select("#" + svgContainerId).empty()) {
            d3.select("#" + svgContainerId)._groups[0][0].remove();
        }
    };

    handleAgeChange = (e: ChangeResult) => {
        this.setState({selectedAges: e})
        this.buildQuery()
    };

    handleRangeChange = (name, e: ChangeResult) => {
        this.setState({[name]: e})
        this.buildQuery()
    };

    handleToggleSwitch = (switchId) => ({enabled}) => {
        console.log("Switch id: " + switchId + " enabled: " + enabled)
        this.setState({[switchId]: enabled})
    };

    toggleActivityEnabled = activity => ({enabled}) => {

        const selector = "#" + activity.filterDefinition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"
        if (enabled) {
            $(selector).removeClass("overlay-row")
        } else {
            $(selector).addClass("overlay-row")
        }
    }

    CohortPercentHSBar = (props) => {
        return (<HSBar
            //showTextIn
            max={100}
            height={47.3}
            data={this.state.cohortSize}
        />);
    }

    render() {
        if (this.state.isLoading || this.state.filterDefinitionLoading || this.state.patientArraysLoading)
            return <div>Data is coming soon...</div>
        else
            return (
                <React.Fragment>
                    <div id="NewControl">
                        <h3></h3>
                        <Grid className={"cohort-size-bar-container"} container direction="row"
                              justifyContent="center" align="center">
                            <Grid className={"no_padding_grid cohort-size-label-container"} item md={1}>
                                <span className={"cohort-size-label"}>Cohort Size</span>
                            </Grid>
                            <Grid className={"cohort-size-label-container"} item md={6}>
                                <this.CohortPercentHSBar/>
                            </Grid>
                            <Grid className={"cohort-size-label-container"} item md={1}/>
                        </Grid>
                        <Grid container direction="row" justifyContent="center" align="center">
                            <Grid className="switch_list no_padding_grid" item md={1}>
                                {this.state.filterDefinitions.searchFilterDefinition.map((filterDefinition, index) => (
                                    <ToggleSwitch wantsDivs={true} key={index} label={filterDefinition.fieldName}
                                                  theme="graphite-small"
                                                  enabled={true}
                                                  onStateChanged={this.toggleActivityEnabled({filterDefinition})}/>

                                ))}
                            </Grid>
                            <Grid item md={6} className="filter-inner-container no_padding_grid">
                                {this.state.filterDefinitions.searchFilterDefinition.map((filterDefinition, index) => (
                                    (() => {
                                        switch (filterDefinition.class) {
                                            case "discreteList":
                                                return <DiscreteList definition={filterDefinition}/>;

                                            case "categoricalRangeSelector":
                                                return <CategoricalRangeSelector
                                                    definition={filterDefinition}/>;

                                            case "numericRangeSelector":
                                                return <NumericRangeSelector definition={filterDefinition}/>;

                                            case "booleanList":
                                                return <BooleanList definition={filterDefinition}/>;
                                        }
                                    })()
                                ))}
                            </Grid>
                            <Grid className={"no_padding_grid"} item md={1}>
                                {this.state.fieldNames.map((label) => (
                                    <HSBar
                                        height={47.3}
                                        data={this.state.filterData[this.state.fieldNames.indexOf(label)]}
                                    />
                                ))}
                            </Grid>
                        </Grid>
                    </div>
                </React.Fragment>
            )
    }
}

