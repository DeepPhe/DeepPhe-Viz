import React, {Component} from "react";
import Slider from "rc-slider";
import {ChangeResult} from "multi-range-slider-react";
import SwitchControl from "./controls/SwitchControl";

class NumericRangeSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: props.definition
        }
    }

    handleRangeChange = (range: ChangeResult) => {
       const {definition} = this.props;
        this.setState({...definition.selectedNumericRange.min = range[0]});
        this.setState({...definition.selectedNumericRange.max = range[1]});
    };


    componentDidUpdate(prevProps, prevState, snapshot) {
        const {definition} = this.props;
        console.log(definition.fieldName + ":")
        console.log("    Range " + definition.selectedNumericRange.min + " - " + definition.selectedNumericRange.max)
    }
    render() {
        const {definition} = this.props;
        //const globalPatientCountsForCategories = definition.globalPatientCountsForCategories
        const selectedNumericRange = definition.selectedNumericRange
        const numericRangeSelectorDefinition = definition.numericRangeSelectorDefinition
        let marks = {}
        const minSelectedInRange = selectedNumericRange.min;
        const maxSelectedInRange = selectedNumericRange.max;
        const markStep = (numericRangeSelectorDefinition.max - numericRangeSelectorDefinition.min) / 10;

        let markIndex = 0;
        while (markIndex < 11) {
            marks[markIndex * markStep] = "" + markIndex * markStep
            markIndex++
        }

        return (
            <React.Fragment>
                <div id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}>
                    <div id={"numeric-range-selector-row"} className={"row filter_center_rows"}>
                        <div className={"slider-container"}>
                            <Slider range min={numericRangeSelectorDefinition.min}
                                    max={numericRangeSelectorDefinition.max + 1}
                                    defaultValue={[minSelectedInRange, maxSelectedInRange]}
                                    onChange={(e) => this.handleRangeChange(e)}
                                    draggableTrack={true} pushable={true} dots={false} included={true} marks={marks}
                                    step={numericRangeSelectorDefinition.step}/>
                        </div>
                        <SwitchControl definition = {definition}/>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default NumericRangeSelector;