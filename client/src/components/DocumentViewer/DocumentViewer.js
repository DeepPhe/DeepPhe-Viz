import GridContainer from "../Grid/GridContainer";
import GridItem from "../Grid/GridItem";
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader";
import CardBody from "../Card/CardBody";
import React, { useEffect, useState } from "react";
import { ConceptPanel } from "./ConceptPanel";
import { DocumentPanel } from "./DocumentPanel";
import $ from "jquery";

export function DocumentViewer(props) {
  const [checkboxGridVisible, setCheckboxGridVisible] = useState(true);
  const patientDocument = props.patientDocument;
  const factBasedReports = props.factBasedReports;
  const reportId = props.reportId;
  const factId = props.factId;
  const concepts = props.concepts;
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [semanticGroups, setSemanticGroups] = useState({});
  const [fontSize, setFontSize] = useState(12);
  // const clickedTerm = props.clickedTerm;
  const [clickedTerm, setClickedTerm] = useState("");

  useEffect(() => {
    if (isEmpty(semanticGroups)) { //It's something here that i need to fix
      getSemanticGroups();
    }
    // else ()
  }, [semanticGroups,filteredConcepts]);

  function isEmpty(obj) {
    for (const i in obj) return false;
    return true;
  }

  // define a tree structure for semantic groups where the root node is the general topic of the
  // concepts and the children are the subtopics of the concept
  // start with 50% transparency and all black fonts !!!!
  // https://sashamaps.net/docs/resources/20-colors/
  // https://colorbrewer2.org/#type=qualitative&scheme=Paired&n=12
  const semanticGroupColorDict = (key, whichValue) => {
    let colorDict = {
      "Behavior": ["#ff8712", 4],
      "Disease Stage Qualifier" : ["#ef7c0c", 0],
      "Disease Grade Qualifier" : ["#ffa247", 1],
      "Body Fluid or Substance": ["#add8e6", 9],
      "Body Part": ["#99E6E6", 12],
      "Chemo/immuno/hormone Therapy Regimen": ["#f74a83", 26],
      "Clinical Test Result": ["#ffadc1", 14],
      "Clinical Course of Disease": ["#e5d815",19],
      "Disease or Disorder": ["#7fce94", 16],
      "Disease Qualifier" : ["#ffdb00", 21],
      "Finding" : ["#ffbcdd", 13],
      "Gene" : ["#ff9ea4", 15],
      "General Qualifier" : ["#ffbf00", 23],
      "Generic TNM Finding" : ["#ff9731", 2],
      "Intervention or Procedure" : ["#f74a6b", 27],
      "Imaging Device" : ["#785ef0", 12],
      "Lymph Node" : ["#bfefff", 7],
      "Temporal Qualifier" : ["#ffab00", 24],
      "Tissue": ["#b2dfee", 8],
      "Mass" : ["#a8ffc0", 18],
      "Neoplasm" : ["#96e7ac", 17],
      "Pathologic Process" : ["#ffef00", 20],
      "Pathological TNM Finding" : ["#ff8e20", 3],
      "Pharmacologic Substance" : ["#f74aa1", 25],
      "Position" : ["#CC9999", 28],
      "Property or Attribute" : ["#ffc700", 22],
      "Quantitative Concept" : ["#33991A", 29],
      "Side" : ["#93ccea", 10],
      "Spatial Qualifier": ["#9ac0cd", 11],
      "Severity" : ["#ff7e00", 5],
      "Unknown" : ["#808080", 30]
    };

    if (key in colorDict && whichValue === "color") {
      return colorDict[key][0];
    }
    if (key in colorDict && whichValue === "order"){
      return colorDict[key][1];
    }
    else {
      return "Key '" + key + "' not found in the dictionary";
    }
  }

  const getSemanticGroups = () => {
    let groups = {};
    const uniqueConcepts = Array.from(
      new Set(concepts.map((c) => c.dpheGroup))
    );
    uniqueConcepts.map((group, index) => {
      groups[group] = {
        checked: true,
        backgroundColor: semanticGroupColorDict(group, "color"),
        order: semanticGroupColorDict(group, "order"),
        id: concepts.filter((c) => c.dpheGroup === group)[0].id,
      };
    });
    // Convert the map to an array of key-value pairs
    const entries = Object.entries(groups);

    // Sort the array based on the "order" value
    entries.sort((a, b) => a[1].order - b[1].order);

    // If you want the sorted result as a map, you can convert it back
    const sortedMap = new Map(entries);

    const sortedObject = Object.fromEntries(sortedMap);
    setSemanticGroups(sortedObject);
  };

  const handleSemanticGroupChange = (group, checked) => {
    let groups = {...semanticGroups};
    groups[group].checked = checked;
    setSemanticGroups(groups);
  };

  const handleDropdownClick = () => {
    setCheckboxGridVisible((prevState) => {
      return !prevState;
    });
  };
  const getCheckboxGridVisible = () => {
    return checkboxGridVisible;
  };


  const handleTermClick = (e) => {
    setClickedTerm(e.target.dataset.id);
  }

  const zoomClick = (e) => {
    let value = 0;
    if(e.target.classList.contains('zoom-in')){
      value = 1;
    }
    else{
      value = -1;
    }
    setFontSize(fontSize + value);
  };

  const getReport = () => {
    const factIdTemp = "";
    // If there are fact based reports, highlight the displaying one
    const currentReportCssClass = "current_displaying_report";
    const currentFactTermsCssClass = "fact_based_term";
    $(".fact_based_report_id").removeClass(currentReportCssClass);
    $(".fact_based_term_span").removeClass(currentFactTermsCssClass);

    // Highlight the curent displaying report name
    $("#" + reportId + "_" + factIdTemp).addClass(currentReportCssClass);
    // Also highlight all the fact-based text mentions in the fact info area
    $("#terms_list_" + reportId + "_" + factIdTemp)
      .children()
      .find(">:first-child")
      .addClass(currentFactTermsCssClass);
  };

  if (isEmpty(semanticGroups)) {
    return "Loading...";
  } else {
    getReport();
    return (
      <Card id={"docs"}>
        <CardHeader className={"basicCardHeader"}>
          Documents Related to Selected Cancer/Tumor Detail
        </CardHeader>
        <CardBody>
          <div id="report_instance">
            <GridItem className="report_section clearfix">
              <GridContainer>
                <GridItem xs={6} id="report_id">
                  <i className="fa fa-file-o"></i>
                  <span className="display_report_id currentReportCssClass current_displaying_report">
                    {reportId}
                  </span>
                </GridItem>
                <GridItem xs={6} id="zoom_controls">
                  <button id="zoom_in_btn" className={"zoom-in"} type="button" onClick={(e) => {zoomClick(e)}}>
                    <i className="fa fa-search-plus zoom-in"></i>
                  </button>
                  <button id="zoom_out_btn" className={"zoom-out"} type="button" onClick={(e) => {zoomClick(e)}}>
                    <i className="fa fa-search-minus zoom-out"></i>
                  </button>
                </GridItem>
                <GridContainer id="term_and_report_container">
                  <GridItem
                    style={{ border: "none" }}
                    md={4}
                    id="mentions_container"
                    className="mentions_container"
                  >
                    <GridContainer id="term_container2">
                      <GridItem
                        md={2}
                        id="mentions_container2"
                        className="mentions_container2"
                      >
                        <ConceptPanel
                          mentions={patientDocument.mentions}
                          concepts={concepts}
                          getCheckboxGridVisible={getCheckboxGridVisible}
                          setCheckboxGridVisible={setCheckboxGridVisible}
                          handleDropdownClick={handleDropdownClick}
                          semanticGroups={semanticGroups}
                          handleSemanticGroupChange={handleSemanticGroupChange}
                          setFilteredConcepts={setFilteredConcepts}
                          filteredConcepts={filteredConcepts}
                          handleTermClick={handleTermClick}
                        />
                      </GridItem>
                    </GridContainer>
                  </GridItem>

                  <GridItem md={8} id="report_text">
                    <DocumentPanel
                      doc={patientDocument}
                      concepts={concepts}
                      semanticGroups={semanticGroups}
                      handleSemanticGroupChange={handleSemanticGroupChange}
                      setFilteredConcepts={setFilteredConcepts}
                      filteredConcepts={filteredConcepts}
                      fontSize={fontSize}
                      clickedTerm={clickedTerm}
                    />
                  </GridItem>
                </GridContainer>
              </GridContainer>
            </GridItem>
          </div>
        </CardBody>
      </Card>
    );
  }
}
