import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import CardHeader from "../Card/CardHeader";
import {Stack, Slider, FormLabel} from "@mui/material";
import Box from "@mui/material/Box";

export function ConfidencePanel(props) {
    const handleConfidenceChange = props.handleConfidenceChange;
    const [value, setValue] = useState(50);


    return (
        <GridItem xs={6} alignItems='center'>

            <FormLabel sx={{ fontWeight: 'light', fontSize: '1em', marginBottom: '-5px' }}>
                <b className="titles">Confidence:</b> <span id="confidenceValue">{value}</span> %
            </FormLabel>
                <GridItem xs={1} />
                <GridItem xs={11} >
                    <Slider
                        value={value}
                        min={1}
                        max={100}
                        onChange={(e, newValue) => {
                            setValue(newValue);
                            handleConfidenceChange(newValue);
                        }}
                        aria-labelledby="confidence-slider"
                        sx={{ mt: '1.5em', ml: '10px'}}
                    />
                </GridItem>
        </GridItem>
    );
}
