import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import GridContainer from "../Grid/GridContainer";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import {hexToRgba} from "./ColorUtils";


export function SemanticGroupPanel(props) {
    const semanticGroups = props.semanticGroups;
    const handleSemanticGroupChange = props.handleSemanticGroupChange;
    const [isVisible, setIsVisible] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);

    const handleCheckboxChange = (e) => {
        handleSemanticGroupChange(e.target.dataset.semanticGroup, e.target.checked);
    };

    const handleAllCheckboxChange = (checked) => {
        Object.keys(semanticGroups).map((group, index) => {
            handleSemanticGroupChange(group, checked);
        });
    };

    const toggleVisibilityandTitle = () => {
        setIsVisible(!isVisible);
        setIsExpanded(!isExpanded);
    };

    const getHeader = () => {
        return (
            <GridContainer>
                {/*<GridItem xs={6}>*/}
                {/*    <div>*/}
                {/*        <span><b className="titles">Semantic Groups:</b></span>*/}
                {/*    </div>*/}
                {/*</GridItem>*/}
                {/*<GridItem xs={5}>*/}
                {/*    {isExpanded ?*/}
                {/*        <b className="collapseTitle" onClick={toggleVisibilityandTitle}> Expanded </b>*/}
                {/*        :*/}
                {/*        <b className="collapseTitle" onClick={toggleVisibilityandTitle}> Collapsed </b>*/}
                {/*    }*/}
                {/*</GridItem>*/}
                {/*<GridItem xs={1} >*/}
                {/*    {isVisible ? (<span>*/}
                {/*    <i className="caret-custom fa fa-caret-down fa-2x" onClick={toggleVisibilityandTitle}></i>*/}
                {/*            /!* Show this icon when visible *!/*/}
                {/*</span>) : (<span>*/}
                {/*    <i className="caret-custom fa fa-caret-up fa-2x" onClick={toggleVisibilityandTitle}></i>*/}
                {/*            /!* Show this icon when hidden *!/*/}
                {/*</span>)}*/}
                {/*</GridItem>*/}
                {/*<Divider orientation="horizontal" flexItem />*/}

            <GridItem xs={12}>
                <Box
                    sx={{
                        mb: 1,
                        mr: 2,
                        display: 'flex',
                        justifyContent: 'flex-start', // Aligns buttons to the left
                        float: 'left', // Optional: to make the box float left
                        // paddingTop: 2, // Add top padding
                        // paddingLeft: 2 // Add left padding
                        // Target the specific class with a higher specificity selector
                        '&.MuiBox-root': { // Targeting the MUI Box class
                            padding: '0 !important', // Remove any unwanted padding
                            margin: '0 !important', // Remove any unwanted margin
                        },
                    }}
                    className={`${isVisible ? "visible" : "hidden"}`}
                >
                    <Button
                        sx={{
                            fontSize: '17px',
                            fontFamily: "Monaco, monospace",
                            fontWeight: "bold",
                            mr: 1
                        }}
                        id={"check-all-btn"}
                        variant="contained"
                        size="small"
                        // startIcon={iconToggled ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon />}
                        onClick={checkAll}
                    >
                        Check All
                    </Button>
                    <Button
                        sx={{
                            fontSize: '17px',
                            fontFamily: "Monaco, monospace",
                            fontWeight: "bold"
                        }}
                        id={"uncheck-all-btn"}
                        variant="contained"
                        size="small"
                        onClick={unCheckAll}
                    >
                        Uncheck All
                    </Button>
                </Box>
            </GridItem>



        </GridContainer>);
    };

    const getSemanticGroupBox = (group, index, values) => {
        // console.log(values);
        const id = "checkbox" + index;
        const backgroundColor = hexToRgba(values.backgroundColor, 0.65); // Adjust the alpha value as needed
        return (<div
                style={{
                    margin: "0 5px 5px 0",
                    cursor: "pointer",
                    fontFamily: "Monaco, monospace",
                    borderRadius: "5px",
                    float: "left",
                    backgroundColor: backgroundColor,
                }}
            >
                <input
                    name={"semanticGroups"}
                    className={"semantic-checkbox"}
                    key={id}
                    type="checkbox"
                    id={id}
                    checked={values.checked}
                    onChange={handleCheckboxChange}
                    data-semantic-group={group}
                />
                <label className='semantic_label' htmlFor={id}>{group}</label>
            </div>);
    };

    const getSemanticGroups = () => {
        return (// adding isVisible to hide semantic-semantic groups when prompted
            <div className={`semantic-groups ${isVisible ? "visible" : "hidden"}`}>
                {Object.keys(semanticGroups).map((group, index) => {
                    return getSemanticGroupBox(group, index, semanticGroups[group]);
                })}
            </div>);
    };


    function checkAll() {
        handleAllCheckboxChange(true);
    }

    function unCheckAll() {
        handleAllCheckboxChange(false);
    }

    return (<GridItem xs={12}>

            {getHeader()}
            {getSemanticGroups()}
        </GridItem>);
}
