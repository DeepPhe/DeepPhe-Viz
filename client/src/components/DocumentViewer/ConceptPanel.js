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
import {Box, Tab, Tabs} from '@mui/material';


function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{p: 3}}>{children}</Box>}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

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

    // State for managing active tab
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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

                {/* Tabs Navigation */}
                <Box sx={{width: '100%'}}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="concept panel tabs">
                        <Tab label="Concepts" {...a11yProps(0)} />
                        <Tab label="Group Filter" {...a11yProps(1)} />
                        <Tab label="Confidence Filter" {...a11yProps(2)} />
                    </Tabs>


                    <TabPanel value={tabValue} index={1}>
                        <CardBody style={{border: "none", boxShadow: "none"}}>
                            <SemanticGroupPanel
                                semanticGroups={semanticGroups}
                                handleSemanticGroupChange={handleSemanticGroupChange}
                                confidence={confidence}
                                concepts={concepts}
                            />
                        </CardBody>
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <CardBody style={{border: "none", boxShadow: "none"}}>
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
                        </CardBody>
                    </TabPanel>

                    <TabPanel value={tabValue} index={0}>
                        <CardBody style={{border: "none", boxShadow: "none"}}>
                            {/*<Divider sx={{background: 'black', borderBottomWidth: 2}}/>*/}
                            {/*<GridContainer>*/}
                            {/*    <SortPanel*/}
                            {/*        filteredConcepts={filteredConcepts}*/}
                            {/*        setFilteredConcepts={setFilteredConcepts}*/}
                            {/*    />*/}
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
                    </TabPanel>
                </Box>
            </Card>

        </React.Fragment>
    );
}
