import React from "react";
import Slider from "rc-slider";
import {ChangeResult} from "multi-range-slider-react";
import SwitchControl from "./controls/SwitchControl";
import RangeSelector from "./RangeSelector";

class CategoricalRangeSelector extends RangeSelector {

    constructor(props) {
        super(props);
    }
    broadcastUpdate = (definition) => {
        this.props.broadcastUpdate(definition)
    }

    handleRangeChange = (e: ChangeResult) => {
        const {definition} = this.state
        let selectedCategoricalRange = []
        for (let i = e[0]; i <= e[1]; i++) selectedCategoricalRange.push(definition.globalPatientCountsForCategories[i].category)
        // this.props.definition.selectedCategoricalRange = selectedCategoricalRange
        this.setState({...definition.selectedCategoricalRange = selectedCategoricalRange, updated: false})
    };

    handleSwitchUpdate = (definition) => {
        this.setState({definition: definition, updated: false})
    }

    componentDidMount() {
        this.addCountsToCategory()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.updated === false) {
            const {definition} = this.state
            let countMeetingThisFilter = 0
            let numOfPossiblePatientsForThisFilter = 0
            definition.globalPatientCountsForCategories.forEach((item, index) => {
                let idx = definition.selectedCategoricalRange.indexOf(item.category)
                if (idx !== -1) {
                    countMeetingThisFilter += item.count
                }

                numOfPossiblePatientsForThisFilter += item.count
            })

            ///might have to update the globl thing here
            definition.numberOfPossiblePatientsForThisFilter = numOfPossiblePatientsForThisFilter
            console.log(definition.fieldName + " numberOfPossiblePatientsForThisFilter: " + numOfPossiblePatientsForThisFilter)
            definition.patientsMeetingThisFilterOnly = countMeetingThisFilter
            //patientsMeetingEntireSetOfFilters

            // console
            //     .log(definition
            //
            //         .fieldName + ":")
            // console
            //     .log("    Range: " + definition.selectedCategoricalRange
            //         [0] + " - " + definition.selectedCategoricalRange
            //         [definition.selectedCategoricalRange.length - 1])
            this.setState({definition: definition, updated: true},  () => {
                this.broadcastUpdate(this.state.definition)
            })
        }


        // this
        //     .state
        //     .definition
        //     .switches
        //     .forEach(switchInfo => {
        //         console
        //             .log("    Switch " + switchInfo.name + ": " + switchInfo.value)
        //     })
    }


    render() {
        const {definition} = this.props
        const globalPatientCountsForCategories = definition.globalPatientCountsForCategories
        const selectedCategoricalRange = definition.selectedCategoricalRange
        const marks = {}
        let minSelectedInRange = 10000000000;
        let maxSelectedInRange = 0;
        globalPatientCountsForCategories.map((item, index) => {
            marks[index] = item.category
            if (selectedCategoricalRange.indexOf(item.category) !== -1) {
                minSelectedInRange = Math.min(minSelectedInRange, index)
                maxSelectedInRange = Math.max(maxSelectedInRange, index)
            }
            return true;
        })

        return (<React.Fragment>

                <div id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}>
                    <div id={"categorical-range-selector-row"} className={"filter-center-rows row"}>
                        {this.getToggleSwitch(definition, this.state.index)}
                        <div className={"slider-container"}>


                            <Slider range min={0} max={globalPatientCountsForCategories.length - 1}
                                    defaultValue={[minSelectedInRange, maxSelectedInRange]}
                                    onChange={(e) => this.handleRangeChange(e)}
                                    draggableTrack={true} pushable={true} marks={marks} dots={false} step={1}/>
                        </div>
                        <SwitchControl broadcastUpdate={this.handleSwitchUpdate} definition={definition}/>
                    </div>
                </div>
            </React.Fragment>

        )
    }
}

export default CategoricalRangeSelector;