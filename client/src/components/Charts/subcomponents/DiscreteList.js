import React, {Component} from "react";

class DiscreteList extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        const {definition} = this.props
        return (
            <React.Fragment>
                <div id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}>
                    <div id={"diagnosis-row"} className={"row no-gutter"}>
                        {definition.globalPatientCountsForCategories.map((item, index) => {
                            return <span key={index}
                                         className={"box-for-word-filter blue-border-for-word-filter"}>{item.category}</span>
                        })}
                    </div>
                </div>
            </React.Fragment>

        )
    }
}

export default DiscreteList;