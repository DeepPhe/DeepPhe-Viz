import GridContainer from "../Grid/GridContainer";
import { SemanticGroupPanel } from "./SemanticGroupPanel";
import React from "react";
import CardHeader from "../Card/CardHeader";
import CardBody from "../Card/CardBody";
import Card from "../Card/Card";

import { ConfidencePanel } from "./ConfidencePanel";
import { SortPanel } from "./SortPanel";
import { SearchPanel } from "./SearchPanel";
import { ConceptListPanel } from "./ConceptListPanel";
import {ConfidenceDataViz} from "./ConfidenceDataViz";
import Divider from "@mui/material/Divider";

export function ConceptPanel(props) {
  const concepts = props.concepts;
  const mentions = props.mentions;
  // const factBasedReports = props.factBasedReports;
  // const reportId = props.reportId;
  // const factId = props.factId;
  const handleSemanticGroupChange = props.handleSemanticGroupChange;
  const handleConfidenceChange = props.handleConfidenceChange;
  const semanticGroups = props.semanticGroups;
  const filteredConcepts = props.filteredConcepts;
  const setFilteredConcepts = props.setFilteredConcepts;
  const confidence = props.confidence;

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
              style={{ border: "none", boxShadow: "none" }}
              id="mentions_label"
              className={"basicCardHeader"}
          >
            Concept Filter
          </CardHeader>
          <CardBody
              style={{ border: "none", boxShadow: "none" }}
              xs={12}
              id="mentions_container"
          >
              <SearchPanel
                  filteredConcepts={filteredConcepts}
                  setFilteredConcepts={setFilteredConcepts
                  }/>
              <SemanticGroupPanel
                  semanticGroups={semanticGroups}
                  handleSemanticGroupChange={handleSemanticGroupChange}
                  confidence={confidence}
                  filteredConcepts={filteredConcepts}
              />
          </CardBody>
          <CardHeader
              style={{border: "none", boxShadow: "none"}}
              id="mentions_label"
              className={"basicCardHeader"}
              xs={12}
          >
            Concepts
          </CardHeader>
          <CardBody
              style={{ border: "none", boxShadow: "none" }}
              xs={12}
              id="mentions_container"
          >
              <GridContainer>
                  <ConfidenceDataViz
                      handleConfidenceChange={handleConfidenceChange}
                      concepts={concepts}
                  />
              </GridContainer>
              <GridContainer>
                  <ConfidencePanel/>
              </GridContainer>
              <Divider sx={{ background: 'black', borderBottomWidth: 2 }} />
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
            <ConceptListPanel
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
