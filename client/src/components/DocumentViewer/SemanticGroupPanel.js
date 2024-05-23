import GridItem from "../Grid/GridItem";
import React, {useEffect, useState} from "react";
import GridContainer from "../Grid/GridContainer";

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Divider from '@mui/material/Divider';



export function SemanticGroupPanel(props) {
    const semanticGroups = props.semanticGroups;
    const handleSemanticGroupChange = props.handleSemanticGroupChange;
    const [isVisible, setIsVisible] = useState(true);


    const handleCheckboxChange = (e) => {
        handleSemanticGroupChange(e.target.dataset.semanticGroup, e.target.checked);
    };

    const handleAllCheckboxChange = (checked) => {
        Object.keys(semanticGroups).map((group, index) => {
            handleSemanticGroupChange(group, checked);
        });
    };

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    const getHeader = () => {
        return (<GridContainer>
                <GridItem xs={4}>
                    <div>
                        <span><b>Semantic Groups:</b></span>
                    </div>
                </GridItem>
                <GridItem xs={7}>

                </GridItem>
                <GridItem xs={1} >
                    {isVisible ? (<span>
                    <i className="caret-custom fa fa-caret-down fa-2x" onClick={toggleVisibility}></i>
                            {/* Show this icon when visible */}
                </span>) : (<span>
                    <i className="caret-custom fa fa-caret-up fa-2x" onClick={toggleVisibility}></i>
                            {/* Show this icon when hidden */}
                </span>)}
                </GridItem>
                <Divider orientation="horizontal" flexItem />

                <GridItem xs={12}>
                    <Box sx={{ mb:2, display: 'flex', justifyContent: 'flex-start' }} className={`${isVisible ? "visible" : "hidden"}`}>
                        <Button
                            sx={{fontSize:'14px', mr: 2}}
                            id={"check-all-btn"}
                            variant="contained"
                            size="small"
                            // startIcon={<CheckBoxIcon />}
                            onClick={checkAll}
                        >Check All</Button>
                        <Button
                            sx={{fontSize:'14px'}}
                            id={"uncheck-all-btn"}
                            variant="contained"
                            size="small"
                            onClick={unCheckAll}
                        >Uncheck All</Button>

                    </Box>
                </GridItem>

            </GridContainer>);
    };

    const getSemanticGroupBox = (group, index, values) => {
        // console.log(values);
        const id = "checkbox" + index;
        return (<div
                style={{
                    margin: "0 5px 5px 0",
                    cursor: "pointer",
                    fontFamily: "Monaco, monospace",
                    borderRadius: "5px",
                    float: "left",
                    backgroundColor: values.backgroundColor,
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
                <label htmlFor={id}>{group}</label>
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
