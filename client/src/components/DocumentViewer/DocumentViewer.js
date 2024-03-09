import GridContainer from "../Grid/GridContainer";
import GridItem from "../Grid/GridItem";
import Card from "../Card/Card";
import CardHeader from "../Card/CardHeader";
import CardBody from "../Card/CardBody";
import React, { useState } from "react";
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

  function isEmpty(obj) {
    for (const i in obj) return false;
    return true;
  }

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

    // Show report ID
    $("#report_id").html(
      '<i class="fa fa-file-o"></i><span class="display_report_id ' +
        currentReportCssClass +
        '">' +
        reportId +
        "</span>"
    );

    // Show rendered mentioned terms
    // First check if this report is a fact-based report so we cna highlight the fact-related terms

      // let highlightedReportText = highlightTextMentions(
      //   mentionedTerms,
      //   reportText
      // );
      //
      // reportTextDiv.html(highlightedReportText);
      // reportTextDiv.animate({ scrollTop: 0 }, "fast");
    }

    getReport();
  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={1} />
      <GridItem xs={12} sm={12} md={10}>
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
                  <GridItem xs={6} id="report_id"></GridItem>
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
                          />
                        </GridItem>
                      </GridContainer>
                    </GridItem>

                    <GridItem md={6} id="report_text">
                      <DocumentPanel doc={patientDocument}
                      concepts={concepts}/>
                    </GridItem>
                  </GridContainer>
                </GridContainer>
              </GridItem>
            </div>
          </CardBody>
        </Card>
      </GridItem>
      <GridItem xs={12} sm={12} md={1} />
    </GridContainer>
  );
}
