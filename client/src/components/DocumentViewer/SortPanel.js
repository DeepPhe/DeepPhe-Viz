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

// const CustomRadioGroup = styled(RadioGroup)(({ theme }) => ({
//     '& .MuiFormControlLabel-root': {
//         marginBottom: theme.spacing(1), // Adjust spacing here
//     },
//     '& .MuiFormControlLabel-root:last-child': {
//         marginBottom: 0, // Remove margin for the last item
//     },
// }));

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
        text: {
            primary: '#000000',
            secondary: '#FFFFFF',
        },
    },
});

const StyledMenu = styled((props) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color:
            theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity,
                ),
            },
        },
    },
}));


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
                    disableElevation
                    onClick={handleClick}
                    // endIcon={<KeyboardArrowDownIcon />}
                >
                    Options
                </Button>
            <ThemeProvider theme={theme}>
                <StyledMenu
                    id="demo-customized-menu"
                    MenuListProps={{
                        'aria-labelledby': 'demo-customized-button',
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClose} disableRipple>
                        Alphabetically
                    </MenuItem>
                    <MenuItem onClick={handleClose} disableRipple>
                        Occurrence
                    </MenuItem>
                    <MenuItem onClick={handleClose} disableRipple>
                        Semantic Group
                    </MenuItem>
                    <MenuItem onClick={handleClose} disableRipple>
                        Confidence
                    </MenuItem>
                </StyledMenu>
        {/*<FormControl>*/}
        {/*    <FormLabel sx={{ fontWeight: 'light', fontSize: '1em', marginBottom: '-5px'}}><b>Sort Order:</b></FormLabel>*/}
        {/*    <CustomRadioGroup*/}
        {/*        className="compact-radio-group"*/}
        {/*        aria-labelledby="demo-radio-buttons-group-label"*/}
        {/*        defaultValue="occurrence"*/}
        {/*        name="radio-buttons-group"*/}
        {/*        onChange={handleSortChange}*/}
        {/*    >*/}
        {/*        <FormControlLabel value="occurrence" control={<Radio size='small'/>} label="Occurrence"  />*/}
        {/*        <FormControlLabel value="alphabetically" control={<Radio size='small'/>} label="Alphabetically"  />*/}
        {/*        <FormControlLabel value="semantic" control={<Radio size='small'/>} label="Semantic Group" />*/}
        {/*        <FormControlLabel value="confidence" control={<Radio size='small'/>} label="Confidence" />*/}
        {/*    </CustomRadioGroup>*/}
        {/*</FormControl>*/}
                </ThemeProvider>
        </GridItem>

    );
}
