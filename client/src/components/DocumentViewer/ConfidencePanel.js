import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import {Stack, Slider, FormLabel} from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import GridContainer from "../Grid/GridContainer";
import Grid from "@material-ui/core/Grid";


function ConfidenceButtons({ label, value, selectedValue, onChange, backgroundColor }) {
    return (
        <Grid item xs={4}>
            <Box borderRadius={2} sx={{backgroundColor: backgroundColor, marginRight: 0.5}}>
                <FormControlLabel
                    control={<Checkbox
                        sx={{ paddingRight: 0 }}
                        checked={selectedValue === value}
                        onChange={() => onChange(value)}
                    />}
                    label={<Typography sx={{ width: '100%', textAlign: 'center' }}>{label}</Typography>}
                    sx={{ flexGrow: 1, justifyContent: 'center', marginRight: 0 }}
                />
            </Box>
        </Grid>
    );
}

export function ConfidencePanel(props) {
    const handleConfidenceChange = props.handleConfidenceChange;
    const [selectedValue, setSelectedValue] = useState(null);
    const [value, setValue] = useState(50);


    const handleChange = (value) => {
        setSelectedValue(value);
        handleConfidenceChange(value);
    };

    return (
        <GridItem xs={9} alignItems='center'>
            <Box sx={{ marginBottom: '10px !important' }}>
                <GridContainer spacing={2}>
                    <FormLabel sx={{ fontWeight: 'light', fontSize: '1em', marginBottom: '-5px' }}>
                        <b className="titles">Confidence:</b> <span id="confidenceValue">{value}</span> %
                    </FormLabel>
                    <GridItem xs={1} />
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
                    <ConfidenceButtons label="Low" value={0} selectedValue={selectedValue} onChange={handleChange} backgroundColor="orange"/>
                    <ConfidenceButtons label="Medium" value={33} selectedValue={selectedValue} onChange={handleChange} backgroundColor="#FFF455"/>
                    <ConfidenceButtons label="High" value={66} selectedValue={selectedValue} onChange={handleChange} backgroundColor="#7ABA78"/>
                </GridContainer>
            </Box>
        </GridItem>

    );
}

{/*SLIDER*/}

