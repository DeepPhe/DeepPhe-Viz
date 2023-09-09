import React, {Component} from "react";
import ToggleSwitch from "../../../CustomButtons/ToggleSwitch";

class SwitchControl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: props.definition
        }
    }

    handleToggleSwitch = (switchId, switchIndex) => ({enabled}) => {
        this.setState({...this.state.definition.switches[switchIndex].value = enabled});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {definition} = this.state
        console.log(definition.fieldName + ":")
        definition.switches.forEach(switchInfo => {
            console.log("    Switch " + switchInfo.name + ": " + switchInfo.value)
        })
    }

    render() {
        return (
            <React.Fragment>
                {this.state.definition.switches.map((item, index) => {
                    const fieldName = this.props.definition.fieldName
                    const switchName = item.name
                    const name = fieldName + "_" + switchName
                    const enabled = item.value //true/false

                    return <ToggleSwitch key={index} wantsdivs={0} label={switchName} theme="graphite-small"
                                         enabled={enabled}
                                         onStateChanged={this.handleToggleSwitch(name, index)}/>
                })}
            </React.Fragment>
        )
    }
}

export default SwitchControl;