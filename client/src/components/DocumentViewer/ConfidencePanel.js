import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import CardHeader from "../Card/CardHeader";
import {Stack, Slider} from "@mui/material";
import Box from "@mui/material/Box";

export function ConfidencePanel(props) {
    const handleConfidenceChange = props.handleConfidenceChange;
    const {confidence, onConfidenceChange} = props;
    const [value, setValue] = useState(confidence);

    const handleChange = (e) => {
        setValue(e);
    };

    return (
        <GridItem xs={6}>
            {/*<GridItem alignItems="center">*/}
            {/*<div id="confidence_label">*/}
            {/*    <p>*/}
            {/*        <b>Confidence:</b> <span id="confidenceValue">50</span> %*/}
            {/*    </p>*/}
            {/*    <input*/}
            {/*        type="range"*/}
            {/*        min="1"*/}
            {/*        max="100"*/}
            {/*        className="slider"*/}
            {/*        id="confidenceRange"*/}
            {/*        onChange={(e) => {*/}
            {/*            const newValue = e.target.value;*/}
            {/*            setValue(newValue);*/}
            {/*            handleConfidenceChange(newValue);*/}
            {/*        }}*/}
            {/*    />*/}

            {/*</div>*/}
            {/*</GridItem>*/}

            {/*<Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">*/}
                <Slider aria-label="Always visible"
                        defaultValue={50}
                        valueLabelDisplay="on" />
            {/*</Stack>*/}

        </GridItem>
    );
}
