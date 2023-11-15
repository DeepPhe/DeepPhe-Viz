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
        patientArrays: null
    }

    constructor(props) {
        super(props);
        this.changeState.bind(this);
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

    updateFilterData = () => {
        const that = this
        let filterDatas = new Array(that.state.fieldNames.length)

        that.state.fieldNames.forEach((fieldName, i) => {

            const fieldIdx =
                that.state.filterDefinitions.searchFilterDefinition.findIndex(x => x.fieldName === fieldName)
            const definition = that.state.filterDefinitions.searchFilterDefinition[fieldIdx]

            const numberOfPossiblePatientsForThisFilter =
                definition.numberOfPossiblePatientsForThisFilter
            let patientsMeetingEntireSetOfFilters = 0.00001

            let matchingPatients = []

            if (definition["selectedCategoricalRange"]) {
                debugger;
                definition.selectedCategoricalRange.forEach((range) => {
                    const aryName = definition.fieldName.toLowerCase() + "." + range
                    const ary = that.state.patientArrays[aryName]
                    matchingPatients = matchingPatients.concat(ary)
                })
                patientsMeetingEntireSetOfFilters = that.fastIntersection(matchingPatients, that.state.patientsMeetingAllFilters).length


            }


            definition.patientsMeetingThisFilterOnly = matchingPatients.length

            const patientsMeetingThisFilterOnly = definition.patientsMeetingThisFilterOnly

            console.log(fieldName + ": " + "patientsMeetingEntireSetOfFilters: " + patientsMeetingEntireSetOfFilters + " patientsMeetingThisFilterOnly: " + patientsMeetingThisFilterOnly + " numberOfPossiblePatientsForThisFilter: " + numberOfPossiblePatientsForThisFilter);
            filterDatas[fieldIdx] = [{
                value: patientsMeetingEntireSetOfFilters,
                description: "patientsMeetingEntireSetOfFilters",
                color: "blue"
            },
                {
                    value: patientsMeetingThisFilterOnly,
                    description: "patientsMeetingThisFilterOnly",
                    color: "lightblue"
                },
                {
                    value: numberOfPossiblePatientsForThisFilter,
                    description: "numberOfPossiblePatientsForThisFilter",
                    color: "lightgray"
                }
            ]
        })
        that.setState({filterData: filterDatas})
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
                    return true;
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

                that.updateFilterData()

                that.setState({cohortSize: cohortSize, isLoading: false}, () => {

                })
                that.setState({filterDefinitionLoading: false})
                that.updateDimensions()
            })
        })
    }


    updateDimensions = () => {

    };

    buildQuery = () => {

    }

    componentDidMount() {
        this.show("new_control_svg");
        window.addEventListener('resize', this.updateDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    getCategoricalRangeSelectorValues(filterDefinition) {
        const that = this
        let matches = {}
        let filterMatches = []
        filterDefinition.selectedCategoricalRange.forEach((range) => {
            const aryName = filterDefinition.fieldName.toLowerCase() + "." + range
            const ary = that.state.patientArrays[aryName]
            filterMatches = [...new Set([...filterMatches, ...ary])]
        })

        filterDefinition.numberOfPossiblePatientsForThisFilter = filterMatches.length
        matches[filterDefinition.fieldName.toLowerCase()] = filterMatches
        return matches
    }

    getBooleanListValues(filterDefinition) {
        const that = this
        let matches = {}
        filterDefinition.switches.forEach((switchDefinition) => {
            //console.log(switchDefinition)
            if (switchDefinition.value) {
                const aryName = filterDefinition.fieldName.toLowerCase() + "." + switchDefinition.name
                matches[aryName] = that.state.patientArrays[aryName]
            }
        })
        return matches
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("component updated!")

        //need code to iterate of patientArrays, find the patientArrays that being with the fieldnames in the filterDefinitions,
        //then find the intersection of those arrays, and then update the cohort size bar

        //iterate over filterDefinitions
        //for each filterDefinition, find the patientArray that matches the fieldName
        const that = this;
        let processed = []
        let matches = {}
        if (!this.state.isLoading && !this.state.filterDefinitionLoading && !this.state.patientArraysLoading) {
            this.state.filterDefinitions.searchFilterDefinition.forEach((filterDefinition) => {
                //console.log(filterDefinition.fieldName)

                for (const [key, value] of Object.entries(that.state.patientArrays)) {

                    if (!processed.includes(key) && key.toLowerCase().startsWith(filterDefinition.fieldName.toLowerCase())) {
                        processed.push(key)
                        switch (filterDefinition.class) {
                            case "discreteList":
                                //console.log("discreteList")
                                break;
                            case "categoricalRangeSelector":
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
        }
        if (Object.keys(matches).length) {
            let arr2 = []

            for (const key in matches) {
                if (matches.hasOwnProperty(key)) {
                    //console.log(`${key}: ${matches[key]}`);
                    arr2.push(matches[key])

                }
            }

            console.log("Matches across all filters: " + this.fastIntersection(...arr2))

            if (JSON.stringify(this.state.patientsMeetingAllFilters) !== JSON.stringify(this.fastIntersection(...arr2))) {


                this.setState({patientsMeetingAllFilters: this.fastIntersection(...arr2)})
              this.updateFilterData()
            }
        }
        if (prevState.filterDefinitions !== this.state.filterDefinitions) {
            this.state.filterDefinitions.searchFilterDefinition.forEach((e) => {
                //console.log(e.fieldName)
            })

        }
    }

    onUpdate(vals) {

    }

    show = (svgContainerId) => {
        this.reset()
        if (!d3.select("#" + svgContainerId).empty()) {
            d3.select("#" + svgContainerId)._groups[0][0].remove();
        }
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

    updateFilterDefinition
    changeState = (definition) => {

        const defIdx = this.state.filterDefinitions.searchFilterDefinition.findIndex(x => x.fieldName === definition.fieldName)
        const searchFilterDefinition = this.state.filterDefinitions.searchFilterDefinition
        searchFilterDefinition[defIdx] = definition
        this.setState({filterDefinitions: {searchFilterDefinition: searchFilterDefinition}})
        this.updateFilterData()

    };

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
                            <Grid className="switch_list no_padding_grid" item md={1}>
                                {this.state.filterDefinitions.searchFilterDefinition.map((filterDefinition, index) => (
                                    <ToggleSwitch wantsdivs={1} key={index} label={filterDefinition.fieldName}
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
                                                return <DiscreteList key={index} definition={filterDefinition}/>;

                                            case "categoricalRangeSelector":
                                                return <CategoricalRangeSelector key={index}
                                                                                 definition={filterDefinition}
                                                                                 broadcastUpdate={this.changeState}/>;

                                            case "numericRangeSelector":

                                                return <NumericRangeSelector key={index}
                                                                             definition={filterDefinition}
                                                                             broadcastUpdate={this.changeState}/>;

                                            case "booleanList":
                                                return <BooleanList key={index} definition={filterDefinition}
                                                                    broadcastUpdate={this.changeState}/>;
                                            default:
                                                return <div>Unknown filter type</div>
                                        }
                                    })()
                                ))}
                            </Grid>
                            <Grid className={"no_padding_grid"} item md={1}>
                                {this.state.fieldNames.map((label, index) => (
                                    <HSBar
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

