import GridItem from "../Grid/GridItem";
import React, {useEffect, useState} from "react";
import $ from "jquery";
import {FormControlLabel, FormLabel, Radio, RadioGroup} from "@mui/material";
import FormControl from "@material-ui/core/FormControl";
import {alpha, styled} from '@mui/system';
import Button from '@mui/material/Button';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Divider from "@mui/material/Divider";

// const CustomRadioGroup = styled(RadioGroup)(({ theme }) => ({
//     '& .MuiFormControlLabel-root': {
//         marginBottom: theme.spacing(1), // Adjust spacing here
//     },
//     '& .MuiFormControlLabel-root:last-child': {
//         marginBottom: 0, // Remove margin for the last item
//     },
// }));


export function SortPanel(props) {
    const { filteredConcepts, setFilteredConcepts } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    function sortMentions(method) {
        // Copy the filteredConcepts array to avoid mutating the original state
        const conceptsCopy = filteredConcepts;

        console.log(conceptsCopy);
        if (conceptsCopy.length > 0) {
            // Sort the conceptsCopy array based on the sorting method
            conceptsCopy.sort((a, b) => {
                if (method === 'alphabetically') {
                    return a.preferredText.toLowerCase().localeCompare(b.preferredText.toLowerCase());
                } else if (method === 'occurrence') {
                    console.log(a.begin);
                    return a.begin - b.end; // Assuming dataBegin is a property of the concepts
                } else if (method === 'confidence'){
                    return a.confidence - b.confidence;
                }
                else{
                    return 0
                }
            });

            console.log(conceptsCopy);

            // Update the filteredConcepts state with the sorted array
            setFilteredConcepts(conceptsCopy);
        }
    }

    const handleSortChange = (event) => {
        console.log(event)
        const method = event.target.value;
        sortMentions(method);
    };


    return (
        <GridItem xs={6} >
                <Button
                    id="demo-customized-button"
                    aria-controls={open ? 'demo-customized-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    variant="contained"
                    // disableElevation
                    onClick={handleClick}
                    endIcon={<KeyboardArrowDownIcon style={{fill: 'white'}} />}
                    style={{margin: 'auto', marginTop: '13%', display: "flex"}}
                >
                    Sort Concepts
                </Button>

                <Menu
                    id="demo-customized-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}

                >
                    <MenuItem onClick={handleClose} value={"alphabetically"}>
                        Alphabetically
                    </MenuItem>
                    <Divider sx={{ background: 'black', borderBottomWidth: 2 }} />
                    <MenuItem onClick={handleClose} value={"occurrence"}>
                        Occurrence
                    </MenuItem>
                    <Divider sx={{ background: 'black', borderBottomWidth: 2 }} />
                    <MenuItem onClick={handleClose} value={"semantic"}>
                        Semantic Group
                    </MenuItem>
                    <Divider sx={{ background: 'black', borderBottomWidth: 2 }} />
                    <MenuItem onClick={handleClose} value={"confidence"}>
                        Confidence
                    </MenuItem>
                    </Menu>

        </GridItem>

    );
}
