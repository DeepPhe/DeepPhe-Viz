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

  useEffect(() => {
    if (isEmpty(semanticGroups)) {
      getSemanticGroups();
    }
    console.log(filteredConcepts);
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
  const getRandomColor = (index) => {
    const colors = [
      "#FF6633",
      "#FFB399",
      "#FF33FF",
      "#FFFF99",
      "#00B3E6",
      "#E6B333",
      "#3366E6",
      "#999966",
      "#99FF99",
      "#B34D4D",
      "#80B300",
      "#809900",
      "#E6B3B3",
      "#6680B3",
      "#66991A",
      "#FF99E6",
      "#CCFF1A",
      "#FF1A66",
      "#E6331A",
      "#33FFCC",
      "#66994D",
      "#B366CC",
      "#4D8000",
      "#B33300",
      "#CC80CC",
      "#66664D",
      "#991AFF",
      "#E666FF",
      "#4DB3FF",
      "#1AB399",
      "#E666B3",
      "#33991A",
      "#CC9999",
      "#B3B31A",
      "#00E680",
      "#4D8066",
      "#809980",
      "#E6FF80",
      "#1AFF33",
      "#999933",
      "#FF3380",
      "#CCCC00",
      "#66E64D",
      "#4D80CC",
      "#9900B3",
      "#E64D66",
      "#4DB380",
      "#FF4D4D",
      "#99E6E6",
      "#6666FF",
    ];
    return colors[index];
  };

  const getSemanticGroups = () => {
    let groups = {};
    const uniqueConcepts = Array.from(
      new Set(concepts.map((c) => c.dpheGroup))
    );
    uniqueConcepts.map((group, index) => {
      groups[group] = {
        checked: true,
        color: getRandomColor(index),
        id: concepts.filter((c) => c.dpheGroup === group)[0].id,
      };
    });
    setSemanticGroups(groups);
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



    // Show rendered mentioned terms
    // First check if this report is a fact-based report so we cna highlight the fact-related terms

    // let highlightedReportText = highlightTextMentions(
    //   mentionedTerms,
    //   reportText
    // );
    //
    // reportTextDiv.html(highlightedReportText);
    // reportTextDiv.animate({ scrollTop: 0 }, "fast");
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
                {/*<div id="timeline" className="clearfix"></div>*/}
                {/*<div className="divider clearfix"></div>*/}
                {/*<div id="fact_detail"></div>*/}
                <GridItem xs={6} id="report_id">
                  <i className="fa fa-file-o"></i>
                  <span className="display_report_id currentReportCssClass current_displaying_report">
                    {reportId}
                  </span>
                </GridItem>
                <GridItem xs={6} id="zoom_controls">
                  <button id="zoom_in_btn" type="button">
                    <i className="fa  fa-search-plus"></i>
                  </button>
                  <button id="zoom_out_btn" type="button">
                    <i className="fa  fa-search-minus"></i>
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
                        />
                      </GridItem>
                    </GridContainer>
                  </GridItem>

                  <GridItem md={8} id="report_text">
                    <DocumentPanel
                      doc={patientDocument}
                      concepts={concepts}
                      semanticGroups={semanticGroups}
                      setFilteredConcepts={setFilteredConcepts}
                      filteredConcepts={filteredConcepts}
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
