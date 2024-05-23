import GridContainer from "../Grid/GridContainer";
import { SemanticGroupPanel } from "./SemanticGroupPanel";
import React, {useEffect, useState} from "react";
import CardHeader from "../Card/CardHeader";
import $ from "jquery";
import CardBody from "../Card/CardBody";
import Card from "../Card/Card";

import { ConfidencePanel } from "./ConfidencePanel";
import { SortPanel } from "./SortPanel";
import { SearchPanel } from "./SearchPanel";
import { ConceptListPanel } from "./ConceptListPanel";

export function ConceptPanel(props) {
  const concepts = props.concepts;
  const mentions = props.mentions;
  const factBasedReports = props.factBasedReports;
  const reportId = props.reportId;
  const factId = props.factId;
  const handleSemanticGroupChange = props.handleSemanticGroupChange;
  const semanticGroups = props.semanticGroups;
  const [confidence, setConfidence] = useState(0.5);
  const filteredConcepts = props.filteredConcepts;
  const setFilteredConcepts = props.setFilteredConcepts;

  $(document).on("input", "#confidenceRange", function () {
    let slider = document.getElementById("confidenceRange");
    let output = document.getElementById("confidenceValue");

    output.innerHTML = slider.value;

    slider.oninput = function () {
      output.innerHTML = this.value;
    };
  });

  const handleConfidenceChange = (e) => {
    setConfidence(e/100);
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
              style={{ border: "none", boxShadow: "none" }}
              id="mentions_label"
              className={"basicCardHeader"}
              // onClick={handleDropdownClick}
          >
            Concept Filter
          </CardHeader>
          <CardBody
              style={{ border: "none", boxShadow: "none" }}
              xs={12}
              id="mentions_container"
          >
            {/*<GridContainer sx={{ background: "red" }} spacing={1}>*/}
              <SearchPanel
                  filteredConcepts={filteredConcepts}
                  setFilteredConcepts={setFilteredConcepts
                  }/>
              <SemanticGroupPanel
                  semanticGroups={semanticGroups}
                  handleSemanticGroupChange={handleSemanticGroupChange}
              />
            {/*</GridContainer>*/}
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
              <GridContainer spacing={2}>
                <ConfidencePanel
                    handleConfidenceChange={handleConfidenceChange}
                />
                <SortPanel
                    filteredConcepts={filteredConcepts}
                    setFilteredConcepts={setFilteredConcepts}
                />
              </GridContainer>
            <ConceptListPanel
                concepts={concepts}
                mentions={mentions}
                semanticGroups={semanticGroups}
                confidence={confidence}
                setFilteredConcepts={setFilteredConcepts}
                filteredConcepts={filteredConcepts}
                handleTermClick={props.handleTermClick}
            />
          {/*</GridContainer>*/}
        </CardBody>
      </Card>
</React.Fragment>
);
}
