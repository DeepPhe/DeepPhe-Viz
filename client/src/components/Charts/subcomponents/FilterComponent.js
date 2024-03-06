import React, {Component} from "react";
import ToggleSwitch from "../../CustomButtons/ToggleSwitch";
import $ from "jquery";

class FilterComponent extends Component {

    constructor(props) {
        super(props);

    }

    toggleFilterEnabled = activity => ({enabled}) => {
        const selector = "#" + activity.filterDefinition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"
        if (enabled) {
            $(selector).removeClass("overlay-row")
        } else {
            $(selector).addClass("overlay-row")
        }
    }

    getToggleSwitch = (filterDefinition, index) => {

        return (

            <React.Fragment>
                <ToggleSwitch wantsdivs={1} key={index} label={filterDefinition.fieldName}
                              theme="graphite-small"
                              enabled={true}
                              onStateChanged={this.toggleFilterEnabled(filterDefinition)}/>
            </React.Fragment> )

    }
}

export default FilterComponent;