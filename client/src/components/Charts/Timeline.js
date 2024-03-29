import React from "react";
import * as d3 from "d3v4";
import * as $ from "jquery";

const baseUri = "http://localhost:3001/api";
const transitionDuration = 800; // time in ms

export default class Timeline extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            json: null,
            patientId: this.props.patientId
        };
        this.getUrl.bind(this);
        this.fetchData.bind(this);
    }


    getUrl() {

        return 'http://localhost:3001/api/patient/' + this.props.patientId + '/timeline'
    }

    fetchData = async (url) => {
        return new Promise(function (resolve, reject) {
            fetch(url).then(function (response) {
                if (response) {
                    resolve(response);
                } else {
                    reject('User not logged in');
                }
            });
        });
    }

    componentDidMount() {
        let url = this.getUrl(this.props.patientId);
        const processTimelineResponse = (response) => {
            this.setState({json: response});
            renderTimeline("timeline", response.patientInfo, response.reportTypes, response.typeCounts, response.maxVerticalCountsPerType, response.episodes, response.episodeCounts, response.episodeDates, response.reportData, response.reportsGroupedByDateAndTypeObj)
        }
        const renderTimeline = (svgContainerId, patientInfo, reportTypes, typeCounts, maxVerticalCountsPerType, episodes, episodeCounts, episodeDates, reportData, reportsGroupedByDateAndTypeObj) => {
            // console.log(reportTypes)

            //next line might not belong
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

            // Get fact details by ID
// We need patientId because sometimes a fact may have matching TextMention nodes from different paitents
//             function getFact(patientId, factId) {
//                 $.ajax({
//                     url: baseUri + '/fact/' + patientId + '/' + factId,
//                     method: 'GET',
//                     async : true,
//                     dataType : 'json'
//                 })
//                     .done(function(response) {
//                         let docIds = Object.keys(response.groupedTextProvenances);
//
//                         // Render the html fact info
//                         let factHtml = '<ul class="fact_detail_list">'
//                             + '<li><span class="fact_detail_label">Selected Fact:</span> ' + response.sourceFact.prettyName + '</li>';
//
//                         if (docIds.length > 0) {
//                             factHtml += '<li class="clearfix"><span class="fact_detail_label">Related Text Provenances in Source Reports:</span><ul>';
//
//                             docIds.forEach(function(id) {
//                                 let group = response.groupedTextProvenances[id];
//                                 // Use a combination of reportId and factId to identify this element
//                                 factHtml += '<li class="grouped_text_provenance"><span class="fact_detail_report_id"><i class="fa fa-file-o"></i> <span id="' + id + "_" + factId + '" data-report="' + id + '" data-fact="' + factId + '" class="fact_based_report_id">' + id + '</span> --></span><ul id="terms_list_' + id + "_" + factId + '">';
//
//                                 let innerHtml = "";
//                                 group.textCounts.forEach(function(textCount) {
//                                     innerHtml += '<li><span class="fact_based_term_span">' + textCount.text + '</span> <span class="count">(' + textCount.count + ')</span></li>';
//                                 });
//
//                                 factHtml += innerHtml + '</ul></li>';
//                             });
//                         }
//
//                         factHtml += '</ul>';
//
//                         // Fade in the fact detail. Need to hide the div in order to fade in.
//                         $('#fact_detail').hide().html(factHtml).fadeIn('slow');
//
//                         // Also highlight the report and corresponding text mentions if this fact has text provanences in the report
//                         // Highlight report circles in timeline
//                         if (docIds.length > 0) {
//                             // Remove the previouly fact-based highlighting
//                             $('.main_report').removeClass("fact_highlighted_report");
//
//                             docIds.forEach(function(id) {
//                                 // Set fill-opacity to 1
//                                 highlightReportBasedOnFact(id);
//
//                                 // Add to the global factBasedReports object for highlighting
//                                 // the fact-based terms among all extracted terms of a given report
//                                 if (typeof factBasedReports[id] === "undefined") {
//                                     factBasedReports[id] = {};
//                                 }
//
//                                 if (typeof factBasedReports[id][factId] === "undefined") {
//                                     // Define an array for each factId
//                                     factBasedReports[id][factId] = [];
//                                 }
//
//                                 // If not already added, add terms
//                                 // Otherwise reuse what we have in the memory
//                                 if (factBasedReports[id][factId].length === 0) {
//                                     // Only store the unique text
//                                     response.groupedTextProvenances[id].terms.forEach(function(obj) {
//                                         if (factBasedReports[id][factId].indexOf(obj.term) === -1) {
//                                             factBasedReports[id][factId].push(obj.term);
//                                         }
//                                     });
//                                 }
//                             });
//
//                             // Also show the content of the first report
//                             // The docIds is sorted
//                             getReport(docIds[0], factId);
//
//                             // And highlight the current displaying report circle with a thicker stroke
//                             highlightSelectedTimelineReport(docIds[0])
//                         } else {
//                             // Dehighlight the previously selected report dot
//                             const css = "selected_report";
//                             $('.main_report').removeClass(css);
//                             $('.overview_report').removeClass(css);
//                             // Also remove the "fact_highlighted_report" class
//                             $('.main_report').removeClass("fact_highlighted_report");
//
//                             // And empty the report area
//                             $('#report_id').empty();
//                             $('#report_mentioned_terms').empty();
//                             $('#report_text').empty();
//                         }
//                     })
//                     .fail(function () {
//                         console.log("Ajax error - can't get fact");
//                     });
//             }
//             function highlightReportBasedOnFact(reportId) {
//                 d3.select('#main_' + reportId).classed("fact_highlighted_report", true);
//             }

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

                        textFragments.push('<span class="' + cssClass + '">' + reportText.substring(textMention.beginOffset, textMention.endOffset) + '</span>');
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
                        mentionedTerms = mentionedTerms.sort((a, b) => (parseInt(a.begin) > parseInt(b.begin)) ? 1 : -1)

                        mentionedTerms.forEach(function (obj) {
                            console.log(JSON.stringify(obj))
                            let fact_based_term_class = '';
                            if (factBasedTerms.indexOf(obj.term) !== -1) {
                                factBasedTermsWithPosition.push(obj);
                                fact_based_term_class = ' fact_based_term';
                            }
                            renderedMentionedTerms += '<li class="report_mentioned_term' + fact_based_term_class + '" data-begin="' + obj.begin + '" data-end="' + obj.end + '">' + obj.term + '</li>';
                        });
                        renderedMentionedTerms += "</ol>";

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

            function removeFactBasedHighlighting(reportId) {
                $('.fact').removeClass("highlighted_fact");
                $('.main_report').removeClass("fact_highlighted_report");
                // Also remove the fact detail
                $('#fact_detail').hide().html("").fadeIn('slow');
            }

            function episode2CssClass(episode) {
                return episode.replace(/\s+/g, '-').toLowerCase();
            }

            // Vertical count position of each report type
            // E.g., "Progress Note" has max 6 vertical reports, "Surgical Pathology Report" has 3
            // then the vertical position of "Progress Note" bottom line is 6, and "Surgical Pathology Report" is 6+3=9
            let verticalPositions = {};
            // Vertical max counts from top to bottom
            // This is used to decide the domain range of mainY and overviewY
            let totalMaxVerticalCounts = 0;

            // Use the order in reportTypes to calculate totalMaxVerticalCounts of each report type
            // to have a consistent report type order
            //console.log("reportTypes: " + reportTypes);
            //console.log("reportData: " + JSON.stringify(reportData));
            if (reportTypes !== null) {
                reportTypes.forEach(function (key) {
                    totalMaxVerticalCounts += maxVerticalCountsPerType[key];
                    if (typeof verticalPositions[key] === 'undefined') {
                        verticalPositions[key] = totalMaxVerticalCounts;
                    }
                })
            }

            const margin = {top: 20, right: 20, bottom: 10, left: 250};
            const mainReportTypeRowHeightPerCount = 16;
            const overviewReportTypeRowHeightPerCount = 3;

            const legendHeight = 22;
            const legendSpacing = 2;
            const widthPerLetter = 12;
            const episodeLegendAnchorPositionX = 60;
            const episodeLegendAnchorPositionY = 6;

            const gapBetweenlegendAndMain = 5;

            const width = 1000;
            // Dynamic height based on vertical counts
            const height = totalMaxVerticalCounts * mainReportTypeRowHeightPerCount * 2;

            const pad = 25;

            // Dynamic height based on vertical counts
            const overviewHeight = totalMaxVerticalCounts * overviewReportTypeRowHeightPerCount;

            const ageAreaHeight = 16;
            const ageAreaBottomPad = 10;

            const reportMainRadius = 5;
            const reportOverviewRadius = 1.5;

            // Set the timeline start date 10 days before the min date
            // and end date 10 days after the max date
            const numOfDays = 100

            // Gap between texts and mian area left border
            const textMargin = 10;

            // https://github.com/d3/d3-time-format#d3-time-format
            const formatTime = d3.timeFormat("%Y-%m-%d");
            const parseTime = d3.timeParse("%Y-%m-%d");

            // Convert string to date
            if (reportData !== null) {
                reportData.forEach(function (d) {
                    // Format the date to a human-readable string first, formatTime() takes Date object instead of string
                    // d.origTime.slice(0, 19) returns the time string without the time zone part.
                    // E.g., "2012/11/28" from "11/28/2012 01:00 AM AST"
                    let formattedDateStr = formatTime(new Date(d.date));
                    // Then convert a string back to a date to be used by d3
                    d.formattedDate = parseTime(formattedDateStr);
                });

                // The earliest report date
                let xMinDate = d3.min(reportData, function (d) {
                    return d.formattedDate;
                });

                // Set the start date of the x axis 10 days before the xMinDate
                let startDate = new Date(xMinDate);
                startDate.setDate(startDate.getDate() - numOfDays);

                // The latest report date
                let xMaxDate = d3.max(reportData, function (d) {
                    return d.formattedDate;
                });

                // Set the end date of the x axis 10 days after the xMaxDate
                let endDate = new Date(xMaxDate);
                endDate.setDate(endDate.getDate() + numOfDays);

                // Get the index position of target element in the reportTypes array
                // Need this to position the circles in mainY
                // let getIndex = function (element) {
                //     return reportTypes.indexOf(element);
                // };


                // This is all the possible episodes, each patient may only have some of these
                // but we'll need to render the colors consistently across patients
                let allEpisodes = [
                    'Pre-diagnostic',
                    'Diagnostic',
                    'Medical Decision-making',
                    'Treatment',
                    'Follow-up',
                    'Unknown'
                ];

                // Color categories for types of episodes
                // https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
                let episodeColors = [
                    'rgb(49, 130, 189)',
                    'rgb(230, 85, 13)',
                    'rgb(49, 163, 84)',
                    'rgb(140, 86, 75)',
                    'rgb(117, 107, 177)',
                    'rgb(99, 99, 99)'
                ];

                let color = d3.scaleOrdinal()
                    .domain(allEpisodes)
                    .range(episodeColors);

                // Transition used by focus/defocus episode
                let transt = d3.transition()
                    .duration(transitionDuration)
                    .ease(d3.easeLinear);

                // Main area and overview area share the same width
                let mainX = d3.scaleTime()
                    .domain([startDate, endDate])
                    .range([0, width]);

                let overviewX = d3.scaleTime()
                    .domain([startDate, endDate])
                    .range([0, width]);

                // Y scale to handle main area
                let mainY = d3.scaleLinear()
                    .domain([0, totalMaxVerticalCounts])
                    .range([0, height]);

                // Y scale to handle overview area
                let overviewY = d3.scaleLinear()
                    .domain([0, totalMaxVerticalCounts])
                    .range([0, overviewHeight]);

                // Process episode dates
                let episodeSpansData = [];

                episodes.forEach(function (episode) {
                    let obj = {};
                    let datesArr = episodeDates[episode];
                    let newDatesArr = [];

                    datesArr.forEach(function (d) {
                        // Format the date to a human-readable string first, formatTime() takes Date object instead of string
                        // d.slice(0, 19) returns the time string without the time zone part.
                        // E.g., "11/28/2012 01:00 AM" from "11/28/2012 01:00 AM AST"
                        let formattedTimeStr = formatTime(new Date(d.slice(0, 19)));
                        // Then convert a string back to a date to be used by d3
                        let date = parseTime(formattedTimeStr);

                        newDatesArr.push(date);
                    });

                    let minDate = d3.min(newDatesArr, function (d) {
                        return d;
                    });
                    let maxDate = d3.max(newDatesArr, function (d) {
                        return d;
                    });

                    // Assemble the obj properties
                    obj.episode = episode;
                    obj.startDate = minDate;
                    obj.endDate = maxDate;

                    episodeSpansData.push(obj);
                });

                // SVG
                let svg = d3.select("#" + svgContainerId).append("svg")
                    .attr("class", "timeline_svg")
                    .attr("width", margin.left + width + margin.right)
                    .attr("height", margin.top + legendHeight + gapBetweenlegendAndMain + height + pad + overviewHeight + pad + ageAreaHeight + margin.bottom);

                // Dynamically calculate the x posiiton of each legend rect
                let episodeLegendX = function (index) {
                    let x = 10;

                    for (let i = 0; i < index; i++) {
                        // Remove white spaces and hyphens, treat the string as one single word
                        // this yeilds a better (still not perfect) calculation of the x
                        let processedEpisodeStr = episodes[i].replace(/-|\s/g, "");
                        x += processedEpisodeStr.length * widthPerLetter + i * (reportMainRadius * 2 + legendSpacing);
                    }

                    return episodeLegendAnchorPositionX + legendSpacing + x;
                };

                let episodeLegendGrp = svg.append("g")
                    .attr('class', 'episode_legend_group')
                    .attr("transform", "translate(10, " + margin.top + ")");

                // Overview label text
                episodeLegendGrp.append("text")
                    .attr("x", episodeLegendAnchorPositionX) // Relative to episodeLegendGrp
                    .attr("y", episodeLegendAnchorPositionY)
                    .attr("dy", ".5ex")
                    .attr('class', 'episode_legend_text')
                    .attr("text-anchor", "end") // the end of the text string is at the initial current text position
                    .text("Episodes:");

                // Bottom divider line
                episodeLegendGrp.append("line")
                    .attr("x1", 0)
                    .attr("y1", legendHeight)
                    .attr("x2", margin.left + width)
                    .attr("y2", legendHeight)
                    .attr("class", "legend_group_divider");

                let episodeLegend = episodeLegendGrp.selectAll('.episode_legend')
                    .data(episodes)
                    .enter()
                    .append('g')
                    .attr('class', 'episode_legend');

                episodeLegend.append('circle')
                    .attr("class", "episode_legend_circle")
                    .attr('cx', function (d, i) {
                        return episodeLegendX(i);
                    })
                    .attr('cy', 6)
                    .attr('r', reportMainRadius)
                    .style('fill', function (d) {
                        return color(d);
                    })
                    .style('stroke', function (d) {
                        return color(d);
                    })
                    .on("click", function (d) {

                        // Toggle (hide/show reports of the clicked episode)
                        let nodes = d3.selectAll("." + episode2CssClass(d));
                        nodes.each(function () {
                            let node = d3.select(this);
                            node.classed("hide", !node.classed("hide"));
                        });

                        // Also toggle the episode legend look
                        let legendCircle = d3.select(this);
                        let cssClass = "selected_episode_legend_circle";
                        legendCircle.classed(cssClass, !legendCircle.classed(cssClass));
                    });

                // Legend label text
                episodeLegend.append('text')
                    .attr('x', function (d, i) {
                        return reportMainRadius * 2 + legendSpacing + episodeLegendX(i);
                    })
                    .attr('y', 10)
                    .attr('class', 'episode_legend_text')
                    .text(function (d) {
                        return d + " (" + episodeCounts[d] + ")";
                    })
                    .on("click", function (d, i) {

                        // Toggle
                        let legendText = d3.select(this);
                        let cssClass = "selected_episode_legend_text";

                        if (legendText.classed(cssClass)) {
                            legendText.classed(cssClass, false);

                            // Reset to show all
                            defocusEpisode();
                        } else {
                            // Remove previously added class on other legend text
                            $(".episode_legend_text").removeClass(cssClass);

                            legendText.classed(cssClass, true);

                            // episodeSpansData maintains the same order of episodes as the episodes array
                            // so we can safely use i to get the corresponding startDate and endDate
                            let episodeSpanObj = episodeSpansData[i];
                            focusEpisode(episodeSpanObj);
                        }
                    });

                // Specify a specific region of an element to display, rather than showing the complete area
                // Any parts of the drawing that lie outside of the region bounded by the currently active clipping path are not drawn.
                svg.append("defs").append("clipPath")
                    .attr("id", "main_area_clip")
                    .append("rect")
                    .attr("width", width)
                    .attr("height", height + gapBetweenlegendAndMain);

                let update = function () {
                    // Update the episode bars
                    d3.selectAll(".episode_bar")
                        .attr("x", function (d) {
                            return mainX(d.startDate) - reportMainRadius;
                        })
                        .attr('width', function (d) {
                            return mainX(d.endDate) - mainX(d.startDate) + reportMainRadius * 2;
                        });

                    // Update main area
                    d3.selectAll(".main_report")
                        .attr("cx", function (d) {
                            return mainX(d.formattedDate);
                        });

                    // Update the main x axis
                    d3.select(".main-x-axis").call(xAxis);
                };

                // Function expression to handle mouse wheel zoom or drag on main area
                // Need to define this before defining zoom since it's function expression instead of function declariation
                let zoomed = function () {
                    // Ignore zoom-by-brush
                    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") {
                        return;
                    }


                    let transform = d3.event.transform;

                    mainX.domain(transform.rescaleX(overviewX).domain());

                    // Update the report dots in main area
                    update();

                    // Update the overview as moving
                    overview.select(".brush").call(brush.move, mainX.range().map(transform.invertX, transform));

                    // Also need to update the position of custom brush handles
                    // First we need to get the current brush selection
                    // https://github.com/d3/d3-brush#brushSelection
                    // The node desired in the argument for d3.brushSelection is the g element corresponding to your brush.
                    let selection = d3.brushSelection(overviewBrush.node());

                    // Then translate the x of each custom brush handle
                    showAndMoveCustomBrushHandles(selection);
                };

                // Zoom rect that covers the main main area
                let zoom = d3.zoom()
                    .scaleExtent([1, Infinity])
                    .translateExtent([[0, 0], [width, height]])
                    .extent([[0, 0], [width, height]])
                    .on("zoom", zoomed);

                // Appending zoom rect after the main area will prevent clicking on the report circles/
                // So we need to create the zoom panel first
                svg.append("rect")
                    .attr("class", "zoom")
                    .attr("width", width)
                    .attr("height", height + gapBetweenlegendAndMain)
                    .attr("transform", "translate(" + margin.left + "," + (margin.top + legendHeight) + ")")
                    .call(zoom);

                // Main area
                // Create main area after zoom panel, so we can select the report circles
                let main = svg.append("g")
                    .attr("class", "main")
                    .attr("transform", "translate(" + margin.left + "," + (margin.top + legendHeight + gapBetweenlegendAndMain) + ")");

                // Encounter ages
                let age = svg.append("g")
                    .attr("class", "age")
                    .attr("transform", "translate(" + margin.left + "," + (margin.top + legendHeight + gapBetweenlegendAndMain + height + pad) + ")");

                // Mini overview
                let overview = svg.append("g")
                    .attr("class", "overview")
                    .attr("transform", "translate(" + margin.left + "," + (margin.top + legendHeight + gapBetweenlegendAndMain + height + pad + ageAreaHeight + ageAreaBottomPad) + ")");

                let getReportCirclePositionY = function (d, yScaleCallback, reportTypeRowHeightPerCount) {
                    let arr = reportsGroupedByDateAndTypeObj[d.date][d.type];

                    if (arr.length > 1) {
                        let index = 0;
                        for (let i = 0; i < arr.length; i++) {
                            if (arr[i].id === d.id) {
                                index = i;
                                break;
                            }
                        }

                        // The height of per chunk
                        let h = maxVerticalCountsPerType[d.type] * reportTypeRowHeightPerCount / arr.length;
                        return yScaleCallback(verticalPositions[d.type]) - ((arr.length - (index + 1)) * h + h / 2);
                    } else {
                        // Vertically center the dot if only one
                        return yScaleCallback(verticalPositions[d.type]) - reportTypeRowHeightPerCount * maxVerticalCountsPerType[d.type] / 2;
                    }
                };

                // Episode interval spans
                let focusEpisode = function (episode) {
                    // Here we we add extra days before the start and after the end date to have a little cushion
                    let daysDiff = Math.floor((episode.endDate - episode.startDate) / (1000 * 60 * 60 * 24));
                    let numOfDays = daysDiff > 30 ? 3 : 1;

                    // setDate() will change the start and end dates, and we still need the origional dates to update the episode bar
                    // so we clone the date objects
                    let newStartDate = new Date(episode.startDate.getTime());
                    let newEndDate = new Date(episode.endDate.getTime());

                    // The setDate() method sets the day of the month to the date object.
                    newStartDate.setDate(newStartDate.getDate() - numOfDays);
                    newEndDate.setDate(newEndDate.getDate() + numOfDays);

                    // Span the episode coverage across the whole main area using this new domain
                    mainX.domain([newStartDate, newEndDate]);

                    let transt = d3.transition()
                        .duration(transitionDuration)
                        .ease(d3.easeLinear);

                    // Move the brush with transition
                    // The brush move will cause the report circles move accordingly
                    // So no need to call update() with transition
                    // https://github.com/d3/d3-selection#selection_call
                    //Can also use brush.move(d3.select(".brush"), [overviewX(newStartDate), overviewX(newEndDate)]);
                    overview.select(".brush").transition(transt).call(brush.move, [overviewX(newStartDate), overviewX(newEndDate)]);
                };

                let defocusEpisode = function () {
                    // Reset the mainX domain
                    mainX.domain([startDate, endDate]);

                    // Move the brush with transition
                    // https://github.com/d3/d3-selection#selection_call
                    //Can also use brush.move(d3.select(".brush"), [overviewX(newStartDate), overviewX(newEndDate)]);
                    overview.select(".brush").transition(transt).call(brush.move, [overviewX(startDate), overviewX(endDate)]);
                };

                // Mian report type divider lines
                // Put this before rendering the report dots so the enlarged dot on hover will cover the divider line
                main.append("g").selectAll(".report_type_divider")
                    // Don't create line for the first type
                    .data(reportTypes)
                    .enter().append("line")
                    .attr("x1", 0) // relative to main area
                    .attr("y1", function (d) {
                        return mainY(verticalPositions[d]);
                    })
                    .attr("x2", width)
                    .attr("y2", function (d) {
                        return mainY(verticalPositions[d]);
                    })
                    .attr("class", "report_type_divider");

                // Report types texts
                main.append("g").selectAll(".report_type_label")
                    .data(reportTypes)
                    .enter().append("text")
                    .text(function (d) {
                        return d + " (" + typeCounts[d] + "):";
                    })
                    .attr("x", -textMargin) // textMargin on the left of main area
                    .attr("y", function (d, i) {
                        return mainY(verticalPositions[d] - maxVerticalCountsPerType[d] / 2);
                    })
                    .attr("dy", ".5ex")
                    .attr("class", "report_type_label");


                // Report dots in main area
                // Reference the clipping path that shows the report dots
                let mainReports = main.append("g")
                    .attr("clip-path", "url(#main_area_clip)");

                // Report circles in main area
                mainReports.selectAll(".main_report")
                    .data(reportData)
                    .enter().append("g")
                    .append("circle")
                    .attr('class', function (d) {
                        return 'main_report ' + episode2CssClass(d.episode);
                    })
                    .attr("id", function (d) {
                        // Prefix with "main_"
                        return "main_" + d.id;
                    })
                    .attr("data-episode", function (d) {
                        // For debugging
                        return d.episode;
                    })
                    .attr("r", reportMainRadius)
                    .attr("cx", function (d) {
                        return mainX(d.formattedDate);
                    })
                    // Vertically spread the dots with same time
                    .attr("cy", function (d) {
                        return getReportCirclePositionY(d, mainY, mainReportTypeRowHeightPerCount);
                    })
                    .style("fill", function (d) {
                        return color(d.episode);
                    })
                    .style("stroke", function (d) {
                        return color(d.episode);
                    })
                    .on("click", function (d) {

                        $("#docs").show();
                        // Check to see if this report is one of the fact-based reports that are being highlighted
                        // d.id has no prefix, just raw id
                        if (Object.keys(factBasedReports).indexOf(d.id) === -1) {
                            // Remove the fact related highlighting
                            removeFactBasedHighlighting(d.id);
                        }

                        // Highlight the selected report circle with solid fill and thicker stroke
                        highlightSelectedTimelineReport(d.id);

                        // And show the report content
                        $("#report_instance").show();
                        getReport(d.id);
                    });

                // Main area x axis
                // https://github.com/d3/d3-axis#axisBottom
                let xAxis = d3.axisBottom(mainX)
                    // https://github.com/d3/d3-axis#axis_tickSizeInner
                    .tickSizeInner(5)
                    .tickSizeOuter(0)
                    // Abbreviated month format
                    .tickFormat(d3.timeFormat('%b'));

                // Append x axis to the bottom of main area
                main.append("g")
                    .attr("class", "main-x-axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

                // Encounter ages
                age.append("text")
                    .attr("x", -textMargin)
                    .attr("y", ageAreaHeight / 2) // Relative to the overview area
                    .attr("dy", ".5ex")
                    .attr("class", "age_label")
                    .text("Patient Age");

                // Patient's first and last encounter dates and corresponding ages
                // We use the dates to render x position
                let encounterDates = [xMinDate, xMaxDate];
                // We use the calculated ages to render the text of age
                let encounterAges = [patientInfo.firstEncounterAge, patientInfo.lastEncounterAge];

                age.selectAll(".encounter_age")
                    .data(encounterDates)
                    .enter()
                    .append("text")
                    .attr("x", function (d) {
                        return mainX(d);
                    })
                    .attr("y", ageAreaHeight / 2)
                    .attr("dy", ".5ex")
                    .attr("class", "encounter_age")
                    .text(function (d, i) {
                        return encounterAges[i];
                    });

                // Vertical guidelines based on min and max dates (date objects)
                age.selectAll(".encounter_age_guideline")
                    .data(encounterDates)
                    .enter()
                    .append("line")
                    .attr("x1", function (d) {
                        return mainX(d);
                    })
                    .attr("y1", 12)
                    .attr("x2", function (d) {
                        return mainX(d);
                    })
                    .attr("y2", 25)
                    .attr("class", "encounter_age_guideline");

                // Overview label text
                overview.append("text")
                    .attr("x", -textMargin)
                    .attr("y", overviewHeight / 2) // Relative to the overview area
                    .attr("dy", ".5ex")
                    .attr("class", "overview_label")
                    .text("Timeline (" + reportData.length + " reports)");

                // Report dots in overview area
                // No need to use clipping path since the overview area contains all the report dots
                overview.append("g").selectAll(".overview_report")
                    .data(reportData)
                    .enter().append("g").append("circle")
                    .attr('id', function (d) {
                        // Prefix with "overview_"
                        return "overview_" + d.id;
                    })
                    .attr('class', 'overview_report')
                    .attr("r", reportOverviewRadius)
                    .attr("cx", function (d) {
                        return overviewX(d.formattedDate);
                    })
                    .attr("cy", function (d) {
                        return getReportCirclePositionY(d, overviewY, overviewReportTypeRowHeightPerCount);
                    })
                    .style("fill", function (d) {
                        return color(d.episode);
                    });

                // Overview x axis
                let overviewXAxis = d3.axisBottom(overviewX)
                    .tickSizeInner(5)
                    .tickSizeOuter(0)
                    // Abbreviated month format
                    .tickFormat(d3.timeFormat('%b'));

                // Append x axis to the bottom of overview area
                overview.append("g")
                    .attr("class", "overview-x-axis")
                    .attr("transform", "translate(0, " + overviewHeight + ")")
                    .call(overviewXAxis);

                // Add brush to overview
                let overviewBrush = overview.append("g")
                    .attr("class", "brush");

                // Add custom brush handles
                let customBrushHandlesData = [{type: "w"}, {type: "e"}];

                // Function expression to create custom brush handle path
                let createCustomBrushHandle = function (d) {
                    let e = +(d.type === "e"),
                        x = e ? 1 : -1,
                        y = overviewHeight / 2;

                    return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "ZM" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
                };

                // Add two custom brush handles
                let customBrushHandle = overviewBrush.selectAll(".handle--custom")
                    .data(customBrushHandlesData)
                    .enter().append("path")
                    .attr("class", "handle--custom")
                    .attr("cursor", "ew-resize")
                    .attr("d", createCustomBrushHandle)
                    .attr("transform", function (d, i) {
                        // Position the custom handles based on the default selection range
                        let selection = [0, width];
                        return "translate(" + [selection[i], -overviewHeight / 4] + ")";
                    });

                // Function expression of updating custom handles positions
                let showAndMoveCustomBrushHandles = function (selection) {
                    customBrushHandle
                        // First remove the "display: none" added by brushStart to show the handles
                        .style("display", null)
                        // Then move the handles to desired positions
                        .attr("transform", function (d, i) {
                            return "translate(" + [selection[i], -overviewHeight / 4] + ")";
                        });
                };

                // Function expression to create brush function redraw with selection
                // Need to define this before defining brush since it's function expression instead of function declariation
                let brushed = function () {
                    // Ignore brush-by-zoom
                    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") {
                        return;
                    }

                    // Can also use d3.event.selection as an alternative to d3.brushSelection(overviewBrush.node())
                    let selection = d3.brushSelection(overviewBrush.node());

                    // Update the position of custom brush handles
                    showAndMoveCustomBrushHandles(selection);

                    // Set the domain of the main area based on brush selection
                    mainX.domain(selection.map(overviewX.invert, overviewX));

                    update();

                    // Zoom the main area
                    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                        .scale(width / (selection[1] - selection[0]))
                        .translate(-selection[0], 0));
                };

                // D3 brush
                let brush = d3.brushX()
                    .extent([[0, 0], [width, overviewHeight]])
                    // Update the UI on brush move
                    .on("brush", brushed);

                // Applying brush on the overviewBrush element
                // Don't merge this with the overviewBrush definition because
                // brush calls brushed which uses customBrushHandle when it gets called and
                // we can't define overviewBrush before brush if combined.
                overviewBrush
                    // For the first time of loading this page, no brush movement
                    .call(brush)
                    // We use overviewX.range() as the default selection
                    // https://github.com/d3/d3-selection#selection_call
                    // call brush.move and pass overviewX.range() as argument
                    // https://github.com/d3/d3-brush#brush_move
                    .call(brush.move, overviewX.range());

                // Reset button
                svg.append("foreignObject")
                    .attr('id', 'reset')
                    .attr("transform", "translate(10, " + (margin.top + pad + height + pad + ageAreaHeight + ageAreaBottomPad + overviewHeight) + ")")
                    .append("xhtml:body")
                    .html('<button>Reset</button>');
            }

        }

        this.fetchData(url).then(
            function (response) {
                response.json().then(
                    function (jsonResponse) {
                        processTimelineResponse(jsonResponse)
                    })
            });


    }

    render() {
        return (
            <div className="Timeline" id="timeline">

            </div>
        );
    }
}