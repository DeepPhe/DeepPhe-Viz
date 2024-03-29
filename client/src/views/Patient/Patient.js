import React, {useEffect, useState} from "react";
import {useParams} from 'react-router-dom'
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
import {Col, Container, Nav, Navbar, Row} from "react-bootstrap";


const baseUri = "http://localhost:3001/api";

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
        $("#occ_radio").prop('checked', true);
        const e = new Event("change");
        const element = document.querySelector('input[type=radio][name="sort_order"]');
        element.dispatchEvent(e);
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

        const e = new Event("change");
        const element = document.querySelector('input[type=radio][name="sort_order"]');
        element.dispatchEvent(e);

        return highlightedReportText;
    }

    function getReport(reportId, factId) {
        $("#docs").show();
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
                $('#report_id').html('<i class="fa fa-file-o"></i><span class="display_report_id ' + currentReportCssClass + '">' + reportId + '</span>');

                // Show rendered mentioned terms
                // First check if this report is a fact-based report so we cna highlight the fact-related terms
                let factBasedTerms = [];
                if (Object.keys(factBasedReports).indexOf(reportId) !== -1 && Object.keys(factBasedReports[reportId]).indexOf(factId) !== -1) {
                    factBasedTerms = factBasedReports[reportId][factId];
                }

                // mentionedTerms doesn't have position info, so we need to keep the posiiton info
                // for highlighting and scroll to
                let factBasedTermsWithPosition = [];

                let renderedMentionedTerms = '<ol id="mentions" class="mentioned_terms_list">';

                mentionedTerms.forEach(function (obj) {
                    let fact_based_term_class = '';
                    if (factBasedTerms.indexOf(obj.term) !== -1) {
                        factBasedTermsWithPosition.push(obj);
                        fact_based_term_class = ' fact_based_term';
                    }
                    renderedMentionedTerms += '<li class="report_mentioned_term' + fact_based_term_class + '" data-begin="' + obj.begin + '" data-end="' + obj.end + '">' + obj.term + '</li>';
                });
                renderedMentionedTerms += "</ol>";

                $('#report_mentioned_terms').html(renderedMentionedTerms);
                sortMentions("occurrence")

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
                let factHtml = '<ul class="fact_detail_list">';

                if (response.hasOwnProperty("prettyName")) {
                    factHtml += '<li><span class="fact_detail_label">Selected Fact:</span> ' + response.sourceFact.prettyName + '</li>';
                }

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
                } else {
                    factHtml = '<span class="fact_detail_label">There are no direct mentions for this finding.</span>';
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
                    $("#docs").show();
                    $("#report_instance").show();

                }
            })
            .fail(function () {
                console.log("Ajax error - can't get fact");
            });
    }

    // // Tumor fact click - List View
    // $(document).on("click", ".list_view .fact", function () {
    //
    //     //JDL when someone clicks on a cancer fact, it goes here....probably need to make a map from old/new property names now to explain my thinking
    //     const cssClass = 'highlighted_fact';
    //
    //     // Remove the previous highlighting
    //     $('.fact').removeClass(cssClass);
    //
    //     // "list_view_{{id}}"
    //     let id = $(this).attr('id');
    //     let factId = id.replace("list_view_", "");
    //
    //     getFact(patientId, factId);
    //
    //     // Highlight the clicked fact
    //     $(this).addClass(cssClass);
    //
    //     // Also highlight the same fact in table view
    //     $("#table_view_" + factId).addClass(cssClass);
    // });

    $(document).on("click", ".fact", function (event) {
        function hasParentClass(child, classname) {
            if (child.className.split(' ').indexOf(classname) >= 0) return true;
            try {
                //Throws TypeError if child doesn't have parent any more
                return child.parentNode && hasParentClass(child.parentNode, classname);
            } catch (TypeError) {
                return false;
            }
        }

        const cssClass = 'highlighted_fact';
        $('.fact').removeClass(cssClass);
        let factId = event.target.id
        let fact_id_prefix = ''
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
        //getTimeline(patientId, "timeline");

        // Reset the fact detail and displaying document content
        $('#fact_detail').html('');
        $('#report_id').html('');
        $('#report_mentioned_terms').html('');
        $('#report_text').html('');
    });

    $(document).on("click", "#zoom_in_btn", function () {
        let newFontSize = parseInt($('#report_text').css('font-size')) + 1;
        $('#report_text').css('font-size', newFontSize);
    });

    $(document).on("click", "#zoom_out_btn", function () {
        let newFontSize = parseInt($('#report_text').css('font-size')) - 1;
        $('#report_text').css('font-size', newFontSize);
    });

    $("#occ_radio").prop('checked', true);

    function sortMentions(method) {
        // Declaring Variables
        debugger;
        let geek_list, i, run, li, stop;
        // Taking content of list as input
        geek_list = document.getElementById("mentions");

        if (geek_list !== null && geek_list !== undefined) {

            run = true;

            while (run) {
                run = false;
                li = geek_list.getElementsByTagName("li");

                // Loop traversing through all the list items
                for (i = 0; i < (li.length - 1); i++) {
                    stop = false;
                    if (method === "alphabetically") {
                        if (li[i].textContent.toLowerCase() >
                            li[i + 1].textContent.toLowerCase()) {
                            stop = true;
                            break;
                        }
                    } else if (method === "occurrence") {
                        if (parseInt(li[i].getAttribute("data-begin")) >
                            (parseInt(li[i + 1].getAttribute("data-begin")))) {
                            stop = true;
                            break;
                        }
                    }
                }

                /* If the current item is smaller than
                   the next item then adding it after
                   it using insertBefore() method */
                if (stop) {
                    li[i].parentNode.insertBefore(
                        li[i + 1], li[i]);

                    run = true;
                }
            }
        }

    }

    $('input[type=radio][name="sort_order"]').change(function () {
        const value = $(this).val();
        if (value === "alphabetically") {
            sortMentions(value);
        } else {
            //only other option
            sortMentions("occurrence")
        }
    })

    $(document).on("input", "#mention_search_input", function () {

        // Declare variables
        var input, filter, ul, li, a, i, txtValue;
        input = document.getElementById('mention_search_input');
        filter = input.value.toUpperCase();
        ul = document.getElementById("mentions");
        li = ul.getElementsByTagName('li');

        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; i < li.length; i++) {

            a = li[i]
            txtValue = a.textContent || a.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
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
        //const melanomaAttributes = []; // obj.melanomaAttributes;
        return (
            <span>
                <Navbar className={"mainNavBar"}>
                    <Container>
                        <Navbar.Brand className={"mainNavBar"} href="/">DeepPhe Visualizer<span
                            style={{fontSize: '20px'}}> v2.0.0.0</span></Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="justify-content-end" style={{width: "100%"}}>

                               <Nav.Link className={"navItem"} target="_blank" rel="noopener noreferrer"
                                         href="https://deepphe.github.io/">About</Nav.Link>
                                <Nav.Link className={"navItem"} target="_blank" rel="noopener noreferrer"
                                          href="https://github.com/DeepPhe/">GitHub</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>

                <GridContainer>
                    <GridItem xs={12} sm={12} md={1}/>
                    <GridItem xs={12} sm={12} md={10}>
                       <Card style={{'marginTop': '45px'}}>
                           <CardHeader className={"basicCardHeader"}>Patient ID and Demographics</CardHeader>
                           <CardBody>
                               <CustomTable></CustomTable>
                           </CardBody>
                       </Card>

                       <Card>
                           <CardHeader className={"basicCardHeader"}>Click on a Cancer or Tumor Detail</CardHeader>
                           <CardBody>
                               <div id="summary">
                                   <CancerAndTumorSummary cancers={cancers}></CancerAndTumorSummary>
                               </div>
                           </CardBody>
                       </Card>
                       <Card>
                           <CardHeader className={"basicCardHeader"}>Patient Episode Timeline</CardHeader>
                           <CardBody>
                          <Timeline patientId={patientId}></Timeline>
                           </CardBody>
                       </Card>
                       <Card id={"docs"}>
                            <CardHeader
                                className={"basicCardHeader"}>Documents Related to Selected Cancer/Tumor Detail</CardHeader>
                            <CardBody>
                                <div id="report_instance">
                                   <GridItem className="report_section clearfix">
                                       <GridContainer>
                                            <div id="timeline" className="clearfix"></div>
                                            <div className="divider clearfix"></div>
                                            <div id="fact_detail"></div>
                                            <GridItem xs={6} id="report_id"></GridItem>
                                            <GridItem xs={6} id="zoom_controls">
                                                <button id="zoom_in_btn" type="button"><i
                                                    className="fa  fa-search-plus"></i></button>
                                                <button id="zoom_out_btn" type="button"><i
                                                    className="fa  fa-search-minus"></i></button>
                                            </GridItem>

                                            <GridContainer id="term_container2">
                                                <GridItem xs={4} sm={4} md={3} id="mentions_container2">
                                                    <CardHeader id="mentions_label" className={"basicCardHeader"}>Mentioned Terms</CardHeader>
                                                    <GridItem xs={12} id="mentions_container">
                                                        <GridContainer>
                                                            <GridItem xs={12}
                                                                      id="search_label">Filter Mentions:</GridItem>
                                                            <GridItem xs={12}>
                                                                <input type="search" id="mention_search_input"
                                                                       placeholder="Search for mentions.."></input>
                                                            </GridItem>

                                                            <GridItem xs={12} id="sort_label">Sort mentions:</GridItem>
                                                            <GridItem md={12} lg={6} className="sort_radio_item">
                                                                <input id="occ_radio" type="radio" name="sort_order"
                                                                       value="occurrence"></input>
                                                                <label htmlFor="occ_radio">&nbsp; By Occurrence</label>
                                                            </GridItem>
                                                            <GridItem md={12} lg={6} className="sort_radio_item">
                                                               <input id="alpha_radio" type="radio" name="sort_order"
                                                                      value="alphabetically"></input>
                                                               <label
                                                                   htmlFor="alpha_radio">&nbsp; Alphabetically</label>
                                                            </GridItem>

                                                            <div id="report_mentioned_terms"></div>
                                                        </GridContainer>
                                                    </GridItem>
                                                </GridItem>
                                                <GridItem xs={8} sm={8} md={9} id="report_text"/>
                                            </GridContainer>
                                       </GridContainer>
                                   </GridItem>
                               </div>
                           </CardBody>
                       </Card>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={1}/>
                </GridContainer>

                <div className={"mainFooter"}>
                    <Row>
                        <Col md={1}></Col>
                        <Col md={4}>Supported by the <a target="_blank" rel="noopener noreferrer"
                                                        href="https://itcr.cancer.gov/">National Cancer
                            Institute's Information Technology for Cancer Research</a> initiative. (Grant #U24CA248010)</Col>
                        <Col md={1}></Col>
                        <Col md={5}>©2021 Harvard Medical School, University of Pittsburgh, and Vanderbilt University Medical
                            Center.</Col>
                        <Col md={1}></Col>
                    </Row>
                </div>
            </span>
        )
    }
}

export default Patient
