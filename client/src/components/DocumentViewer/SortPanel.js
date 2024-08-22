import GridItem from "../Grid/GridItem";
import React, { useState } from "react";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Divider from "@mui/material/Divider";

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
        const conceptsCopy = [...filteredConcepts];
        // console.log(method);

        if (conceptsCopy.length > 0) {
            conceptsCopy.sort((a, b) => {
                if (method === 'alphabetically') {
                    return a.preferredText.toLowerCase().localeCompare(b.preferredText.toLowerCase());
                // } else if (method === 'occurrence') {
                //     console.log(a);
                //     return a.begin - b.end;
                } else if (method === 'confidence') {
                    return b.confidence - a.confidence;
                }
                else if(method === 'semantic') {
                    return a.dpheGroup.toLowerCase().localeCompare(b.dpheGroup.toLowerCase()); // Sort by dphegroup alphabetically
                }
                else
                {
                    return 0;
                }
            });

            setFilteredConcepts(conceptsCopy);
        }
    }

    const handleSortChange = (method) => {
        sortMentions(method);
        handleClose();
    };

    return (
        <GridItem xs={12}>
            <Button
                id="demo-customized-button"
                aria-controls={open ? 'demo-customized-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                variant="contained"
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon style={{ fill: 'white' }} />}
                style={{ margin: 'auto', marginTop: '15px', display: "flex", padding: "6px", marginBottom: '15px', float: 'left' }}
            >
                Sort Concepts
            </Button>

            <Menu
                id="demo-customized-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={() => handleSortChange('alphabetically')}>
                    Alphabetically
                </MenuItem>
                <Divider sx={{ background: 'black', borderBottomWidth: 2 }} />
                <MenuItem onClick={() => handleSortChange('semantic')}>
                    Semantic Group
                </MenuItem>
                <Divider sx={{ background: 'black', borderBottomWidth: 2 }} />
                <MenuItem onClick={() => handleSortChange('confidence')}>
                    Confidence
                </MenuItem>
            </Menu>
        </GridItem>
    );
}
