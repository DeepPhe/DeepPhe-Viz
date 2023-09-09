import React, {Component} from "react";
import Slider from "rc-slider";
import {ChangeResult} from "multi-range-slider-react";
import ToggleSwitch from "../../CustomButtons/ToggleSwitch";

class NumericRangeSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: props.definition
        }
    }

    handleRangeChange = (range: ChangeResult) => {
        this.setState({...this.state.definition.selectedNumericRange.min = range[0]});
        this.setState({...this.state.definition.selectedNumericRange.max = range[1]});
    };

    handleToggleSwitch = (switchId, switchIndex) => ({enabled}) => {
        this.setState({...this.state.definition.switches[switchIndex].value = enabled});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(this.state.definition.fieldName + ":")
        console.log("    Range " + this.state.definition.selectedNumericRange.min + " - " + this.state.definition.selectedNumericRange.max)
        this.state.definition.switches.forEach(switchInfo => {
            console.log("    Switch " + switchInfo.name + ": " + switchInfo.value)
        })
    }
    render() {
        //const globalPatientCountsForCategories = this.state.definition.globalPatientCountsForCategories
        const selectedNumericRange = this.state.definition.selectedNumericRange
        const numericRangeSelectorDefinition = this.state.definition.numericRangeSelectorDefinition
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
                <div id={"age-at-dx-overlay-row"}>
                    <div id={"age-at-dx-row"} className={"row filter_center_rows"}>
                        <div className={"slider-container"}>
                            <Slider range min={numericRangeSelectorDefinition.min}
                                    max={numericRangeSelectorDefinition.max + 1}
                                    defaultValue={[minSelectedInRange, maxSelectedInRange]}
                                    onChange={(e) => this.handleRangeChange(e)}
                                    draggableTrack={true} pushable={true} dots={false} included={true} marks={marks}
                                    step={numericRangeSelectorDefinition.step}/>
                        </div>
                        {this.state.definition.switches.map((item, index) => {
                            const fieldName = this.props.definition.fieldName
                            const switchName = item.name
                            const name = fieldName + "_" + switchName
                            const enabled = item.value //true/false

                            return <ToggleSwitch key={index} wantsdivs={0} label={name} theme="graphite-small"
                                                 enabled={enabled}
                                                 onStateChanged={this.handleToggleSwitch(name, index)}/>
                        })}
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

export default NumericRangeSelector;