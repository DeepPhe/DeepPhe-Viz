import React, {Component} from "react";
import SwitchControl from "./controls/SwitchControl";

class BooleanList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            definition: props.definition
        };
    }

    // componentDidUpdate(prevProps, prevState, snapshot) {
    //
    // }

    render() {
        const {definition} = this.props
        return (
            <React.Fragment>
                <div id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}>
                    <div id={"boolean-list-row"} className={"row filter_center_rows"}>
                        <div className={"slider-container"}>
                            <SwitchControl definition = {definition}/>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default BooleanList;