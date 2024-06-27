import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import {Stack, Slider, FormLabel} from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import GridContainer from "../Grid/GridContainer";


export function ConfidencePanel(props) {
    const handleConfidenceChange = props.handleConfidenceChange;
    const [value, setValue] = useState(50);


    return (
        <GridItem xs={6} alignItems='center'>

            {/*<FormLabel sx={{ fontWeight: 'light', fontSize: '1em', marginBottom: '-5px' }}>*/}
            {/*    <b className="titles">Confidence:</b> <span id="confidenceValue">{value}</span> %*/}
            {/*</FormLabel>*/}
            {/*    <GridItem xs={1} />*/}
            {/*<Slider*/}
            {/*    value={value}*/}
            {/*    min={1}*/}
            {/*    max={100}*/}
            {/*    onChange={(e, newValue) => {*/}
            {/*        setValue(newValue);*/}
            {/*        handleConfidenceChange(newValue);*/}
            {/*    }}*/}
            {/*    aria-labelledby="confidence-slider"*/}
            {/*    sx={{ mt: '1.5em', ml: '10px'}}*/}
            {/*/>*/}
            <GridContainer spacing={2}>
                <GridItem xs={4} >
                    <Box display="flex" alignItems="center" border={1} borderRadius={0} padding={2}>
                        <FormControlLabel
                            control={<Checkbox />}
                            label={<Typography>Low</Typography>}
                        />
                    </Box>
                </GridItem>
                    <GridItem xs={4} >
                        <Box display="flex" alignItems="center" border={1} borderRadius={0} padding={2}>
                            <FormControlLabel
                                control={<Checkbox />}
                                label={<Typography>Mid</Typography>}
                            />
                        </Box>
                    </GridItem>
                    <GridItem xs={4} >
                        <Box display="flex" alignItems="center" border={1} borderRadius={0} padding={2}>
                            <FormControlLabel
                                control={<Checkbox />}
                                label={<Typography>High</Typography>}
                            />
                        </Box>
                    </GridItem>
            </GridContainer>
        </GridItem>

    );
}
