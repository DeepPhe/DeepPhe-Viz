import GridContainer from "../Grid/GridContainer";
import {SemanticGroupPanel} from "./SemanticGroupPanel";
import React, {useState} from "react";
import CardHeader from "../Card/CardHeader";
import CardBody from "../Card/CardBody";
import Card from "../Card/Card";

import {ConfidencePanel} from "./ConfidencePanel";
import {SortPanel} from "./SortPanel";
import {SearchPanel} from "./SearchPanel";
import {ConceptListPanel} from "./ConceptListPanel";
import {ConfidenceDataViz} from "./ConfidenceDataViz";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import GridItem from "../Grid/GridItem";

export function ConceptPanel(props) {
    const concepts = props.concepts;
    const mentions = props.mentions;
    const doc = props.doc;
    const handleSemanticGroupChange = props.handleSemanticGroupChange;
    const handleConfidenceChange = props.handleConfidenceChange;
    const semanticGroups = props.semanticGroups;
    const filteredConcepts = props.filteredConcepts;
    const setFilteredConcepts = props.setFilteredConcepts;
    const confidence = props.confidence;
    const filterLabel = props.filterLabel;
    const setFilterLabel = props.setFilterLabel;

    const handleFilterChange = (newFilter) => {
        setFilterLabel(newFilter);
    };

    return (
        <React.Fragment>

            <Card
                style={{
                    overflow: "hidden",
                    marginTop: "0px",
                    border: "none",
                    boxShadow: "none",
                }}
            >
                <CardHeader
                    style={{border: "none", boxShadow: "none"}}
                    id="mentions_label"
                    className={"basicCardHeader"}
                >
                    Concept Filter
                </CardHeader>
                <CardBody
                    style={{border: "none", boxShadow: "none"}}
                    xs={12}
                    id="mentions_container"
                >
                    {/*not be used*/}
                    {/*<SearchPanel*/}
                    {/*    filteredConcepts={filteredConcepts}*/}
                    {/*    setFilteredConcepts={setFilteredConcepts*/}
                    {/*    }/>*/}
                    <SemanticGroupPanel
                        semanticGroups={semanticGroups}
                        handleSemanticGroupChange={handleSemanticGroupChange}
                        confidence={confidence}
                        concepts={concepts}
                    />
                </CardBody>
                <CardHeader
                    style={{border: "none", boxShadow: "none"}}
                    id="mentions_label"
                    className={"basicCardHeader"}
                    xs={12}
                >
                    {filterLabel}
                </CardHeader>
                <CardBody
                    style={{border: "none", boxShadow: "none"}}
                    xs={12}
                    id="mentions_container"
                >
                    <GridContainer>
                        <ConfidenceDataViz
                            handleConfidenceChange={handleConfidenceChange}
                            concepts={concepts}
                            doc={doc}
                            filterLabel={filterLabel}
                            setFilterLabel={setFilterLabel}
                            onFilterChange={handleFilterChange}
                        />
                    </GridContainer>
                    <GridContainer>
                        <ConfidencePanel/>
                    </GridContainer>
                    <Divider sx={{background: 'black', borderBottomWidth: 2}}/>
                    <GridContainer>
                        <SortPanel
                            filteredConcepts={filteredConcepts}
                            setFilteredConcepts={setFilteredConcepts}
                        />
                    </GridContainer>
                    {/*<GridContainer>*/}
                    {/*    <ListItem*/}
                    {/*        xs={12}*/}
                    {/*        style={{fontSize: "15px", backgroundColor: 'rgb(153, 230, 230)', marginTop:'10px',borderStyle: 'solid', borderColor: 'transparent', fontWeight: 'bold'}}*/}
                    {/*        class={"report_mentioned_term"} //deleted 'conceptListItem' no apparent use*/}
                    {/*    >*/}
                    {/*        Example (Document count,Patient count)*/}
                    {/*    </ListItem>*/}
                    {/*</GridContainer>*/}

                    <GridContainer direction="row" spacing={2}>
                        <GridItem>
                            <FormControlLabel
                                control={<Checkbox defaultChecked/>}
                                label="Document Mention Count"
                            />
                        </GridItem>
                        <GridItem>
                            <FormControlLabel
                                control={<Checkbox defaultChecked/>}
                                label="Patient Mention Count"
                            />
                        </GridItem>
                        <GridItem>
                            <FormControlLabel
                                control={<Checkbox defaultChecked/>}
                                label="Concept Confidence"
                            />
                        </GridItem>
                    </GridContainer>

                    <ConceptListPanel
                        doc={doc}
                        concepts={concepts}
                        mentions={mentions}
                        semanticGroups={semanticGroups}
                        confidence={confidence}
                        setFilteredConcepts={setFilteredConcepts}
                        filteredConcepts={filteredConcepts}
                        handleTermClick={props.handleTermClick}
                    />
                </CardBody>
            </Card>
        </React.Fragment>
    );
}
