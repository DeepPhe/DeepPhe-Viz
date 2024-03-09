import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import * as d3 from "d3v4";
import CustomTable from "../../components/CustomTables/CustomTable";
import CancerAndTumorSummary from "../../components/Summaries/CancerAndTumorSummary";
import Timeline from "../../components/Charts/Timeline";
import $ from "jquery";
import CardHeader from "../../components/Card/CardHeader";
import { Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { DocumentViewer } from "../../components/DocumentViewer/DocumentViewer";

const baseUri = "http://localhost:3001/api";
let initialHighlightedDoc = "";
let reportTextRight = "";

function Patient(props) {
  const { patientId } = useParams();
  const [summary, setSummary] = useState({});
  const [patientDocument, setPatientDocument] = useState({});
  const [patientJson, setPatientJson] = useState({});
  const [patientConcepts, setPatientConcepts] = useState([]);
  const [dpheGroups, setDpheGroups] = useState([]);
  const [reportId, setReportId] = useState({});
  const [factId, setFactId] = useState({});

  function getNewPatientJsonFromFile() {
    return new Promise((resolve, reject) => {
      fetch("../../../docs/fake_patient1.json").then((v) => {
        v.json().then((json) => {
          resolve(json);
        });
      });
    });
  }

  // Highlight the selected report circle
  function highlightReportBasedOnFact(reportId) {
    d3.select("#main_" + reportId).classed("fact_highlighted_report", true);
  }

  let factBasedReports = {};

  // function highlightTextMentions(textMentions, reportText, term = "NONE") {
  //   const cssClass = "highlighted_term";
  //   const cssClassAll = "highlight_terms";
  //
  //   // Flatten the ranges, this is the key to solve overlapping
  //   textMentions = flattenRanges(textMentions);
  //   // console.log(textMentions);
  //
  //   let textFragments = [];
  //   let lastValidTMIndex = 0;
  //
  //   for (let i = 0; i < textMentions.length; i++) {
  //     let textMention = textMentions[i];
  //     let lastValidTM = textMentions[lastValidTMIndex];
  //
  //     // If this is the first textmention, paste the start of the document before the first TM.
  //     if (i === 0) {
  //       if (textMention.begin === 0) {
  //         textFragments.push("");
  //       } else {
  //         textFragments.push(reportText.substring(0, textMention.begin));
  //       }
  //     } else {
  //       // Otherwise, check if this text mention is valid. if it is, paste the text from last valid TM to this one.
  //       if (parseInt(textMention.begin) <= parseInt(lastValidTM.end)) {
  //         lastValidTMIndex = i;
  //       } else {
  //         textFragments.push(
  //           reportText.substring(lastValidTM.end, textMention.begin)
  //         );
  //       }
  //     }
  //     console.log(term.slice(0, -3));
  //     //TODO: FIX this later, Need to get text without the mentionFrequency on it
  //     let correctTerm = term.slice(0, -3);
  //     if (textMention.preferredText.indexOf(term) > -1) {
  //       console.log("reached?");
  //       textFragments.push(
  //         '<span class="' +
  //           cssClass +
  //           '">' +
  //           reportText.substring(textMention.begin, textMention.end) +
  //           "</span>"
  //       );
  //     } else {
  //       textFragments.push(
  //         '<span class="' +
  //           cssClassAll +
  //           '">' +
  //           reportText.substring(textMention.begin, textMention.end) +
  //           "</span>"
  //       );
  //     }
  //
  //     lastValidTMIndex = i;
  //   }
  //   // Push end of the document
  //   textFragments.push(
  //     reportText.substring(textMentions[lastValidTMIndex].end)
  //   );
  //
  //   // Assemble the final report content with highlighted texts
  //   let highlightedReportText = "";
  //
  //   for (let j = 0; j < textFragments.length; j++) {
  //     highlightedReportText += textFragments[j];
  //   }
  //   // const e = new Event("change");
  //   // const element = document.querySelector('input[type=radio][name="sort_order"]');
  //   // element.dispatchEvent(e);
  //
  //   return highlightedReportText;
  // }

  const variablesObj = {
    topography_major: {
      visible: false,
      value: "",
      bgcolor: "#cfe2ff",
      mentions: [],
    },
    topography_minor: {
      visible: false,
      value: "",
      bgcolor: "#cfe2ff",
      mentions: [],
    },
    topography: {
      visible: true,
      value: "",
      bgcolor: "#cfe2ff",
      mentions: [],
    },
    histology: {
      visible: false,
      value: "",
      bgcolor: "#f8d7da",
      mentions: [],
    },
    behavior: {
      visible: false,
      value: "",
      bgcolor: "#f8d7da",
      mentions: [],
    },
    morphology: {
      visible: true,
      value: "",
      bgcolor: "#f8d7da",
      mentions: [],
    },
    laterality: {
      visible: true,
      value: "",
      bgcolor: "#ffe69c",
      mentions: [],
    },
    grade: {
      visible: true,
      value: "",
      bgcolor: "#a3cfbb",
      mentions: [],
    },
  };

  //WILL USE THIS LATER
  function buildColorDistribution(textMention) {
    let colorDistribution = [];
    let increment = (100 / textMention.count).toFixed(2);

    for (let i = 0; i < textMention.count; i++) {
      let bgcolor = "highlight_terms";
      let start = i > 0 ? i * increment + "%" : 0;
      let finish =
        i < textMention.count - 1 ? (i + 1) * increment + "%" : "100%";
      colorDistribution.push(bgcolor + " " + start);
      colorDistribution.push(bgcolor + " " + finish);
    }

    return colorDistribution;
  }

  //Function by Zhoe, helps with overlapping highlight mentions

  // // function flattenRanges(ranges) {
  // //   // console.log("======input ranges======");
  // //   // console.log(ranges);
  // //
  // //   let points = [];
  // //   let flattened = [];
  // //   for (let i in ranges) {
  // //     if (ranges[i].end < ranges[i].begin) {
  // //       //RE-ORDER THIS ITEM (BEGIN/END)
  // //       let tmp = ranges[i].end; //RE-ORDER BY SWAPPING
  // //       ranges[i].end = ranges[i].begin;
  // //       ranges[i].begin = tmp;
  // //     }
  // //     points.push(ranges[i].begin);
  // //     points.push(ranges[i].end);
  // //   }
  // //   // console.log("points: ", points);
  // //
  // //   //MAKE SURE OUR LIST OF POINTS IS IN ORDER
  // //   //COMMENT THIS OUT LATER
  // //   points.sort(function (a, b) {
  // //     return a - b;
  // //   });
  //   // console.log("sorted points: ", points);
  //
  //   // FIND THE INTERSECTING SPANS FOR EACH PAIR OF POINTS (IF ANY)
  //   // ALSO MERGE THE ATTRIBUTES OF EACH INTERSECTING SPAN, AND INCREASE THE COUNT FOR EACH INTERSECTION
  //   for (let i in points) {
  //     if (i === 0 || points[i] === points[i - 1]) continue;
  //     let includedRanges = ranges.filter(function (x) {
  //       return Math.max(x.begin, points[i - 1]) < Math.min(x.end, points[i]);
  //     });
  //     //console.log(includedRanges);
  //
  //     if (includedRanges.length > 0) {
  //       let flattenedRange = {
  //         begin: points[i - 1],
  //         end: points[i],
  //         count: 0,
  //       };
  //
  //       for (let j in includedRanges) {
  //         //console.log(includedRanges[j]);
  //         let includedRange = includedRanges[j];
  //
  //         for (let prop in includedRange) {
  //           if (prop !== "begin" && prop !== "end") {
  //             if (!flattenedRange[prop]) flattenedRange[prop] = [];
  //             flattenedRange[prop].push(includedRange[prop]);
  //           }
  //         }
  //
  //         flattenedRange.count++;
  //       }
  //
  //       flattened.push(flattenedRange);
  //     }
  //   }
  //
  //   // console.log("======flattened ranges======");
  //   // console.log(flattened);
  //
  //   return flattened;
  // }

  // const getReport = (reportId, factId, patientJson) => {
  //   const index = patientJson["documents"].findIndex(
  //     (doc) => doc.id === reportId
  //   );
  //   const doc = patientJson["documents"][3];
  //   setPatientDocument(doc);
  //   let handleTermClick = (e) => {
  //     let obj = {};
  //     const indexOfLastParenthesis = e.target.textContent.lastIndexOf("(");
  //     obj.term = e.target.textContent.slice(0, indexOfLastParenthesis);
  //     obj.begin = e.target.getAttribute("data-begin");
  //     obj.end = e.target.getAttribute("data-end");
  //
  //     scrollToHighlightedTextMention(obj, doc);
  //   };
  //
  //   $(document).on("click", ".report_mentioned_term", handleTermClick);
  //   let reportText = doc.text;
  //
  //   // console.log(reportText);
  //   let mentionedTerms = doc.mentions;
  //
  //   // If there are fact based reports, highlight the displaying one
  //   const currentReportCssClass = "current_displaying_report";
  //   const currentFactTermsCssClass = "fact_based_term";
  //   $(".fact_based_report_id").removeClass(currentReportCssClass);
  //   $(".fact_based_term_span").removeClass(currentFactTermsCssClass);
  //
  //   // Highlight the curent displaying report name
  //   $("#" + reportId + "_" + factId).addClass(currentReportCssClass);
  //   // Also highlight all the fact-based text mentions in the fact info area
  //   $("#terms_list_" + reportId + "_" + factId)
  //     .children()
  //     .find(">:first-child")
  //     .addClass(currentFactTermsCssClass);
  //
  //   // Show report ID
  //   $("#report_id").html(
  //     '<i class="fa fa-file-o"></i><span class="display_report_id ' +
  //       currentReportCssClass +
  //       '">' +
  //       reportId +
  //       "</span>"
  //   );
  //
  //   // Show rendered mentioned terms
  //   // First check if this report is a fact-based report so we cna highlight the fact-related terms
  //   let factBasedTerms = [];
  //   if (
  //     Object.keys(factBasedReports).indexOf(reportId) !== -1 &&
  //     Object.keys(factBasedReports[reportId]).indexOf(factId) !== -1
  //   ) {
  //     factBasedTerms = factBasedReports[reportId][factId];
  //   }
  //
  //   // mentionedTerms doesn't have position info, so we need to keep the posiiton info
  //   // for highlighting and scroll to
  //   let factBasedTermsWithPosition = [];
  //   let renderedMentionedTerms =
  //     '<ol id="mentions" class="mentioned_terms_list">';
  //
  //   console.log(mentionedTerms.map((obj) => obj.dpheGroup))
  //   mentionedTerms = mentionedTerms.sort((a, b) =>
  //     parseInt(a.begin) > parseInt(b.begin) ? 1 : -1
  //   );
  //   let textMentions = [];
  //   const uniqueArr = [];
  //
  //   // Also scroll to the first fact based term if any in the report text
  //   if (factBasedTermsWithPosition.length > 0) {
  //     scrollToHighlightedTextMention(
  //       factBasedTermsWithPosition[0],
  //       reportText,
  //       doc
  //     );
  //   } else {
  //     let reportTextDiv = $("#report_text");
  //     //highlight all mentions
  //     //console.log(mentionedTerms);
  //     //textMentions = highlightAllMentions(mentionedTerms);
  //
  //     const mentionCounter = {};
  //
  //     mentionedTerms.forEach((obj) => {
  //       const text = obj.preferredText;
  //       if (mentionCounter[text]) {
  //         mentionCounter[text] += 1;
  //       } else {
  //         mentionCounter[text] = 1;
  //       }
  //       // obj.mentionFrequency = mentionCounter[obj.text.toString()];
  //     });
  //
  //     mentionedTerms.forEach((obj) => {
  //       obj.mentionFrequency = mentionCounter[obj.preferredText];
  //     });
  //
  //     let highlightedReportText = highlightTextMentions(
  //       mentionedTerms,
  //       reportText
  //     );
  //
  //     initialHighlightedDoc = highlightedReportText;
  //     reportTextDiv.html(highlightedReportText);
  //
  //     reportTextDiv.animate({ scrollTop: 0 }, "fast");
  //     reportTextRight = $("#report_text").innerText;
  //   }
  //
  //   mentionedTerms.forEach(function (obj) {
  //     //console.log(JSON.stringify(obj))
  //     let fact_based_term_class = "";
  //     let popUp = "popUp";
  //     if (factBasedTerms.indexOf(obj.preferredText) !== -1) {
  //       factBasedTermsWithPosition.push(obj);
  //       fact_based_term_class = " fact_based_term";
  //     }
  //     // + 'highlight_terms' trying to add another class to the line, doesnt seem to work rn
  //     if (!uniqueArr.includes(obj.preferredText)) {
  //       uniqueArr.push(obj.preferredText);
  //       renderedMentionedTerms +=
  //         '<li class="report_mentioned_term' +
  //         fact_based_term_class +
  //         '" data-begin="' +
  //         obj.begin +
  //         '" data-end="' +
  //         obj.end +
  //         '">' +
  //         obj.preferredText +
  //         '<span class="frequency">' +
  //         "(" +
  //         obj.mentionFrequency +
  //         ")" +
  //         "</span></li>";
  //     }
  //   });
  //   renderedMentionedTerms += "</ol>";
  //
  //   $("#report_mentioned_terms").html(renderedMentionedTerms);
  // };

  //Dennis good version

  // function getReport(reportId, factId) {
  //     $("#docs").show();
  //     // Must use encodeURIComponent() otherwise may have URI parsing issue
  //     $.ajax({
  //         url: baseUri + '/reports/' + reportId,
  //         method: 'GET',
  //         async: true,
  //         dataType: 'json'
  //     })
  //         .done(function (response) {
  //
  //             let reportText = response.reportText;
  //             mentionedTerms = response.mentionedTerms;
  //
  //             // If there are fact based reports, highlight the displaying one
  //             const currentReportCssClass = 'current_displaying_report';
  //             const currentFactTermsCssClass = 'fact_based_term';
  //             $('.fact_based_report_id').removeClass(currentReportCssClass);
  //             $('.fact_based_term_span').removeClass(currentFactTermsCssClass);
  //
  //             // Highlight the curent displaying report name
  //             $('#' + reportId + "_" + factId).addClass(currentReportCssClass);
  //             // Also highlight all the fact-based text mentions in the fact info area
  //             $('#terms_list_' + reportId + "_" + factId).children().find(">:first-child").addClass(currentFactTermsCssClass);
  //
  //             // Show report ID
  //             $('#report_id').html('<i class="fa fa-file-o"></i><span class="display_report_id ' + currentReportCssClass + '">' + reportId + '</span>');
  //
  //             // Show rendered mentioned terms
  //             // First check if this report is a fact-based report so we cna highlight the fact-related terms
  //             let factBasedTerms = [];
  //             if (Object.keys(factBasedReports).indexOf(reportId) !== -1 && Object.keys(factBasedReports[reportId]).indexOf(factId) !== -1) {
  //                 factBasedTerms = factBasedReports[reportId][factId];
  //             }
  //
  //             // mentionedTerms doesn't have position info, so we need to keep the posiiton info
  //             // for highlighting and scroll to
  //             let factBasedTermsWithPosition = [];
  //             let renderedMentionedTerms = '<ol id="mentions" class="mentioned_terms_list">';
  //             mentionedTerms = mentionedTerms.sort((a, b) => (parseInt(a.begin) > parseInt(b.begin)) ? 1 : -1)
  //             let textMentions = [];
  //             mentionedTerms.forEach(function (obj) {
  //                 //console.log(JSON.stringify(obj))
  //                 let fact_based_term_class = '';
  //                 if (factBasedTerms.indexOf(obj.term) !== -1) {
  //                     factBasedTermsWithPosition.push(obj);
  //                     fact_based_term_class = ' fact_based_term';
  //                 }
  //                 // + 'highlight_terms' trying to add another class to the line, doesnt seem to work rn
  //                 renderedMentionedTerms += '<li class="report_mentioned_term' + fact_based_term_class + '" data-begin="' + obj.begin + '" data-end="' + obj.end + '">' + obj.term + '</li>';
  //             });
  //             renderedMentionedTerms += "</ol>";
  //
  //             $('#report_mentioned_terms').html(renderedMentionedTerms);
  //             // sortMentions("occurrence");
  //             // viewMentions("stack");
  //
  //             // Also scroll to the first fact based term if any in the report text
  //             if (factBasedTermsWithPosition.length > 0) {
  //                 scrollToHighlightedTextMention(factBasedTermsWithPosition[0], reportText);
  //             } else {
  //                 let reportTextDiv = $("#report_text");
  //
  //                 let highlightedReportText = highlightTextMentions(textMentions, reportText);
  //
  //                 console.log("YO");
  //                 initialHighlightedDoc = highlightedReportText;
  //                 reportTextDiv.html(highlightedReportText);
  //
  //                 reportTextDiv.animate({scrollTop: 0}, "fast");
  //             }
  //         })
  //         .fail(function () {
  //             console.log("Ajax error - can't get report");
  //         });
  // }

  const getDocumentViewer = (
    patientId,
    reportId,
    factId,
    factBasedReports,
    patientDocument,
    patientJson
  ) => {
    if (isEmpty(reportId) || isEmpty(patientConcepts)) {
      return <div> Loading... </div>;
    }
    const mentionIdsInDocument = patientDocument.mentions.map((m) => {return m.id});
    const conceptsInDocument = patientJson.concepts.filter((c) => {
      return c.mentionIds.some((m) => mentionIdsInDocument.includes(m));
    });
    return (
      <DocumentViewer
        patientId={patientId}
        reportId={reportId}
        factId={factId}
        factBasedReports={factBasedReports}
        patientDocument={patientDocument}
        concepts={conceptsInDocument}
      ></DocumentViewer>
    );
  };

  function isEmpty(obj) {
    for (const i in obj) return false;
    return true;
  }

  useEffect(() => {
    function GetSummary(patientId) {
      return new Promise((resolve, reject) => {
        fetch(
          "http://localhost:3001/api/patient/" +
            patientId +
            "/cancerAndTumorSummary"
        ).then((response) => setSummary(response.json()));
        resolve(true);
      });
    }

    if (isEmpty(patientJson)) {
      const that = this;
      getNewPatientJsonFromFile().then((json) => {
        setPatientJson(json);
        setPatientDocument(json["documents"][3]);
        setPatientConcepts(
          json.concepts
            .map((concept) => {
              return concept.mentionIds;
            })
            .flat()
        );
      });
    }

    // this.updateCurrentReport(currentReport);
    // GetSummary(patientId);
    console.log(patientId, reportId);
  }, [patientId, reportId, patientJson, patientConcepts]);

  function highlightSelectedTimelineReport(reportId) {
    // Remove previous added highlighting classes
    const css = "selected_report";
    $(".main_report").removeClass(css);
    $(".overview_report").removeClass(css);

    // Remove previous added font awesome icon
    $(".selected_report_icon").remove();

    // Highlight the selected circle in both overview and main areas
    $("#main_" + reportId).addClass(css);
    $("#overview_" + reportId).addClass(css);
  }

  function getFact(patientId, factId) {
    $.ajax({
      url: baseUri + "/fact/" + patientId + "/" + factId,
      method: "GET",
      async: true,
      dataType: "json",
    })
      .done(function (response) {
        let docIds = Object.keys(response.groupedTextProvenances);
        // Render the html fact info
        let factHtml = '<ul class="fact_detail_list">';

        if (response.hasOwnProperty("prettyName")) {
          factHtml +=
            '<li><span class="fact_detail_label">Selected Fact:</span> ' +
            response.sourceFact.prettyName +
            "</li>";
        }

        if (docIds.length > 0) {
          factHtml +=
            '<li class="clearfix"><span class="fact_detail_label">Related Text Provenances in Source Reports:</span><ul>';

          docIds.forEach(function (id) {
            let group = response.groupedTextProvenances[id];
            // Use a combination of reportId and factId to identify this element
            factHtml +=
              '<li class="grouped_text_provenance"><span class="fact_detail_report_id"><i class="fa fa-file-o"></i> <span id="' +
              id +
              "_" +
              factId +
              '" data-report="' +
              id +
              '" data-fact="' +
              factId +
              '" class="fact_based_report_id">' +
              id +
              '</span> --></span><ul id="terms_list_' +
              id +
              "_" +
              factId +
              '">';

            let innerHtml = "";
            group.textCounts.forEach(function (textCount) {
              innerHtml +=
                '<li><span class="fact_based_term_span">' +
                textCount.text +
                '</span> <span class="count">(' +
                textCount.count +
                ")</span></li>";
            });

            factHtml += innerHtml + "</ul></li>";
          });
        } else {
          factHtml =
            '<span class="fact_detail_label">There are no direct mentions for this finding.</span>';
        }

        factHtml += "</ul>";

        // Fade in the fact detail. Need to hide the div in order to fade in.
        $("#fact_detail").html(factHtml);

        // Also highlight the report and corresponding text mentions if this fact has text provanences in the report
        // Highlight report circles in timeline
        if (docIds.length > 0) {
          // Remove the previouly fact-based highlighting
          $(".main_report").removeClass("fact_highlighted_report");

          docIds.forEach(function (id) {
            // Set fill-opacity to 1
            highlightReportBasedOnFact(id);

            // Add to the global factBasedReports object for highlighting
            // the fact-based terms among all extracted terms of a given report
            if (typeof factBasedReports[id] === "undefined") {
              factBasedReports[id] = {};
            }

            if (typeof factBasedReports[id][factId] === "undefined") {
              // Define an array for each factId
              factBasedReports[id][factId] = [];
            }

            // If not already added, add terms
            // Otherwise reuse what we have in the memory
            if (factBasedReports[id][factId].length === 0) {
              // Only store the unique text
              response.groupedTextProvenances[id].terms.forEach(function (obj) {
                if (factBasedReports[id][factId].indexOf(obj.term) === -1) {
                  factBasedReports[id][factId].push(obj.term);
                }
              });
            }
          });

          // Also show the content of the first report
          // The docIds is sorted
          //JDL  getReport(docIds[0], factId);
          //
          // And highlight the current displaying report circle with a thicker stroke
          highlightSelectedTimelineReport(docIds[0]);

          $("#report_instance").show();
        } else {
          // Dehighlight the previously selected report dot
          const css = "selected_report";
          $(".main_report").removeClass(css);
          $(".overview_report").removeClass(css);
          // Also remove the "fact_highlighted_report" class
          $(".main_report").removeClass("fact_highlighted_report");

          // And empty the report area
          $("#report_id").empty();
          $("#report_mentioned_terms").empty();
          $("#report_text").empty();
          $("#docs").show();
          $("#report_instance").show();
        }
      })
      .fail(function () {
        console.log("Ajax error - can't get fact");
      });
  }

  // // Tumor fact click - List View
  $(document).on("click", ".list_view .fact", function () {
    //JDL when someone clicks on a cancer fact, it goes here....probably need to make a map from old/new property names now to explain my thinking
    const cssClass = "highlighted_fact";

    // Remove the previous highlighting
    $(".fact").removeClass(cssClass);

    // "list_view_{{id}}"
    let id = $(this).attr("id");
    let factId = id.replace("list_view_", "");

    getFact(patientId, factId);

    // Highlight the clicked fact
    $(this).addClass(cssClass);

    // Also highlight the same fact in table view
    $("#table_view_" + factId).addClass(cssClass);
  });

  $(document).on("click", ".fact", function (event) {
    function hasParentClass(child, classname) {
      if (child.className.split(" ").indexOf(classname) >= 0) return true;
      try {
        //Throws TypeError if child doesn't have parent any more
        return child.parentNode && hasParentClass(child.parentNode, classname);
      } catch (TypeError) {
        return false;
      }
    }

    const cssClass = "highlighted_fact";
    $(".fact").removeClass(cssClass);
    let factId = event.target.id;
    let fact_id_prefix = "";
    if (hasParentClass(event.target, "cancer_and_tnm")) {
    }

    if (hasParentClass(event.target, "table_view")) {
      factId = factId.replace("table_view_", "");
      fact_id_prefix = "#table_view_";
    }

    if (hasParentClass(event.target, "list_view")) {
      factId = factId.replace("list_view_", "");
      fact_id_prefix = "#list_view_";
    }
    getFact(patientId, factId);
    // Highlight the clicked fact
    $(fact_id_prefix + factId).addClass(cssClass);
    $(this).addClass(cssClass);
    event.stopPropagation();
  });

  // Tumor summary
  $(document).on("click", ".list_view_option", function () {
    let cancerId = $(this).attr("id").replace("list_view_option_", "");

    $("#table_view_" + cancerId).hide();
    $("#list_view_" + cancerId).show();
  });

  $(document).on("click", ".table_view_option", function () {
    let cancerId = $(this).attr("id").replace("table_view_option_", "");
    $("#list_view_" + cancerId).hide();
    $("#table_view_" + cancerId).show();
  });

  // Toggle for each tumor type under list view
  $(document).on("click", ".list_view_tumor_type", function () {
    //    $(this).next().find(".toggleable").toggle("fast");
    // $(this).find(".fa-caret-right, .fa-caret-down").toggle();
    //$(this).find(".fa-caret-right").toggle();
  });

  // Click the fact based report id to display report content
  //NEED THIS
  // $(document).on("click", ".fact_based_report_id", function () {
  //   const cssClass = "current_displaying_report";
  //   // First remove the previously added highlighting
  //   $(".fact_based_report_id").removeClass(cssClass);
  //   // Then add to this one
  //   $(this).addClass(cssClass);
  //
  //   let reportId = $(this).attr("data-report");
  //   let factId = $(this).attr("data-fact");
  //
  //   getReport(reportId, factId);
  //
  //   // Also highlight the selected report circle in timeline
  //   highlightSelectedTimelineReport(reportId);
  // });

  // Click the report mentioned term to show it in the report text
  // $(document).on("click", ".report_mentioned_term", function () {
  //   let obj = {};
  //   obj.term = $(this).text();
  //   obj.begin = $(this).data("begin");
  //   obj.end = $(this).data("end");
  //
  //   scrollToHighlightedTextMention(obj, reportTextRight, obj.term);
  // });

  // $(document).on("click",
  //     ".report_mentioned_term_1, .report_mentioned_term_2, .report_mentioned_term_3, .report_mentioned_term_4",
  //     function () {
  //
  //     let obj = {};
  //     obj.term = $(this).text();
  //     obj.begin = $(this).data('begin');
  //     obj.end = $(this).data('end');
  //
  //     scrollToHighlightedTextMention(obj, reportTextRight, obj.term);
  // });

  // Reset button event
  $(document).on("click", "#reset", function () {
    // Remove highlighted fact
    $(".fact").removeClass("highlighted_fact");

    // Reload timeline
    $("#timeline").html("");
    // getTimeline(patientId, "timeline");

    // Reset the fact detail and displaying document content
    $("#fact_detail").html("");
    $("#report_id").html("");
    $("#report_mentioned_terms").html("");
    $("#report_text").html("");
  });

  if (summary === null) {
    return <div> Loading... </div>;
  } else {
    const cancers = summary;
    //const melanomaAttributes = []; // obj.melanomaAttributes;
    return (
      <React.Fragment>
        <Navbar className={"mainNavBar"}>
          <Container>
            <Navbar.Brand className={"mainNavBar"} href="/">
              DeepPhe Visualizer
              <span style={{ fontSize: "20px" }}> v2.0.0.0</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="justify-content-end" style={{ width: "100%" }}>
                <Nav.Link
                  className={"navItem"}
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://deepphe.github.io/"
                >
                  About
                </Nav.Link>
                <Nav.Link
                  className={"navItem"}
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://github.com/DeepPhe/"
                >
                  GitHub
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <GridContainer>
          <GridItem xs={12} sm={12} md={1} />
          <GridItem xs={12} sm={12} md={10}>
            <Card style={{ marginTop: "45px" }}>
              <CardHeader className={"basicCardHeader"}>
                Patient ID and Demographics
              </CardHeader>
              <CardBody>
                <CustomTable></CustomTable>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className={"basicCardHeader"}>
                Cancer and Tumor Detail
              </CardHeader>
              <CardBody>
                <div id="summary">
                  <CancerAndTumorSummary
                    cancers={cancers}
                  ></CancerAndTumorSummary>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader className={"basicCardHeader"}>
                Patient Episode Timeline
              </CardHeader>
              <CardBody>
                <Timeline
                  patientJson={patientJson}
                  patientId={patientId}
                  setReportId={setReportId}
                  //getReport={getReport}
                ></Timeline>
              </CardBody>
            </Card>
            {/*<Card id={"docs"}>*/}
            {/*  <CardHeader className={"basicCardHeader"}>*/}
            {/*    Documents Related to Selected Cancer/Tumor Detail*/}
            {/*  </CardHeader>*/}
            {/*  <CardBody>*/}
            {/*    <div id="report_instance">*/}
            {/*      <GridItem className="report_section clearfix">*/}
            {/*        <GridContainer>*/}
            {/*          /!*<div id="timeline" className="clearfix"></div>*!/*/}
            {/*          /!*<div className="divider clearfix"></div>*!/*/}
            {/*          /!*<div id="fact_detail"></div>*!/*/}
            {/*          <GridItem xs={6} id="report_id"></GridItem>*/}
            {/*          <GridItem xs={6} id="zoom_controls">*/}
            {/*            <button id="zoom_in_btn" type="button">*/}
            {/*              <i className="fa  fa-search-plus"></i>*/}
            {/*            </button>*/}
            {/*            <button id="zoom_out_btn" type="button">*/}
            {/*              <i className="fa  fa-search-minus"></i>*/}
            {/*            </button>*/}
            {/*          </GridItem>*/}
            {/*          <GridContainer id="term_and_report_container">*/}
            {/*            <GridContainer id="term_container2">*/}
            {/*              <GridItem*/}
            {/*                xs={4}*/}
            {/*                sm={4}*/}
            {/*                md={3}*/}
            {/*                id="mentions_container2"*/}
            {/*                className="mentions_container2"*/}
            {/*              >*/}
            {/*                <CardHeader*/}
            {/*                  id="mentions_label"*/}
            {/*                  className={"basicCardHeader"}*/}
            {/*                  onClick={handleDropdownClick}*/}
            {/*                >*/}
            {/*                  Concept Filter*/}
            {/*                  {checkboxGridVisible ? (*/}
            {/*                    <span>*/}
            {/*                      <i className="caret-custom fa fa-caret-down fa-2x"></i>*/}
            {/*                    </span>*/}
            {/*                  ) : (*/}
            {/*                    <span>*/}
            {/*                      <i className="caret-custom fa fa-caret-up fa-2x"></i>*/}
            {/*                    </span>*/}
            {/*                  )}*/}
            {/*                </CardHeader>*/}
            {/*                <GridItem xs={12} id="mentions_container">*/}
            {/*                  <GridContainer>*/}
            {/*                    <GridItem xs={12}>*/}
            {/*                      <div*/}
            {/*                        id="search_label"*/}
            {/*                        className={`${*/}
            {/*                          checkboxGridVisible ? "visible" : "hidden"*/}
            {/*                        }`}*/}
            {/*                      >*/}
            {/*                        {" "}*/}
            {/*                        Filter Concepts*/}
            {/*                        <hr className="line" />*/}
            {/*                        <input*/}
            {/*                          type="search"*/}
            {/*                          id="mention_search_input"*/}
            {/*                          placeholder="Search for mentions.."*/}
            {/*                        ></input>*/}
            {/*                      </div>*/}
            {/*                    </GridItem>*/}
            {/*                    <GridItem xs={12} md={12} lg={6}>*/}
            {/*                      <div className="dropdown">*/}
            {/*                        <div*/}
            {/*                          className={`dropdown-container ${*/}
            {/*                            checkboxGridVisible*/}
            {/*                              ? "visible"*/}
            {/*                              : "hidden"*/}
            {/*                          }`}*/}
            {/*                        >*/}
            {/*                          <div className="caret-options-container">*/}
            {/*                            <div className="options-container">*/}
            {/*                              <span>Semantic Groups</span>*/}
            {/*                            </div>*/}
            {/*                          </div>*/}
            {/*                          <hr className="line" />*/}
            {/*                        </div>*/}

            {/*                        <div*/}
            {/*                          className={`checkbox-grid ${*/}
            {/*                            checkboxGridVisible*/}
            {/*                              ? "visible"*/}
            {/*                              : "hidden"*/}
            {/*                          }`}*/}
            {/*                        >*/}
            {/*                          <div className="report_mentioned_term_magenta">*/}
            {/*                            <input*/}
            {/*                              type="checkbox"*/}
            {/*                              id="checkbox1"*/}
            {/*                              checked={checkboxes.checkbox1}*/}
            {/*                              onChange={() =>*/}
            {/*                                handleCheckboxChange("checkbox1")*/}
            {/*                              }*/}
            {/*                            />*/}
            {/*                            <label htmlFor="checkbox1">*/}
            {/*                              Sign/Symptom*/}
            {/*                            </label>*/}
            {/*                          </div>*/}
            {/*                          <div className="report_mentioned_term_black">*/}
            {/*                            <input*/}
            {/*                              type="checkbox"*/}
            {/*                              id="checkbox2"*/}
            {/*                              checked={checkboxes.checkbox2}*/}
            {/*                              onChange={() =>*/}
            {/*                                handleCheckboxChange("checkbox2")*/}
            {/*                              }*/}
            {/*                            />*/}
            {/*                            <label*/}
            {/*                              className="black"*/}
            {/*                              htmlFor="checkbox2"*/}
            {/*                            >*/}
            {/*                              Test/Procedure*/}
            {/*                            </label>*/}
            {/*                          </div>*/}
            {/*                          <div className="report_mentioned_term_grey">*/}
            {/*                            <input*/}
            {/*                              type="checkbox"*/}
            {/*                              id="checkbox3"*/}
            {/*                              checked={checkboxes.checkbox3}*/}
            {/*                              onChange={() =>*/}
            {/*                                handleCheckboxChange("checkbox3")*/}
            {/*                              }*/}
            {/*                            />*/}
            {/*                            <label htmlFor="checkbox3">*/}
            {/*                              Anatomical Site*/}
            {/*                            </label>*/}
            {/*                          </div>*/}
            {/*                          <div className="report_mentioned_term_green">*/}
            {/*                            <input*/}
            {/*                              type="checkbox"*/}
            {/*                              id="checkbox4"*/}
            {/*                              checked={checkboxes.checkbox4}*/}
            {/*                              onChange={() =>*/}
            {/*                                handleCheckboxChange("checkbox4")*/}
            {/*                              }*/}
            {/*                            />*/}
            {/*                            <label htmlFor="checkbox4">*/}
            {/*                              Disease/Disorder*/}
            {/*                            </label>*/}
            {/*                          </div>*/}
            {/*                          <div className="report_mentioned_term_red">*/}
            {/*                            <input*/}
            {/*                              type="checkbox"*/}
            {/*                              id="checkbox5"*/}
            {/*                              checked={checkboxes.checkbox5}*/}
            {/*                              onChange={() =>*/}
            {/*                                handleCheckboxChange("checkbox5")*/}
            {/*                              }*/}
            {/*                            />*/}
            {/*                            <label htmlFor="checkbox5">*/}
            {/*                              Medication*/}
            {/*                            </label>*/}
            {/*                          </div>*/}
            {/*                          <div className="report_mentioned_term">*/}
            {/*                            <input*/}
            {/*                              type="checkbox"*/}
            {/*                              id="checkbox6"*/}
            {/*                              checked={checkboxes.checkbox6}*/}
            {/*                              onChange={() =>*/}
            {/*                                handleCheckboxChange("checkbox6")*/}
            {/*                              }*/}
            {/*                            />*/}
            {/*                            <label htmlFor="checkbox6">BLUE</label>*/}
            {/*                          </div>*/}
            {/*                          <div className="report_mentioned_term">*/}
            {/*                            <input*/}
            {/*                              type="checkbox"*/}
            {/*                              id="checkbox7"*/}
            {/*                              checked={checkboxes.checkbox7}*/}
            {/*                              onChange={() =>*/}
            {/*                                handleCheckboxChange("checkbox7")*/}
            {/*                              }*/}
            {/*                            />*/}
            {/*                            <label htmlFor="checkbox7">*/}
            {/*                              Negated*/}
            {/*                            </label>*/}
            {/*                          </div>*/}
            {/*                        </div>*/}
            {/*                      </div>*/}
            {/*                    </GridItem>*/}

            {/*                    <GridItem xs={12}>*/}
            {/*                      <div*/}
            {/*                        id="confidence_label"*/}
            {/*                        className={`${*/}
            {/*                          checkboxGridVisible ? "visible" : "hidden"*/}
            {/*                        }`}*/}
            {/*                      >*/}
            {/*                        {" "}*/}
            {/*                        Confidence Range*/}
            {/*                        <hr className="line" />*/}
            {/*                        <input*/}
            {/*                          type="range"*/}
            {/*                          min="1"*/}
            {/*                          max="100"*/}
            {/*                          className="slider"*/}
            {/*                          id="confidenceRange"*/}
            {/*                        />*/}
            {/*                        <p>*/}
            {/*                          Confidence:{" "}*/}
            {/*                          <span id="confidenceValue"></span> %*/}
            {/*                        </p>*/}
            {/*                      </div>*/}
            {/*                    </GridItem>*/}

            {/*                    <GridItem xs={12} id="sort_label">*/}
            {/*                      Sort Concepts*/}
            {/*                    </GridItem>*/}
            {/*                    <hr className="line" />*/}
            {/*                    <GridItem*/}
            {/*                      md={12}*/}
            {/*                      lg={6}*/}
            {/*                      className="sort_radio_item"*/}
            {/*                    >*/}
            {/*                      <input*/}
            {/*                        id="occ_radio"*/}
            {/*                        type="radio"*/}
            {/*                        name="sort_order"*/}
            {/*                        value="occurrence"*/}
            {/*                      ></input>*/}
            {/*                      <label htmlFor="occ_radio">*/}
            {/*                        &nbsp; By Occurrence*/}
            {/*                      </label>*/}
            {/*                    </GridItem>*/}
            {/*                    <GridItem*/}
            {/*                      md={12}*/}
            {/*                      lg={6}*/}
            {/*                      className="sort_radio_item"*/}
            {/*                    >*/}
            {/*                      <input*/}
            {/*                        id="alpha_radio"*/}
            {/*                        type="radio"*/}
            {/*                        name="sort_order"*/}
            {/*                        value="alphabetically"*/}
            {/*                      ></input>*/}
            {/*                      <label htmlFor="alpha_radio">*/}
            {/*                        &nbsp; Alphabetically*/}
            {/*                      </label>*/}
            {/*                    </GridItem>*/}
            {/*                  </GridContainer>*/}
            {/*                </GridItem>*/}
            {/*              </GridItem>*/}
            {/*              <GridItem*/}
            {/*                xs={4}*/}
            {/*                sm={4}*/}
            {/*                md={3}*/}
            {/*                id="mentions_container3"*/}
            {/*                className="ment_container"*/}
            {/*              >*/}
            {/*                <CardHeader*/}
            {/*                  id="mentions_label"*/}
            {/*                  className={"basicCardHeader"}*/}
            {/*                >*/}
            {/*                  Concepts*/}
            {/*                </CardHeader>*/}
            {/*                <GridContainer>*/}
            {/*                  <GridItem xs={12} id="mentions_container">*/}
            {/*                    <div id="report_mentioned_terms"></div>*/}
            {/*                  </GridItem>*/}
            {/*                </GridContainer>*/}
            {/*              </GridItem>*/}
            {/*            </GridContainer>*/}
            {/*            <div id="scroll-line"></div>*/}
            {/*            <GridItem xs={8} sm={8} md={9} id="report_text" />*/}
            {/*          </GridContainer>*/}
            {/*        </GridContainer>*/}
            {/*      </GridItem>*/}
            {/*    </div>*/}
            {/*  </CardBody>*/}
            {/*</Card>*/}
          </GridItem>
          <GridItem xs={12} sm={12} md={1} />
        </GridContainer>
        {getDocumentViewer(
          patientId,
          reportId,
          factId,
          factBasedReports,
          patientDocument,
          patientJson
        )}
        <div className={"mainFooter"}>
          <Row>
            <Col md={1}></Col>
            <Col md={4}>
              Supported by the{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://itcr.cancer.gov/"
              >
                National Cancer Institute's Information Technology for Cancer
                Research
              </a>{" "}
              initiative. (Grant #U24CA248010)
            </Col>
            <Col md={1}></Col>
            <Col md={5}>
              ©2021 Harvard Medical School, University of Pittsburgh, and
              Vanderbilt University Medical Center.
            </Col>
            <Col md={1}></Col>
          </Row>
        </div>
      </React.Fragment>
    );
  }
}

export default Patient;
