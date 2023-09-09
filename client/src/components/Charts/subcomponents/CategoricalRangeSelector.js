import React, {Component} from "react";
import Slider from "rc-slider";
import ToggleSwitch from "../../CustomButtons/ToggleSwitch";
import {ChangeResult} from "multi-range-slider-react";

class CategoricalRangeSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: props.definition
        }
    }

    handleRangeChange = (e: ChangeResult) => {
        let selectedCategoricalRange = []
        for (let i = e[0]; i <= e[1]; i++)
            selectedCategoricalRange.push(this.state.definition.globalPatientCountsForCategories[i].category)
        this.setState({...this.state.definition.selectedCategoricalRange = selectedCategoricalRange})
    };

    handleToggleSwitch = (switchId, switchIndex) => ({enabled}) => {
        this.setState({...this.state.definition.switches[switchIndex].value = enabled});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(this.state.definition.fieldName + ":")
        console.log("    Range: " + this.state.definition.selectedCategoricalRange[0] + " - " + this.state.definition.selectedCategoricalRange[this.state.definition.selectedCategoricalRange.length - 1])
        this.state.definition.switches.forEach(switchInfo => {
            console.log("    Switch " + switchInfo.name + ": " + switchInfo.value)
        })
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
                            <Slider range min={0} max={globalPatientCountsForCategories.length - 1}
                                    defaultValue={[minSelectedInRange, maxSelectedInRange]}
                                    onChange={(e) => this.handleRangeChange(e)}
                                    draggableTrack={true} pushable={true} marks={marks} dots={false} step={1}/>
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

export default CategoricalRangeSelector;