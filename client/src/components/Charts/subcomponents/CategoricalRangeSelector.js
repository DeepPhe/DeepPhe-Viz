import React, {Component} from "react";
import Slider from "rc-slider";
import ToggleSwitch from "../../CustomButtons/ToggleSwitch";
import {ChangeResult} from "multi-range-slider-react";

class CategoricalRangeSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: props.definition,
            selected: props.selected,
            onSelect: props.onSelect
        }
    }

    handleRangeChange = (e: ChangeResult) => {
        this.setState({selectedStages: e})
        console.log(this.state.definition.fieldName + ":")
        console.log("    Beginning Category: " + this.state.definition.selectedCategoricalRange[e[0]])
        console.log("    Ending Category: " + this.state.definition.selectedCategoricalRange[e[1]])
        this.state.definition.switches.forEach(switchInfo => {
            console.log("    Switch " + switchInfo.name + ": " + switchInfo.value)
        })


    };

    toggleActivityEnabled = activity => ({enabled}) => {
    }
    render() {

        const globalPatientCountsForCategories = this.state.definition.globalPatientCountsForCategories
        const selectedCategorialRange = this.state.definition.selectedCategoricalRange
        const marks = {}
        let minSelectedInRange = 10000000000;
        let maxSelectedInRange = 0;
        globalPatientCountsForCategories.map((item, index) => {
            marks[index] = item.category
            if (selectedCategorialRange.indexOf(item.category) !== -1) {
                minSelectedInRange = Math.min(minSelectedInRange, index)
                maxSelectedInRange = Math.max(maxSelectedInRange, index)
            }
            return true;

        })

        return (
            <React.Fragment>
                <div id={"stage-overlay-row"}>
                    <div id={"stage-row"} className={"row filter_center_rows"}>
                        <div className={"slider-container"}>

                            <Slider range min={0} max={globalPatientCountsForCategories.length-1}
                                    defaultValue={[minSelectedInRange, maxSelectedInRange]}
                                    onChange={(e) => this.handleRangeChange(e)}
                                    draggableTrack={true} pushable={true} marks={marks} dots={false} step={1}/>
                        </div>

                        <ToggleSwitch wantsdivs={0} label={"Present"} theme="graphite-small"
                                      enabled={true}
                                      onStateChanged={this.toggleActivityEnabled("Unknown")}/>
                    </div>
                </div>
            </React.Fragment>

        )
    }
}

export default CategoricalRangeSelector;