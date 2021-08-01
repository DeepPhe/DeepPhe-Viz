import React, {useEffect, useState} from "react";
import {useParams} from 'react-router-dom'
// @material-ui/core components

// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import * as d3 from "d3v4";

import CustomTable from "../../components/CustomTables/CustomTable";
import CancerAndTumorSummary from "../../components/Summaries/CancerAndTumorSummary";
import Timeline from "../../components/Charts/Timeline";


import $ from 'jquery'
import CardHeader from "../../components/Card/CardHeader";
import {Container, Navbar} from "react-bootstrap";


const baseUri = "http://localhost:3001/api";

// const styles = {
//     cardCategoryWhite: {
//         color: "rgba(255,255,255,.62)",
//         margin: "0",
//         fontSize: "14px",
//         marginTop: "0",
//         marginBottom: "0"
//     },
//     cardTitleWhite: {
//         color: "#FFFFFF",
//         marginTop: "0px",
//         minHeight: "auto",
//         fontWeight: "300",
//         fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
//         marginBottom: "3px",
//         textDecoration: "none"
//     }
// };

//const useStyles = makeStyles(styles); removing, not in use

function Patient() {
    const {patientId} = useParams();

    // Highlight the selected report circle
    function highlightReportBasedOnFact(reportId) {
        d3.select('#main_' + reportId).classed("fact_highlighted_report", true);
    }


    let factBasedReports = {};

    function scrollToHighlightedTextMention(obj, reportText) {
        // Highlight the selected term in the term list
        const cssClass = 'current_mentioned_term';
        // First remove the previously added highlighting
        $('.report_mentioned_term').removeClass(cssClass);
        // Then add to this current one by selecting the attributes
        $('li[data-begin="' + obj.begin + '"][data-end="' + obj.end + '"]').addClass(cssClass);

        let reportTextDiv = $("#report_text");

        let textMentions = [];

        let textMentionObj = {};
        textMentionObj.text = obj.term;
        textMentionObj.beginOffset = obj.begin;
        textMentionObj.endOffset = obj.end;

        textMentions.push(textMentionObj);

        // Highlight this term in the report text
        let highlightedReportText = highlightTextMentions(textMentions, reportText);

        // Use html() for html rendering
        reportTextDiv.html(highlightedReportText);

        // Scroll to that position inside the report text div
        // https://stackoverflow.com/questions/2346011/how-do-i-scroll-to-an-element-within-an-overflowed-div
        // 5 is position tweak
        reportTextDiv.scrollTop(reportTextDiv.scrollTop() + $('.highlighted_term').position().top - 5);
    }

    function highlightSelectedTimelineReport(reportId) {
        // Remove previous added highlighting classes
        const css = "selected_report";
        $('.main_report').removeClass(css);
        $('.overview_report').removeClass(css);

        // Remove previous added font awesome icon
        $('.selected_report_icon').remove();

        // Highlight the selected circle in both overview and main areas
        $('#main_' + reportId).addClass(css);
        $('#overview_' + reportId).addClass(css);
    }

    function highlightTextMentions(textMentions, reportText) {
        const cssClass = "highlighted_term";

        // Sort the textMentions array first based on beginOffset
        textMentions.sort(function (a, b) {
            let comp = a.beginOffset - b.beginOffset;
            if (comp === 0) {
                return b.endOffset - a.endOffset;
            } else {
                return comp;
            }
        });

        let textFragments = [];

        if (textMentions.length === 1) {
            let textMention = textMentions[0];

            if (textMention.beginOffset === 0) {
                textFragments.push('');
            } else {
                textFragments.push(reportText.substring(0, textMention.beginOffset));
            }

            textFragments.push('<span class="' + cssClass + '">' + reportText.substring(textMention.beginOffset, textMention.endOffset) + '</span>');
            textFragments.push(reportText.substring(textMention.endOffset));
        } else {
            let lastValidTMIndex = 0;

            for (let i = 0; i < textMentions.length; i++) {
                let textMention = textMentions[i];
                let lastValidTM = textMentions[lastValidTMIndex];

                // If this is the first textmention, paste the start of the document before the first TM.
                if (i === 0) {
                    if (textMention.beginOffset === 0) {
                        textFragments.push('');
                    } else {
                        textFragments.push(reportText.substring(0, textMention.beginOffset));
                    }
                } else { // Otherwise, check if this text mention is valid. if it is, paste the text from last valid TM to this one.
                    if (textMention.beginOffset < lastValidTM.endOffset) {
                        // Push end of the document
                        continue; // Skipping this TM.
                    } else {
                        textFragments.push(reportText.substring(lastValidTM.endOffset, textMention.beginOffset));
                    }
                }

                textFragments.push('<span "' + cssClass + '">' + reportText.substring(textMention.beginOffset, textMention.endOffset) + '</span>');
                lastValidTMIndex = i;
            }
            // Push end of the document
            textFragments.push(reportText.substring(textMentions[lastValidTMIndex].endOffset));
        }

        // Assemble the final report content with highlighted texts
        let highlightedReportText = '';

        for (let j = 0; j < textFragments.length; j++) {
            highlightedReportText += textFragments[j];
        }

        return highlightedReportText;
    }

    function getReport(reportId, factId) {
        // Must use encodeURIComponent() otherwise may have URI parsing issue
        $.ajax({
            url: baseUri + '/reports/' + reportId,
            method: 'GET',
            async: true,
            dataType: 'json'
        })
            .done(function (response) {

                let reportText = response.reportText;
                let mentionedTerms = response.mentionedTerms;

                // If there are fact based reports, highlight the displaying one
                const currentReportCssClass = 'current_displaying_report';
                const currentFactTermsCssClass = 'fact_based_term';
                $('.fact_based_report_id').removeClass(currentReportCssClass);
                $('.fact_based_term_span').removeClass(currentFactTermsCssClass);

                // Highlight the curent displaying report name
                $('#' + reportId + "_" + factId).addClass(currentReportCssClass);
                // Also highlight all the fact-based text mentions in the fact info area
                $('#terms_list_' + reportId + "_" + factId).children().find(">:first-child").addClass(currentFactTermsCssClass);

                // Show report ID
                $('#report_id').html('<i fa fa-file-o></i><span "display_report_id ' + currentReportCssClass + '">' + reportId + '</span>');

                // Show rendered mentioned terms
                // First check if this report is a fact-based report so we cna highlight the fact-related terms
                let factBasedTerms = [];
                if (Object.keys(factBasedReports).indexOf(reportId) !== -1 && Object.keys(factBasedReports[reportId]).indexOf(factId) !== -1) {
                    factBasedTerms = factBasedReports[reportId][factId];
                }

                // mentionedTerms doesn't have position info, so we need to keep the posiiton info
                // for highlighting and scroll to
                let factBasedTermsWithPosition = [];

                let renderedMentionedTerms = '<ul class="mentioned_terms_list">';
                mentionedTerms.forEach(function (obj) {
                    let fact_based_term_class = '';
                    if (factBasedTerms.indexOf(obj.term) !== -1) {
                        factBasedTermsWithPosition.push(obj);
                        fact_based_term_class = ' fact_based_term';
                    }
                    renderedMentionedTerms += '<li class="report_mentioned_term' + fact_based_term_class + '" data-begin="' + obj.begin + '" data-end="' + obj.end + '">' + obj.term + '</li>';
                });
                renderedMentionedTerms += "</ul>";

                $('#report_mentioned_terms').html(renderedMentionedTerms);

                // Also scroll to the first fact based term if any in the report text
                if (factBasedTermsWithPosition.length > 0) {
                    scrollToHighlightedTextMention(factBasedTermsWithPosition[0], reportText);
                } else {
                    let reportTextDiv = $("#report_text");
                    // Show report content, either highlighted or not
                    reportTextDiv.html(reportText);
                    // Scroll back to top of the report content div
                    reportTextDiv.animate({scrollTop: 0}, "fast");
                }
            })
            .fail(function () {
                console.log("Ajax error - can't get report");
            });
    }

    function getFact(patientId, factId) {
        $.ajax({
            url: baseUri + '/fact/' + patientId + '/' + factId,
            method: 'GET',
            async: true,
            dataType: 'json'
        })
            .done(function (response) {
                let docIds = Object.keys(response.groupedTextProvenances);

                // Render the html fact info
                let factHtml = '<ul class="fact_detail_list">'
                    + '<li><span class="fact_detail_label">Selected Fact:</span> ' + response.sourceFact.prettyName + '</li>';

                if (docIds.length > 0) {
                    factHtml += '<li class="clearfix"><span class="fact_detail_label">Related Text Provenances in Source Reports:</span><ul>';

                    docIds.forEach(function (id) {
                        let group = response.groupedTextProvenances[id];
                        // Use a combination of reportId and factId to identify this element
                        factHtml += '<li class="grouped_text_provenance"><span class="fact_detail_report_id"><i class="fa fa-file-o"></i> <span id="' + id + "_" + factId + '" data-report="' + id + '" data-fact="' + factId + '" class="fact_based_report_id">' + id + '</span> --></span><ul id="terms_list_' + id + "_" + factId + '">';

                        let innerHtml = "";
                        group.textCounts.forEach(function (textCount) {
                            innerHtml += '<li><span class="fact_based_term_span">' + textCount.text + '</span> <span class="count">(' + textCount.count + ')</span></li>';
                        });

                        factHtml += innerHtml + '</ul></li>';
                    });
                }

                factHtml += '</ul>';

                // Fade in the fact detail. Need to hide the div in order to fade in.
                $('#fact_detail').html(factHtml);

                // Also highlight the report and corresponding text mentions if this fact has text provanences in the report
                // Highlight report circles in timeline
                if (docIds.length > 0) {
                    // Remove the previouly fact-based highlighting
                    $('.main_report').removeClass("fact_highlighted_report");

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
                    getReport(docIds[0], factId);

                    // And highlight the current displaying report circle with a thicker stroke
                    highlightSelectedTimelineReport(docIds[0])
                    $("#report_instance").show();
                } else {
                    // Dehighlight the previously selected report dot
                    const css = "selected_report";
                    $('.main_report').removeClass(css);
                    $('.overview_report').removeClass(css);
                    // Also remove the "fact_highlighted_report" class
                    $('.main_report').removeClass("fact_highlighted_report");

                    // And empty the report area
                    $('#report_id').empty();
                    $('#report_mentioned_terms').empty();
                    $('#report_text').empty();
                }
            })
            .fail(function () {
                console.log("Ajax error - can't get fact");
            });
    }

    // // Tumor fact click - List View
    $(document).on("click", ".list_view .fact", function () {

        //JDL when someone clicks on a cancer fact, it goes here....probably need to make a map from old/new property names now to explain my thinking
        const cssClass = 'highlighted_fact';

        // Remove the previous highlighting
        $('.fact').removeClass(cssClass);

        // "list_view_{{id}}"
        let id = $(this).attr('id');
        let factId = id.replace("list_view_", "");

        getFact(patientId, factId);

        // Highlight the clicked fact
        $(this).addClass(cssClass);

        // Also highlight the same fact in table view
        $("#table_view_" + factId).addClass(cssClass);
    });
    $(document).on("click", ".cancer_and_tnm .fact", function () {
        const cssClass = 'highlighted_fact';

        // Remove the previous highlighting
        $('.fact').removeClass(cssClass);

        // In cacner summary table, factId has no prefix
        let factId = $(this).attr('id');

        getFact(patientId, factId);

        // Highlight the clicked fact
        $(this).addClass(cssClass);
    });

    // Tumor fact click - Table View
    $(document).on("click", ".table_view .fact", function () {

        const cssClass = 'highlighted_fact';

        // Remove the previous highlighting
        $('.fact').removeClass(cssClass);

        // "table_view_{{id}}"
        let id = $(this).attr('id');
        let factId = id.replace("table_view_", "");

        getFact(patientId, factId);

        // Highlight the clicked fact
        $(this).addClass(cssClass);

        // Also highlight the same fact in list view
        $("#list_view_" + factId).addClass(cssClass);
    });

    // Tumor summary
    $(document).on("click", ".list_view_option", function () {

        let cancerId = $(this).attr('id').replace("list_view_option_", "");

        $("#table_view_" + cancerId).hide();
        $("#list_view_" + cancerId).show();
    });

    $(document).on("click", ".table_view_option", function () {

        let cancerId = $(this).attr('id').replace("table_view_option_", "");
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
    $(document).on("click", ".fact_based_report_id", function () {

        const cssClass = 'current_displaying_report';
        // First remove the previously added highlighting
        $('.fact_based_report_id').removeClass(cssClass);
        // Then add to this one
        $(this).addClass(cssClass);

        let reportId = $(this).attr('data-report');
        let factId = $(this).attr('data-fact');
        getReport(reportId, factId);

        // Also highlight the selected report circle in timeline
        highlightSelectedTimelineReport(reportId)
    });

    // Click the report mentioned term to show it in the report text
    $(document).on("click", ".report_mentioned_term", function () {

        let obj = {};
        obj.term = $(this).text();
        obj.begin = $(this).data('begin');
        obj.end = $(this).data('end');

        let reportText = $("#report_text").text();

        scrollToHighlightedTextMention(obj, reportText);
    });

    // Reset button event
    $(document).on("click", "#reset", function () {

        // Remove highlighted fact
        $('.fact').removeClass('highlighted_fact');

        // Reload timeline
        $('#timeline').html('');
        // getTimeline(patientId, "timeline");

        // Reset the fact detail and displaying document content
        $('#fact_detail').html('');
        $('#report_id').html('');
        $('#report_mentioned_terms').html('');
        $('#report_text').html('');
    });

    $(document).on("click", ".list_view .fact", function () {

        const cssClass = 'highlighted_fact';

        // Remove the previous highlighting
        $('.fact').removeClass(cssClass);

        // "list_view_{{id}}"
        let id = $(this).attr('id');
        let factId = id.replace("list_view_", "");

        getFact(patientId, factId);

        // Highlight the clicked fact
        $(this).addClass(cssClass);

        // Also highlight the same fact in table view
        $("#table_view_" + factId).addClass(cssClass);
    });

    // removed, not used const classes = useStyles();
    const [summary, setSummary] = useState(null);


    useEffect(() => {
        function GetSummary(patientId) {
            let isMounted = true;

            fetch('http://localhost:3001/api/patient/' + patientId + '/cancerAndTumorSummary').then(response => response.json()).then(data => {
                if (isMounted)
                    setSummary(data);
            })
            return () => isMounted = false;

        }

        GetSummary(patientId)
    }, [patientId]);


    if (summary === undefined) {
        return (<div> Loading... </div>)
    } else {
        const cancers = summary;
        const melanomaAttributes = []; // obj.melanomaAttributes;
        return (<span>
           <Navbar bg="light" expand="lg">
               <Container>
                   <Navbar.Brand href="#home" style={{'font-size': '25px'}}>DeepPhe Visualizer<span
                       style={{"font-size": '20px'}}> v2.0.0.0</span></Navbar.Brand>
                   <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                   <Navbar.Collapse id="basic-navbar-nav">
                       {/*<Nav className="me-auto" style={{'float':'right'}}>*/}

                       {/*    <Nav.Link href="#home">Home</Nav.Link>*/}
                       {/*    <Nav.Link href="#link">Link</Nav.Link>*/}
                       {/*    <NavDropdown title="Dropdown" id="basic-nav-dropdown">*/}
                       {/*        <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>*/}
                       {/*        <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>*/}
                       {/*        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>*/}
                       {/*        <NavDropdown.Divider />*/}
                       {/*        <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>*/}
                       {/*    </NavDropdown>*/}
                       {/*</Nav>*/}
                   </Navbar.Collapse>
               </Container>
           </Navbar>

               <GridContainer>

                   <GridItem xs={12} sm={12} md={2}/>
                   <GridItem xs={12} sm={12} md={8}>
                       <Card>
                           <CardHeader color={"warning"} style={{"font-size": "18px"}}>Patient ID and Demographics</CardHeader>
                           <CardBody>
                               <CustomTable></CustomTable>
                           </CardBody>
                       </Card>

                       <Card>
                           <CardHeader color={"warning"}
                                       style={{"font-size": "18px"}}>Click on a Cancer or Tumor Detail</CardHeader>
                           <CardBody>

                               <div id="summary">

                                   <CancerAndTumorSummary cancers={cancers}></CancerAndTumorSummary>
                               </div>
                           </CardBody>
                       </Card>
                       <Card>


                            <CardHeader color={"warning"} style={{"font-size": "18px"}}>Documents Related to Selected Cancer/Tumor Detail</CardHeader>
                           <CardBody>
                            <div className="right" id="report_instance">

                                   <div className="section_heading">Report</div>

                                   <div className="report_section clearfix">
                                       <div id="timeline" className="clearfix"></div>

                                       <div className="divider clearfix"></div>

                                       <div id="fact_detail"></div>

                                       <div id="report_id"></div>

                                       <div id="report_info">

                                           <div id="report_mentioned_terms"></div>
                                       </div>

                                       <div id="report_text"></div>

                                   </div>

                               </div>


                               {/*<CardHeader color="primary">*/}

                               {/*</CardHeader>*/}

                           </CardBody>
                       </Card>
                   </GridItem>
                    <GridItem xs={12} sm={12} md={2}/>
               </GridContainer>
</span>
        )
    }
}

export default Patient
