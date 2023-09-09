import React, {Component} from "react";
import Slider from "rc-slider";
import {ChangeResult} from "multi-range-slider-react";
import SwitchControl from "./controls/SwitchControl";

class CategoricalRangeSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: props.definition
        }
    }

    handleRangeChange = (e: ChangeResult) => {
        const {definition} = this.props
        let selectedCategoricalRange = []
        for (let i = e[0]; i <= e[1]; i++)
            selectedCategoricalRange.push(definition.globalPatientCountsForCategories[i].category)
        this.setState({...definition.selectedCategoricalRange = selectedCategoricalRange})
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {definition} = this.props
        console.log(definition.fieldName + ":")
        console.log("    Range: " + definition.selectedCategoricalRange[0] + " - " + definition.selectedCategoricalRange[definition.selectedCategoricalRange.length - 1])
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

        return (
            <React.Fragment>
                <div id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}>
                    <div id={"categorical-range-selector-row"} className={"row filter_center_rows"}>
                        <div className={"slider-container"}>
                            <Slider range min={0} max={globalPatientCountsForCategories.length - 1}
                                    defaultValue={[minSelectedInRange, maxSelectedInRange]}
                                    onChange={(e) => this.handleRangeChange(e)}
                                    draggableTrack={true} pushable={true} marks={marks} dots={false} step={1}/>
                        </div>
                        <SwitchControl definition = {definition}/>
                    </div>
                </div>
            </React.Fragment>

        )
    }
}

export default CategoricalRangeSelector;