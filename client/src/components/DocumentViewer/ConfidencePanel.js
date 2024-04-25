import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import {sortedConcepts} from "./ConceptListPanel";
import CardHeader from "../Card/CardHeader";

export function ConfidencePanel(props) {
    const handleConfidenceChange = props.handleConfidenceChange;
    const {confidence, onConfidenceChange} = props;
    const [value, setValue] = useState(confidence);
    // console.log(props);

    // console.log(sortedConcepts);

    return (
        <GridItem style={{width: "100%"}}>
            <CardHeader
                style={{border: "none", boxShadow: "none"}}
                id="mentions_label"
                className={"basicCardHeader"}
            >
                Concepts
            </CardHeader>
            <div id="confidence_label">
                {/*Minimum confidence <br/>*/}
                {/*required to display concept*/}
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
                        // console.log(e.target.value);
                        const newValue = e.target.value;
                        // console.log(newValue);
                        setValue(e.target.value);
                        handleConfidenceChange(e.target.value);
                    }}
                />

            </div>
        </GridItem>
    );
}
