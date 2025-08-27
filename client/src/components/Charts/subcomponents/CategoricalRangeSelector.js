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

    // handleStageChange = (e: ChangeResult) => {
    //     this.setState({selectedStages: e})
    //     // this.buildQuery()
    // };

    // toggleActivityEnabled = activity => ({enabled}) => {
    // }
    // render() {
    //
    //     const globalPatientCountsForCategories = this.state.definition.globalPatientCountsForCategories
    //     const selectedCategorialRange = this.state.definition.selectedCategoricalRange
    //     const marks = new Object()
    //     let minSelectedInRange = 10000000000;
    //     let maxSelectedInRange = 0;
    //     globalPatientCountsForCategories.map((item, index) => {
    //         marks[index] = item.category
    //         if (selectedCategorialRange.indexOf(item.category) !== -1) {
    //             minSelectedInRange = Math.min(minSelectedInRange, index)
    //             maxSelectedInRange = Math.max(maxSelectedInRange, index)
    //         }
    //
    //     })
    //
    //
    //     return (
    //         <React.Fragment>
    //             <div id={"stage-overlay-row"}>
    //                 <div id={"stage-row"} className={"row filter_center_rows"}>
    //                     <div className={"slider-container"}>
    //
    //                         <Slider range min={0} max={globalPatientCountsForCategories.length} defaultValue={[minSelectedInRange, maxSelectedInRange]}
    //                                 onChange={this.handleStageChange}
    //                                 draggableTrack={true} pushable={true} marks={marks} dots={false} step={1}/>
    //                     </div>
    //
    //                     <ToggleSwitch wantsDivs={false} label={"Present"} theme="graphite-small"
    //                                   enabled={true}
    //                                   onStateChanged={this.toggleActivityEnabled("Unknown")}/>
    //                 </div>
    //             </div>
    //         </React.Fragment>
    //
    //     )
    // }
}

export default CategoricalRangeSelector;