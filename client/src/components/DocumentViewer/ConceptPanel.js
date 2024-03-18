import GridContainer from "../Grid/GridContainer";
import { SemanticGroupPanel } from "./SemanticGroupPanel";
import React, {useState} from "react";
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
  $(document).on("input", "#confidenceRange", function () {
    // Declare variables
    let slider = document.getElementById("confidenceRange");
    let output = document.getElementById("confidenceValue");

    output.innerHTML = slider.value;

    slider.oninput = function () {
      output.innerHTML = this.value;
    };
  });

  const handleConfidenceChange = (e) => {
    setConfidence(e/100)
  };

  const checkboxGridVisible = props.getCheckboxGridVisible;
  const setCheckboxGridVisible = props.setCheckboxGridVisible;
  const handleDropdownClick = props.handleDropdownClick;
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
          onClick={handleDropdownClick}
        >
          Concept Filter
          {/*{checkboxGridVisible() ? (*/}
          {/*  <span>*/}
          {/*    <i className="caret-custom fa fa-caret-down fa-2x"></i>*/}
          {/*  </span>*/}
          {/*) : (*/}
          {/*  <span>*/}
          {/*    <i className="caret-custom fa fa-caret-up fa-2x"></i>*/}
          {/*  </span>*/}
          {/*)}*/}
        </CardHeader>
        <CardBody
          style={{ border: "none", boxShadow: "none" }}
          xs={12}
          id="mentions_container"
        >
          <GridContainer sx={{ background: "red" }} spacing={1}>
            <SearchPanel></SearchPanel>
            <SemanticGroupPanel
              getCheckboxGridVisible={checkboxGridVisible}
              setCheckboxGridVisible={setCheckboxGridVisible}
              handleDropdownClick={handleDropdownClick}
              semanticGroups={semanticGroups}
              handleSemanticGroupChange={handleSemanticGroupChange}
            />
            <ConfidencePanel
              handleConfidenceChange={handleConfidenceChange}
            />
            <SortPanel></SortPanel>
            <ConceptListPanel
              concepts={concepts}
              mentions={mentions}
              semanticGroups={semanticGroups}
              confidence={confidence}
            ></ConceptListPanel>
          </GridContainer>
        </CardBody>
      </Card>
    </React.Fragment>
  );
}
