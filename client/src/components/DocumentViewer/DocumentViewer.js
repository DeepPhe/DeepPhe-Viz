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
  const patientId = props.patientId;

  const [checkboxGridVisible, setCheckboxGridVisible] = useState(true);
  const patientDocument = props.patientDocument;
  const [factBasedReports, setFactBasedReports] = useState(
    props.factBasedReports
  );
  const reportId = props.reportId;
  const factId = props.factId;

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

  useEffect(() => {
    if (!isEmpty(patientDocument) && !isEmpty(reportId)) getReport();
  }, [patientDocument]);

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
    let factBasedTerms = [];
    if (
      Object.keys(factBasedReports).indexOf(reportId) !== -1 &&
      Object.keys(factBasedReports[reportId]).indexOf(factIdTemp) !== -1
    ) {
      factBasedTerms = factBasedReports[reportId][factIdTemp];
    }

    // mentionedTerms doesn't have position info, so we need to keep the posiiton info
    // for highlighting and scroll to
    let factBasedTermsWithPosition = [];
    let renderedMentionedTerms =
      '<ol id="mentions" class="mentioned_terms_list">';

    const mentionedTerms = patientDocument.mentions.sort((a, b) =>
      parseInt(a.begin) > parseInt(b.begin) ? 1 : -1
    );
    let textMentions = [];
    const uniqueArr = [];

    // Also scroll to the first fact based term if any in the report text
    if (factBasedTermsWithPosition.length > 0) {
      console.log("fix this");
      // scrollToHighlightedTextMention(
      //   factBasedTermsWithPosition[0],
      //   reportText,
      //   doc
      // );
    } else {
      let reportTextDiv = $("#report_text");
      //highlight all mentions
      //console.log(mentionedTerms);
      //textMentions = highlightAllMentions(mentionedTerms);

      const mentionCounter = {};

      mentionedTerms.forEach((obj) => {
        const text = obj.preferredText;
        if (mentionCounter[text]) {
          mentionCounter[text] += 1;
        } else {
          mentionCounter[text] = 1;
        }
        // obj.mentionFrequency = mentionCounter[obj.text.toString()];
      });

      mentionedTerms.forEach((obj) => {
        obj.mentionFrequency = mentionCounter[obj.preferredText];
      });

      // let highlightedReportText = highlightTextMentions(
      //   mentionedTerms,
      //   reportText
      // );
      //
      // reportTextDiv.html(highlightedReportText);
      // reportTextDiv.animate({ scrollTop: 0 }, "fast");
    }

    mentionedTerms.forEach(function (obj) {
      //console.log(JSON.stringify(obj))
      let fact_based_term_class = "";
      let popUp = "popUp";
      if (factBasedTerms.indexOf(obj.preferredText) !== -1) {
        factBasedTermsWithPosition.push(obj);
        fact_based_term_class = " fact_based_term";
      }
      // + 'highlight_terms' trying to add another class to the line, doesnt seem to work rn
      if (!uniqueArr.includes(obj.preferredText)) {
        uniqueArr.push(obj.preferredText);
        renderedMentionedTerms +=
          '<li class="report_mentioned_term' +
          fact_based_term_class +
          '" data-begin="' +
          obj.begin +
          '" data-end="' +
          obj.end +
          '">' +
          obj.preferredText +
          '<span class="frequency">' +
          "(" +
          obj.mentionFrequency +
          ")" +
          "</span></li>";
      }
    });
    renderedMentionedTerms += "</ol>";

    $("#report_mentioned_terms").html(renderedMentionedTerms);
  };
  if (isEmpty(reportId) || isEmpty(patientDocument)) {
    return <div>Loading...</div>;
  } else {
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
                      <GridContainer id="term_container2">
                        <GridItem
                          xs={4}
                          sm={4}
                          md={3}
                          id="mentions_container2"
                          className="mentions_container2"
                        >
                          <ConceptPanel
                            getCheckboxGridVisible={getCheckboxGridVisible}
                            setCheckboxGridVisible={setCheckboxGridVisible}
                            handleDropdownClick={handleDropdownClick}
                          />
                        </GridItem>
                        <GridItem
                          xs={4}
                          sm={4}
                          md={3}
                          id="mentions_container3"
                          className="ment_container"
                        >
                          <CardHeader
                            id="mentions_label"
                            className={"basicCardHeader"}
                          >
                            Concepts
                          </CardHeader>
                          <GridContainer>
                            <GridItem xs={12} id="mentions_container">
                              <div id="report_mentioned_terms"></div>
                            </GridItem>
                          </GridContainer>
                        </GridItem>
                      </GridContainer>
                      <DocumentPanel doc={patientDocument} />
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
}
