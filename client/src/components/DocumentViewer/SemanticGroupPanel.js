import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import $ from "jquery";
import GridContainer from "../Grid/GridContainer";
import {Box} from "@material-ui/core";
// import { Divider } from '@mui/material';
// import Divider from "@material-ui/core/Divider";
// import Divider from '@mui/material/Divider';



export function SemanticGroupPanel(props) {
    const semanticGroups = props.semanticGroups;
    const handleSemanticGroupChange = props.handleSemanticGroupChange;
    const [isVisible, setIsVisible] = useState(true);


    const handleCheckboxChange = (e) => {
        handleSemanticGroupChange(e.target.dataset.semanticGroup, e.target.checked);
        props.setFilteredConcepts([]);
    };

    const handleAllCheckboxChange = (checked) => {
        Object.keys(semanticGroups).map((group, index) => {
            handleSemanticGroupChange(group, checked);
        });
        props.setFilteredConcepts([]);
    };

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    const getHeader = () => {
        return (<GridContainer>
            {/*className={`caret-options-container visible`}*/ }
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
                {/*<Divider orientation="horizontal" flexItem />*/}

                <GridItem xs={12}>
                    <Box display={"flex"} justifyContent={"flex-end"}>
                        <button id={"check-all-btn"} className={`${isVisible ? "visible" : "hidden"}`} onClick={checkAll}>check all</button>
                        <button id={"uncheck-all-btn"} className={`${isVisible ? "visible" : "hidden"}`} onClick={unCheckAll}>uncheck all</button>
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
