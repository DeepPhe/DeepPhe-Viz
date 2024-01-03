import * as d3 from "d3v4";
import React from "react";
import ToggleSwitch from "../CustomButtons/ToggleSwitch";

import './CohortFilter.css';
import Grid from "@material-ui/core/Grid";
import HSBar from "react-horizontal-stacked-bar-chart";

import 'rc-slider/assets/index.css';
import $ from 'jquery';
import DiscreteList from "./subcomponents/DiscreteList";
import CategoricalRangeSelector from "./subcomponents/CategoricalRangeSelector";
import NumericRangeSelector from "./subcomponents/NumericRangeSelector";
import BooleanList from "./subcomponents/BooleanList";
import {fastIntersection, flattenObject} from "../../utils/arrayHelpers";


export default class CohortFilter extends React.Component {
    state = {
        filterDefinitionLoading: true,
        patientArraysLoading: true,
        biomarkerData: null,

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
        patientsMeetingAllFilters: [],
        patientsMeetingAllFiltersUpToDate: false,
        patientArrays: null
    }

    constructor(props) {
        super(props);
        this.filterChangedState.bind(this);
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
                that.setState({patientArrays: flattenObject(json, ""), patientArraysLoading: false})
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
                let fieldNames = []
                json.searchFilterDefinition.map(definition => {
                    fieldNames.push(definition.fieldName)
                    return true;
                })
                let cohortSize = [{
                    value: 5,
                    description: "5",
                    color: "blue"
                }, {
                    value: 95,
                    description: "",
                    color: "lightgray"
                }]

                that.setState({
                    filterDefinitions: json,
                    fieldNames: fieldNames,
                    cohortSize: cohortSize,
                    isLoading: false
                }, () => {
                    that.updatePatientsMatchingAllFilters().then(() => {
                        that.updateFilterData()
                    })

                })
            })
        })
    }
    updateFilterData = () => {
        const that = this
        let filterDatas = new Array(that.state.fieldNames.length)
        that.state.fieldNames.forEach((fieldName, i) => {
            const fieldIdx =
                that.state.filterDefinitions.searchFilterDefinition.findIndex(x => x.fieldName === fieldName)
            const definition = that.state.filterDefinitions.searchFilterDefinition[fieldIdx]
            const numberOfPossiblePatientsForThisFilter = definition.numberOfPossiblePatientsForThisFilter
            let patientsMeetingEntireSetOfFilters = that.state.patientsMeetingAllFilters.length
            let matchingPatients = []
            if (definition["selectedCategoricalRange"]) {
                definition.selectedCategoricalRange.forEach((range) => {
                    const aryName = definition.fieldName.toLowerCase() + "." + range
                    const ary = that.state.patientArrays[aryName]
                    matchingPatients = matchingPatients.concat(ary)
                })
            }
            definition.patientsMeetingThisFilterOnly = matchingPatients.length
            const patientsMeetingThisFilterOnly = definition.patientsMeetingThisFilterOnly
            //console.log(that.state.patientsMeetingAllFilters)
            //console.log(fieldName + ": \n\t" + "patientsMeetingEntireSetOfFilters: " + patientsMeetingEntireSetOfFilters + " \n\tpatientsMeetingThisFilterOnly: " + patientsMeetingThisFilterOnly + " \n\tnumberOfPossiblePatientsForThisFilter: " + numberOfPossiblePatientsForThisFilter);
            filterDatas[i] = [
                {
                    value: that.state.patientsMeetingAllFilters.length,
                    description: that.state.patientsMeetingAllFilters.length,
                    color: "blue"
                },
                {
                    value: patientsMeetingThisFilterOnly,
                    description: patientsMeetingThisFilterOnly,
                    color: "lightblue"
                },
                {
                    value: numberOfPossiblePatientsForThisFilter - patientsMeetingThisFilterOnly - patientsMeetingEntireSetOfFilters,
                    description: numberOfPossiblePatientsForThisFilter - patientsMeetingThisFilterOnly - patientsMeetingEntireSetOfFilters,
                    color: "lightgray"
                }
            ]
        })
        let cohortSize = [{
            value: this.state.patientsMeetingAllFilters.length,
            description: "",
            color: "blue"
        }, {
            value: 7,
            description: "",
            color: "lightgray"
        }]
        that.setState({filterDefinitionLoading: false, filterData: filterDatas, cohortSize: cohortSize})
    }

    updatePatientsMatchingAllFilters = async () => {
        let matches = {}
        this.state.filterDefinitions.searchFilterDefinition.forEach((filterDefinition) => {
            const that = this;
            let processed = []
            for (const [key, value] of Object.entries(that.state.patientArrays)) {
                if (!processed.includes(key) && key.toLowerCase().startsWith(filterDefinition.fieldName.toLowerCase())) {
                    processed.push(key)
                    switch (filterDefinition.class) {
                        case "discreteList":
                            //console.log("discreteList")
                            break;
                        case "categoricalRangeSelector":
                            if (filterDefinition.fieldName !== "clockface")
                            matches = {...matches, ...that.getCategoricalRangeSelectorValues(filterDefinition)}

                            break;
                        case "numericRangeSelector":

                            console.log("numericRangeSelector")
                            break;
                        case "booleanList":
                            matches = {...matches, ...that.getBooleanListValues(filterDefinition)}

                            break;
                        default:
                            console.log("Unknown filter type")
                    }
                }
            }
        })

        if (Object.keys(matches).length) {
            let arrayOfArraysOfPatientsMatchingEachFilter = []
            for (const key in matches) {
                if (matches.hasOwnProperty(key)) {
                    //console.log(`${key}: ${matches[key]}`);
                    arrayOfArraysOfPatientsMatchingEachFilter.push(matches[key])
                }
            }
            console.log("Matches across all filters: " + fastIntersection(...arrayOfArraysOfPatientsMatchingEachFilter))
            this.setState({
                patientsMeetingAllFilters: fastIntersection(...arrayOfArraysOfPatientsMatchingEachFilter),
                patientsMeetingAllFiltersUpToDate: true
            })
        }
        return true
    }

    getCategoricalRangeSelectorValues(filterDefinition) {
        const that = this
        let matches = {}
        let filterMatches = []
        filterDefinition.selectedCategoricalRange.forEach((range) => {
            console.log(filterDefinition.fieldName.toLowerCase() + "." + range )
            const aryName = filterDefinition.fieldName.toLowerCase() + "." + range
            const ary = that.state.patientArrays[aryName]
            filterMatches = [...new Set([...filterMatches, ...ary])]
        })
        matches[filterDefinition.fieldName.toLowerCase()] = filterMatches
        return matches
    }

    getBooleanListValues(filterDefinition) {
        const that = this
        let matches = {}
        filterDefinition.switches.forEach((switchDefinition) => {
            if (switchDefinition.value) {
                const aryName = filterDefinition.fieldName.toLowerCase() + "." + switchDefinition.name
                matches[aryName] = that.state.patientArrays[aryName]
            }
        })
        return matches
    }



    CohortPercentHSBar = (props) => {
        return (<HSBar
            showTextIn
            max={100}
            height={47.3}
            data={this.state.cohortSize}
        />);
    }

    updateFilterDefinition
    filterChangedState = (definition) => {
        const defIdx = this.state.filterDefinitions.searchFilterDefinition.findIndex(x => x.fieldName === definition.fieldName)
        let searchFilterDefinition = this.state.filterDefinitions.searchFilterDefinition
        searchFilterDefinition[defIdx] = definition
        this.setState({
            filterDefinitions: {searchFilterDefinition: searchFilterDefinition},
            patientsMeetingAllFiltersUpToDate: false
        }, () => {
            this.updatePatientsMatchingAllFilters().then(() => {
                this.updateFilterData()
            })
        })
    };

    componentDidMount() {
        this.reset()
        if (!d3.select("#" + "new_control_svg").empty()) {
            d3.select("#" + "new_control_svg")._groups[0][0].remove();
        }
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("component updated!")

        //need code to iterate of patientArrays, find the patientArrays that being with the fieldnames in the filterDefinitions,
        //then find the intersection of those arrays, and then update the cohort size bar

        //iterate over filterDefinitions
        //for each filterDefinition, find the patientArray that matches the fieldName


        // if (!this.state.isLoading && !this.state.filterDefinitionLoading && !this.state.patientArraysLoading) {
        //     if (!this.state.patientsMeetingAllFiltersUpToDate) {
        //         // this.updatePatientsMatchingAllFilters();
        //         // this.updateFilterData();
        //
        //     }
        // }


        // if (prevState.filterDefinitions !== this.state.filterDefinitions) {
        //     this.state.filterDefinitions.searchFilterDefinition.forEach((e) => {
        //         //console.log(e.fieldName)
        //     })
        //
        // }
    }
    toggleFilterEnabled = activity => ({enabled}) => {
        const selector = "#" + activity.filterDefinition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"
        if (enabled) {
            $(selector).removeClass("overlay-row")
        } else {
            $(selector).addClass("overlay-row")
        }
    }



    render() {
        if (this.state.isLoading || this.state.filterDefinitionLoading || this.state.patientArraysLoading)
            return <div>Data is coming soon...</div>
        else
            return (
                <React.Fragment>
                    <div id="NewControl">

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

                            <Grid item md={6} className="filter-inner-container no_padding_grid">
                                {this.state.filterDefinitions.searchFilterDefinition.map((filterDefinition, index) => (

                                    (() => {

                                        switch (filterDefinition.class) {
                                            case "discreteList":
                                                return <DiscreteList key={index} definition={filterDefinition}/>;

                                            case "categoricalRangeSelector":
                                                return <CategoricalRangeSelector key={index}
                                                                                 definition={filterDefinition}
                                                                                 broadcastUpdate={this.filterChangedState}/>;

                                            case "numericRangeSelector":

                                                return <NumericRangeSelector key={index}
                                                                             definition={filterDefinition}
                                                                             broadcastUpdate={this.filterChangedState}/>;

                                            case "booleanList":
                                                return   <BooleanList key={index} definition={filterDefinition}
                                                                    broadcastUpdate={this.filterChangedState}/>;
                                            default:
                                                return <div>Unknown filter type</div>
                                        }
                                    })()
                                ))}
                            </Grid>
                            <Grid className={"no_padding_grid"} item md={1}>
                                {this.state.fieldNames.map((label, index) => (
                                    <HSBar
                                        showTextIn
                                        key={index}
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

