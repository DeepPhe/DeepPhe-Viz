import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import CardHeader from "../Card/CardHeader";

export function ConfidencePanel(props) {
    const handleConfidenceChange = props.handleConfidenceChange;
    const {confidence, onConfidenceChange} = props;
    const [value, setValue] = useState(confidence);

    return (
        <GridItem style={{width: "100%"}}>
            <CardHeader
                style={{border: "none", boxShadow: "none"}}
                id="mentions_label"
                className={"basicCardHeader"}
            >
                Concepts
            </CardHeader>
            <GridItem xs={4} alignItems="center">
            <div id="confidence_label">
                <p>
                    <b>Confidence:</b> <span id="confidenceValue">50</span> %
                </p>
                <input
                    type="range"
                    min="1"
                    max="100"
                    className="slider"
                    id="confidenceRange"
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setValue(newValue);
                        handleConfidenceChange(newValue);
                    }}
                />

            </div>
            </GridItem>
        </GridItem>
    );
}
