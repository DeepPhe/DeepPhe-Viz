import React, {Component} from "react";
import ToggleSwitch from "../../CustomButtons/ToggleSwitch";

class BooleanList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: props.definition
        };
    }

    handleToggleSwitch = (switchId, switchIndex) => ({enabled}) => {
        this.setState({...this.state.definition.switches[switchIndex].value = enabled});
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log(this.state.definition.fieldName + ":")
        this.state.definition.switches.forEach(switchInfo => {
            console.log("    Switch " + switchInfo.name + ": " + switchInfo.value)
        })
    }

    render() {
        return (
            <React.Fragment>
                <div id={"metastasis-overlay-row"}>
                    <div id={"metastasis-row"} className={"row filter_center_rows"}>
                        <div className={"slider-container"}>
                            {this.state.definition.switches.map((item, index) => {
                                const fieldName = this.props.definition.fieldName
                                const switchName = item.name
                                const name = fieldName + "_" + switchName
                                const enabled = item.value //true/false
                                //const categoryIdx =
                                //  this.props.definition.globalPatientCountsForCategories.findIndex(x => x.category === switchName)
                                //const categoryCount = enabled ? this.props.definition.globalPatientCountsForCategories[categoryIdx].count : 0
                                return <ToggleSwitch key={index} wantsdivs={0} label={name} theme="graphite-small"
                                                     enabled={enabled}
                                                     onStateChanged={this.handleToggleSwitch(name, index)}/>
                            })}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default BooleanList;