import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import $ from "jquery";
import GridContainer from "../Grid/GridContainer";
import {Box} from "@material-ui/core";
import Divider from "@material-ui/core/Divider";


export function SemanticGroupPanel(props) {
    const semanticGroups = props.semanticGroups;
    const handleSemanticGroupChange = props.handleSemanticGroupChange;
    // const [checkboxGridVisible, setCheckboxGridVisible] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    function buildColorDistribution(textMention) {
        let colorDistribution = [];
        let increment = (100 / textMention.count).toFixed(2);

        for (let i = 0; i < textMention.count; i++) {
            let bgcolor = "highlight_terms";
            let start = i > 0 ? i * increment + "%" : 0;
            let finish = i < textMention.count - 1 ? (i + 1) * increment + "%" : "100%";
            colorDistribution.push(bgcolor + " " + start);
            colorDistribution.push(bgcolor + " " + finish);
        }
        return colorDistribution;
    }

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
                <GridItem xs={12}
                          className={`caret-options-container visible`}>
                    {isVisible ? (<span>
                    <i className="caret-custom fa fa-caret-down fa-2x" onClick={toggleVisibility}></i>
                            {/* Show this icon when visible */}
                </span>) : (<span>
                    <i className="caret-custom fa fa-caret-up fa-2x" onClick={toggleVisibility}></i>
                            {/* Show this icon when hidden */}
                </span>)}

                    <div className="options-container">
                        <span>Semantic Groups</span>

                    </div>
                    <Divider sx={{ backgroundColor: "teal", height: "3px", margin: "16px 0" }}/>
                </GridItem>


                <GridItem xs={12}>
                    <Box display={"flex"} justifyContent={"flex-end"}>
                        <button id={"check-all-btn"} onClick={checkAll}>check all</button>
                        <button id={"uncheck-all-btn"} onClick={unCheckAll}>uncheck all</button>
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
        // $(".semantic-checkbox:not(:checked)").trigger("click");
        // $(".semantic-checkbox:not(:checked)").trigger("change");
    }

    function unCheckAll() {
        handleAllCheckboxChange(false);
        // $(".semantic-checkbox:checked").trigger("click");
        // $(".semantic-checkbox:checked").trigger("change");
    }

    return (<GridItem>

            {getHeader()}
            {getSemanticGroups()}
        </GridItem>);
}
