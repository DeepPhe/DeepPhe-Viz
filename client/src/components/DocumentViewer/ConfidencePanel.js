import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import {Stack, Slider, FormLabel} from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import GridContainer from "../Grid/GridContainer";
import Grid from "@material-ui/core/Grid";


// function ConfidenceButtons({ label, value, selectedValue, onChange, backgroundColor }) {
//     return (
//         <GridItem xs={4} sx={{marginLeft: 5}}>
//             <Box borderRadius={2} sx={{backgroundColor: backgroundColor, marginRight: 0.5}}>
//                 <FormControlLabel
//                     control={<Checkbox
//                         sx={{ paddingRight: 0}}
//                         checked={selectedValue === value}
//                         onChange={() => onChange(value)}
//                     />}
//                     label={<Typography sx={{ width: '100%', textAlign: 'center' }}>{label}</Typography>}
//                     sx={{ flexGrow: 1, justifyContent: 'center', marginRight: 0, alignItems: 'center',
//                         width: '100%' }}
//                 />
//             </Box>
//         </GridItem>
//     );
// }

export function ConfidencePanel(props) {
    const handleConfidenceChange = props.handleConfidenceChange;
    const [selectedValue, setSelectedValue] = useState(null);
    const [value, setValue] = useState(0);


    // const handleChange = (value) => {
    //     setSelectedValue(value);
    //     handleConfidenceChange(value);
    // };

    return (
        <GridItem xs={12} alignItems='center'>
            <Box sx={{ marginBottom: '10px !important', flexDirection: 'column',
                alignItems: 'center'}}>
                <GridContainer spacing={2}>

                    {/*<GridItem xs={1} />*/}
                    {/*<GridItem xs={12}>*/}
                    {/*<Slider*/}
                    {/*    value={value}*/}
                    {/*    min={1}*/}
                    {/*    max={100}*/}
                    {/*    onChange={(e, newValue) => {*/}
                    {/*        setValue(newValue);*/}
                    {/*        handleConfidenceChange(newValue);*/}
                    {/*    }}*/}
                    {/*    aria-labelledby="confidence-slider"*/}
                    {/*    sx={{ mt: '1.5em', ml: '48px', mr: '-60px', width: '83%'}}*/}
                    {/*/>*/}
                    {/*</GridItem>*/}
                    {/*<GridItem xs={12}>*/}
                    {/*    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '90%', float: 'right', mt: '15px'}}>*/}
                    {/*        <ConfidenceButtons label="Low" value={0} selectedValue={selectedValue} onChange={handleChange} backgroundColor="orange"/>*/}
                    {/*        <ConfidenceButtons label="Medium" value={33} selectedValue={selectedValue} onChange={handleChange} backgroundColor="#FFF455"/>*/}
                    {/*        <ConfidenceButtons label="High" value={66} selectedValue={selectedValue} onChange={handleChange} backgroundColor="#7ABA78"/>*/}
                    {/*    </Box>*/}
                    {/*</GridItem>*/}
                </GridContainer>
            </Box>
        </GridItem>

    );
}

{/*SLIDER*/}

