import GridContainer from "../Grid/GridContainer";
import GridItem from "../Grid/GridItem";
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader";
import CardBody from "../Card/CardBody";
import React, { useEffect, useState } from "react";
import { ConceptPanel } from "./ConceptPanel";
import { DocumentPanel } from "./DocumentPanel";
import $ from "jquery";
import SplitPane from "react-split-pane";



export function DocumentViewer(props) {
  const [checkboxGridVisible, setCheckboxGridVisible] = useState(true);
  const patientDocument = props.patientDocument;
  const factBasedReports = props.factBasedReports;
  const reportId = props.reportId;
  const factId = props.factId;
  const concepts = props.concepts;
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [semanticGroups, setSemanticGroups] = useState({});
  const [fontSize, setFontSize] = useState(15);
  const [confidence, setConfidence] = useState(0);
  // const clickedTerm = props.clickedTerm;
  const [clickedTerm, setClickedTerm] = useState("");
  const [filterLabel, setFilterLabel] = useState("Concepts");

  useEffect(() => {
    if (isEmpty(semanticGroups)) { //It's something here that i need to fix
      getSemanticGroups();
    }
    // else ()
  }, [semanticGroups,filteredConcepts, setFilteredConcepts]);


  const handleConfidenceChange = (e) => {
    setConfidence(e/100);
  };


  function isEmpty(obj) {
    for (const i in obj) return false;
    return true;
  }

  //TODO WORD ON THIS LATER: TREENODE PROJECT

  class TreeNode {
    constructor(concept, color = null) {
      this.concept = concept; // Concept or topic name
      this.color = color; // Associated color (optional)
      this.subtopics = []; // Array to hold subtopics (children nodes)
    }

    // Method to add a subtopic with an optional color
    addSubtopic(subtopicNode) {
      this.subtopics.push(subtopicNode);
    }

    // Method to print the tree structure with concept, subtopics, and associated colors
    print(indent = 0) {
      const colorText = this.color ? ` (Color: ${this.color})` : ''; // Show color if available
      console.log(" ".repeat(indent) + this.concept + colorText); // Print concept and color
      this.subtopics.forEach(subtopic => subtopic.print(indent + 2)); // Recursively print subtopics
    }
  }

  const semanticRoot = new TreeNode('')

  const anatomyRoot= new TreeNode('Anatomy');
  const deviceRoot = new TreeNode('Device');


  // Anatomy
  anatomyRoot.addSubtopic(new TreeNode('Body Part', '#99E6E6'));
  anatomyRoot.addSubtopic(new TreeNode('Lymph Node', '#bfefff'));

  // Device
  deviceRoot.addSubtopic(new TreeNode('Imaging Device', '#785ef0'));

  // Print the entire concept tree
//   anatomyRoot.print();
//   deviceRoot.print();


  //TODO WORD ON THIS LATER: TREENODE PROJECT



  const semanticGroupColorDict = (key, whichValue) => {
    let colorDict = {
      "Behavior": ["#ff8712", 4],
      "Disease Stage Qualifier" : ["#ef7c0c", 0],
      "Disease Grade Qualifier" : ["#ffa247", 1],
      "Body Fluid or Substance": ["#add8e6", 9],
      "Body Part": ["#99E6E6", 12],
      "Chemo/immuno/hormone Therapy Regimen": ["#da9cf5", 26],
      "Clinical Test Result": ["#ffadc1", 14],
      "Clinical Course of Disease": ["#e5d815",19],
      "Disease or Disorder": ["#7fce94", 16],
      "Disease Qualifier" : ["#ffdb00", 21],
      "Finding" : ["#ffbcdd", 13],
      "Gene" : ["#ff9ea4", 15],
      "Gene Product" : ["#ff9ea4", 15.1],
      "General Qualifier" : ["#ffbf00", 23],
      "Generic TNM Finding" : ["#ff9731", 2],
      "Intervention or Procedure" : ["#ca99f4", 27],
      "Imaging Device" : ["#785ef0", 12],
      "Lymph Node" : ["#bfefff", 7],
      "Temporal Qualifier" : ["#ffab00", 24],
      "Tissue": ["#b2dfee", 8],
      "Mass" : ["#a8ffc0", 18],
      "Neoplasm" : ["#96e7ac", 17],
      "Pathologic Process" : ["#ffef00", 20],
      "Pathologic TNM Finding" : ["#ff8e20", 3],
      "Pharmacologic Substance" : ["#b36cef", 25],
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

    const previouslyClickedElement = document.querySelector('.border-highlight');
    if (previouslyClickedElement) {
      previouslyClickedElement.classList.remove('border-highlight');
    }
    //Clicking the highlighted concept again will get rid of the highlight
    if(clickedTerm === e.target.dataset.id){
      setClickedTerm("");
    }
    else{
      setClickedTerm(e.target.dataset.id);

      e.target.classList.add('border-highlight');
    }
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
        <GridItem
            xs={3}
            id="report_id"
        >
          <div>
            <i className="fa fa-file-o"></i>
            <span className="display_report_id currentReportCssClass current_displaying_report">
                {reportId}
            </span>
          </div>
        </GridItem>
        <CardBody style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: 0, margin: 0 }}>
          <div id="report_instance" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/*<GridItem className="report_section clearfix" style={{ flexGrow: 1 }}>*/}
            {/*  <GridContainer style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, margin: 0 }}>*/}
                {/* Top Section (ID and Zoom Controls) */}
            {/*    <GridItem xs={12} id="report_id" style={{height: '50px', display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', margin: 0 }}>*/}
            {/*      <div>*/}
            {/*        <i className="fa fa-file-o"></i>*/}
            {/*        <span className="display_report_id currentReportCssClass current_displaying_report">*/}
            {/*  {reportId}*/}
            {/*</span>*/}
            {/*      /!*</div>*!/*/}
            {/*      /!*<div id="zoom_controls">*!/*/}
            {/*      /!*  <button id="zoom_in_btn" className={"zoom-in"} type="button" onClick={(e) => zoomClick(e)}>*!/*/}
            {/*      /!*    <i className="fa fa-search-plus zoom-in"></i>*!/*/}
            {/*      /!*  </button>*!/*/}
            {/*      /!*  <button id="zoom_out_btn" className={"zoom-out"} type="button" onClick={(e) => zoomClick(e)}>*!/*/}
            {/*      /!*    <i className="fa fa-search-minus zoom-out"></i>*!/*/}
            {/*      /!*  </button>*!/*/}
            {/*      </div>*/}
            {/*    </GridItem>*/}

                {/* SplitPane for Resizable Content */}
                <SplitPane split="vertical" minSize={500} maxSize={-650} defaultSize="33%" style={{ flexGrow: 1, display: 'flex', height: '100%', margin: 0, padding: 0 }}>
                  {/* Left Panel - Mentions Container */}
                  <GridItem md={4} id="mentions_container" className="mentions_container" style={{ height: '100%',
                    overflow: 'auto', backgroundColor: '#f0f0f0', margin: 0, padding: 0, display: 'flex',
                    flexDirection: 'column', maxWidth: 'none', direction: 'rtl'}}>
                    <GridContainer id="term_container2" style={{ height: '100%', margin: 0, padding: 0, flexGrow: 1, direction: 'ltr'}}>
                      <GridItem md={12} id="mentions_container2" className="mentions_container2" style={{ margin: 0, padding: 0 }}>
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
                            handleConfidenceChange={handleConfidenceChange}
                            confidence={confidence}
                            doc={patientDocument}
                            filterLabel={filterLabel}
                            setFilterLabel={setFilterLabel}
                        />
                      </GridItem>
                    </GridContainer>
                  </GridItem>

                  {/* Right Panel - Document View */}
                  <GridItem md={8} id="report_text" style={{ height: '100%', overflow: 'auto', backgroundColor: '#ffffff', margin: 0, padding: 0, maxWidth: 'none' }}>
                    <DocumentPanel
                        doc={patientDocument}
                        concepts={concepts}
                        semanticGroups={semanticGroups}
                        handleSemanticGroupChange={handleSemanticGroupChange}
                        setFilteredConcepts={setFilteredConcepts}
                        filteredConcepts={filteredConcepts}
                        fontSize={fontSize}
                        clickedTerm={clickedTerm}
                        confidence={confidence}
                        filterLabel={filterLabel}
                        setFilterLabel={setFilterLabel}
                    />
                  </GridItem>
                </SplitPane>
            {/*  </GridContainer>*/}
            {/*</GridItem>*/}
          </div>
        </CardBody>
      </Card>
    );
  }
}
