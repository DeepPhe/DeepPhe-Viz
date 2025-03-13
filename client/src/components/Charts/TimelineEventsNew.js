import React from "react";
import * as d3 from "d3v4";

const baseUri = "http://localhost:3001/api";
const transitionDuration = 800; // time in ms
let initialHighlightedDoc = "";
let mentionedTerms = "";
let dpheTerms = "";
let lineDataSet = [
    { "id": "chemotherapy", "start": "2024-01-01", "end": "2024-03-01", "color": "rgb(140, 86, 75)" },
    { "id": "procedure", "start": "2024-02-15", "end": "2024-05-10", "color": "rgb(44, 160, 44)" },
    { "id": "intravenous administration", "start": "2024-04-01", "end": "2024-06-30", "color": "rgb(31, 119, 180)" },
    { "id": "reconstructions", "start": "2024-01-14", "end": "2024-02-30", "color": "rgb(31, 119, 180)" },
    { "id": "reduction", "start": "2024-01-20", "end": "2024-02-30", "color": "rgb(31, 1, 180)" },
    { "id": "mammoplasty", "start": "2024-03-01", "end": "2024-09-30", "color": "rgb(31, 119, 180)" },
    { "id": "enlarged", "start": "2024-08-01", "end": "2024-09-30", "color": "rgb(31, 119, 80)" },
    { "id": "treatment", "start": "2024-10-01", "end": "2024-12-30", "color": "rgb(49, 163, 84)" }
];

let reportTextRight = "";
export { mentionedTerms };
export { reportTextRight };

export default class Timeline extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            json: null,
            patientId: this.props.patientId,
        };
        this.getUrl.bind(this);
        this.fetchData.bind(this);
        this.setReportId = this.props.setReportId;
        this.patientJson = props.patientJson;
        this.reportId = props.reportId;
        this.svgContainerId = props.svgContainerId;
    }



    fetchTSVData = async () => {
        try {
            const response = await fetch("/unsummarized_output.tsv"); // Fetch from public folder
            if (!response.ok) throw new Error("Failed to load file");

            const text = await response.text(); // Read as text
            return this.parseTSV(text); // Convert to structured data
        } catch (error) {
            console.error("Error loading TSV:", error);
            return null;
        }
    };

    // Function to parse TSV text into an object
    parseTSV = (tsvText) => {
        const lines = tsvText.trim().split("\n"); // Split by lines
        const headers = lines[0].split("\t").map(h => h.trim()); // Trim headers

        const chemoCounts = {}; // Dictionary to track 'chemoText name' counts
        // const chemoSet = new Set(); // Set to track unique 'chemo_text' values
        // const tLinkSet = new Set();

        const data = lines.slice(1).map(line => {
            const values = line.split("\t"); // Split the line into columns by tab

            const obj = headers.reduce((acc, header, index) => {
                let value = values[index]?.trim()?.replace(/^"|"$/g, ''); // Trim and remove quotes

                if (header === "chemo_text"){
                    value = value.toLowerCase()
                }

                acc[header] = value;
                return acc;
            }, {});

            const chemoName = obj["chemo_text"];
            if (chemoName) {
                chemoCounts[chemoName] = (chemoCounts[chemoName] || 0) + 1;
            }
            return obj;
        });
        // Include chemoCounts inside the data array as an additional property
        data.chemoTextCounts = chemoCounts;

        return data; // Return data array with chemoCounts included
    };




    getUrl() {
        return (
            "http://localhost:3001/api/patient/" + this.props.patientId + "/timeline"
        );
    }

    fetchData = async (url) => {
        return new Promise(function (resolve, reject) {
            fetch(url).then(function (response) {
                if (response) {
                    resolve(response);
                } else {
                    reject("User not logged in");
                }
            });
        });
    };

    transformTSVData = (data) => {
        return {
            startDates: data.map(d => d.start_date),
            patientId: data.map(d => d.patient_id),
            chemoText: data.map(d => d.chemo_text),
            endDates: data.map(d => d.end_date),
            chemoTextCounts: data.chemoTextCounts,
            noteName : data.map(d => d.note_name),
            tLink : data.map(d => d.tlink)
        };
    }


    async componentDidMount() {
        const response = await this.fetchTSVData();  // Fetch and parse the TSV data
        if (response) {
            // Assuming the response is an array of objects based on the TSV structure
            this.setState({ json: response });

            // Example of how to transform the parsed response into the needed structure
            const transformedData = this.transformTSVData(response);

            console.log(transformedData);  // Check the structure of transformed data

            // Call renderTimeline with the transformed data
            this.renderTimeline(
                this.svgContainerId,
                transformedData.startDates,
                transformedData.patientId,
                transformedData.chemoText,
                transformedData.endDates,
                transformedData.chemoTextCounts,
                transformedData.noteName,
                transformedData.tLink
            );
        }
    }


    renderTimeline = (
        svgContainerId,
        startDates,
        patientId,
        chemoText,
        endDates,
        chemoTextCounts,
        noteName,
        tLink
    ) => {
        // Vertical count position of each report type
        // E.g., "Progress Note" has max 6 vertical reports, "Surgical Pathology Report" has 3
        // then the vertical position of "Progress Note" bottom line is 6, and "Surgical Pathology Report" is 6+3=9
        let verticalPositions = {};
        // Vertical max counts from top to bottom
        // This is used to decide the domain range of mainY and overviewY
        let totalMaxVerticalCounts = 0;

        function createEventData(startDates, endDates, patientIds, chemoTexts) {
            const eventData = [];

            for (let i = 0; i < startDates.length; i++) {
                eventData.push({
                    start: startDates[i],
                    end: endDates[i],
                    patient_id: patientIds[i],
                    chemo_text: chemoTexts[i],
                    tLink: tLink[i]
                });
            }

            return eventData;
        }

        function removeDuplicatesFromChemoAndTlink(){
            //REMOVING DUPLICATES from chemo_text and TLink
            const chemoTextSet = new Set();
            const tLinkSet = new Set();


            for (let i = 0; i < chemoText.length; i++){
                chemoTextSet.add(chemoText[i]);
            }
            for (let i = 0; i < tLink.length; i++){
                tLinkSet.add((tLink[i]));

            }
            chemoText = Array.from(chemoTextSet);
            tLink = Array.from(tLinkSet);
        }

        // Use the order in reportTypes to calculate totalMaxVerticalCounts of each report type
        // to have a consistent report type order
        //console.log("reportTypes: " + reportTypes);
        //console.log("reportData: " + JSON.stringify(reportData));


        if (chemoText !== null) {
            new Set(chemoText).forEach(function (key) {
                // totalMaxVerticalCounts += maxVerticalCountsPerType[key];
                totalMaxVerticalCounts += 1;

                if (typeof verticalPositions[key] === "undefined") {
                    verticalPositions[key] = totalMaxVerticalCounts;
                }
            });
        }

        // function getTotalMaxVerticalCounts()

        const margin = { top: 20, right: 20, bottom: 10, left: 250 };
        const mainChemoTextRowHeightPerCount = 16;
        const overviewChemoTextRowHeightPerCount = 3;

        const legendHeight = 22;
        const legendSpacing = 2;
        const widthPerLetter = 12;
        const episodeLegendAnchorPositionX = 60;
        const episodeLegendAnchorPositionY = 6;

        const gapBetweenlegendAndMain = 5;

        const width = 1000;
        // Dynamic height based on vertical counts
        const height =
            totalMaxVerticalCounts * mainChemoTextRowHeightPerCount * 2;

        const pad = 25;

        // Dynamic height based on vertical counts
        const overviewHeight =
            totalMaxVerticalCounts * overviewChemoTextRowHeightPerCount;

        const ageAreaHeight = 16;
        const ageAreaBottomPad = 10;

        const reportMainRadius = 5;
        const reportOverviewRadius = 1.5;

        // Set the timeline start date 10 days before the min date
        // and end date 10 days after the max date
        const numOfDays = 100;

        // Gap between texts and mian area left border
        const textMargin = 10;

        // https://github.com/d3/d3-time-format#d3-time-format
        // const formatTime = d3.timeFormat("%Y-%m-%d");
        // const parseTime = d3.timeParse("%Y-%m-%d");
        const eventData = createEventData(startDates, endDates, patientId, chemoText);


        // Convert string to date
        if (eventData !== null) {

            const minStartDate = new Date(startDates.reduce((min, date) => (new Date(date) < new Date(min) ? date : min)));
            const maxEndDate = new Date(endDates.reduce((max, date) => (new Date(date) > new Date(max) ? date : max)));

            let mainX = d3
                .scaleTime()
                .domain([minStartDate, maxEndDate])
                .range([0, width]);

            eventData.forEach(function (d) {
                const startDate = new Date(d.start);
                const endDate = new Date(d.end);

                d.formattedStartDate = mainX(startDate);
                d.formattedEndDate = mainX(endDate);
                // console.log(d.formattedStartDate, d.formattedEndDate);
            });

            removeDuplicatesFromChemoAndTlink();


            // Set the start date of the x axis 10 days before the xMinDate
            // let startDate = new Date(xMinDate);
            // startDate.setDate(startDate.getDate() - numOfDays);

            // Set the end date of the x axis 10 days after the xMaxDate
            // let endDate = new Date(xMaxDate);
            // endDate.setDate(endDate.getDate() + numOfDays);

            // Get the index position of target element in the reportTypes array
            // Need this to position the circles in mainY
            // let getIndex = function (element) {
            //     return reportTypes.indexOf(element);
            // };

            // This is all the possible episodes, each patient may only have some of these
            // we'll need to render the colors consistently across patients
            // TODO: Replace this with TLink
            let allEpisodes = [
                "Pre-diagnostic",
                "Diagnostic",
                "Medical Decision-making",
                "Treatment",
                "Follow-up",
                "Unknown",
            ];

            // Color categories for types of episodes
            // https://bl.ocks.org/pstuffa/3393ff2711a53975040077b7453781a9
            let episodeColors = [
                "rgb(49, 130, 189)",
                "rgb(230, 85, 13)",
                "rgb(49, 163, 84)",
                "rgb(140, 86, 75)",
                "rgb(117, 107, 177)",
                "rgb(99, 99, 99)",
            ];

            let color = d3.scaleOrdinal().domain(allEpisodes).range(episodeColors);

            // Transition used by focus/defocus episode
            let transt = d3
                .transition()
                .duration(transitionDuration)
                .ease(d3.easeLinear);

            // Main area and overview area share the same width

            let overviewX = d3
                .scaleTime()
                .domain([minStartDate, maxEndDate])
                .range([0, width]);

            // Y scale to handle main area

            let mainY = d3
                .scaleLinear()
                .domain([0, totalMaxVerticalCounts])
                .range([0, height]);

            // Y scale to handle overview area
            // console.log("blash", overviewHeight, height)
            let overviewY = d3
                .scaleLinear()
                .domain([0, totalMaxVerticalCounts])
                .range([0, overviewHeight]);

            // Process episode dates
            let episodeSpansData = [];

            // episodes.forEach(function (episode) {
            //     let obj = {};
            //     let datesArr = episodeDates[episode];
            //     let newDatesArr = [];
            //
            //     datesArr.forEach(function (d) {
            //         // Format the date to a human-readable string first, formatTime() takes Date object instead of string
            //         // d.slice(0, 19) returns the time string without the time zone part.
            //         // E.g., "11/28/2012 01:00 AM" from "11/28/2012 01:00 AM AST"
            //         let formattedTimeStr = formatTime(new Date(d.slice(0, 19)));
            //         // Then convert a string back to a date to be used by d3
            //         let date = parseTime(formattedTimeStr);
            //
            //         newDatesArr.push(date);
            //     });
            //
            //     let minDate = d3.min(newDatesArr, function (d) {
            //         return d;
            //     });
            //     let maxDate = d3.max(newDatesArr, function (d) {
            //         return d;
            //     });
            //
            //     // Assemble the obj properties
            //     obj.episode = episode;
            //     obj.startDate = minDate;
            //     obj.endDate = maxDate;
            //
            //     episodeSpansData.push(obj);
            // });

            // Create the container if it doesn't exist
            if (!document.getElementById(svgContainerId)) {
                const container = document.createElement("div");
                container.id = svgContainerId;
                document.body.appendChild(container); // Append to the desired parent (body, or other parent element)
            }

            // SVG
            let svg = d3
                .select("#" + svgContainerId)
                .append("svg")
                .attr("class", "timeline_svg")
                .attr("width", window.innerWidth)
                .attr(
                    "height",
                    margin.top +
                    legendHeight +
                    gapBetweenlegendAndMain +
                    height +
                    pad +
                    overviewHeight +
                    pad +
                    ageAreaHeight +
                    margin.bottom
                );

            // Dynamically calculate the x posiiton of each legend rect
            let episodeLegendX = function (index) {
                let x = 10;

                for (let i = 0; i < index; i++) {
                    // Remove white spaces and hyphens, treat the string as one single word
                    // this yeilds a better (still not perfect) calculation of the x
                    let processedEpisodeStr = tLink[i].replace(/-|\s/g, "");
                    x +=
                        processedEpisodeStr.length * widthPerLetter +
                        i * (reportMainRadius * 2 + legendSpacing);
                }

                return episodeLegendAnchorPositionX + legendSpacing + x;
            };

            let episodeLegendGrp = svg
                .append("g")
                .attr("class", "episode_legend_group")
                .attr("transform", "translate(10, " + margin.top + ")");

            // Overview label text
            episodeLegendGrp
                .append("text")
                .attr("x", episodeLegendAnchorPositionX) // Relative to episodeLegendGrp
                .attr("y", episodeLegendAnchorPositionY)
                .attr("dy", ".5ex")
                .attr("class", "episode_legend_text")
                .attr("text-anchor", "end") // the end of the text string is at the initial current text position
                .text("TLink:");

            // Bottom divider line
            episodeLegendGrp
                .append("line")
                .attr("x1", 0)
                .attr("y1", legendHeight)
                .attr("x2", margin.left + width)
                .attr("y2", legendHeight)
                .attr("class", "legend_group_divider");

            let episodeLegend = episodeLegendGrp
                .selectAll(".episode_legend")
                .data(tLink)
                .enter()
                .append("g")
                .attr("class", "episode_legend");

            episodeLegend
                .append("circle")
                .attr("class", "episode_legend_circle")
                .attr("cx", function (d, i) {
                    return episodeLegendX(i);
                })
                .attr("cy", 6)
                .attr("r", reportMainRadius)
                .style("fill", function (d) {
                    return color(d);
                })
                .style("stroke", function (d) {
                    return color(d);
                })
                // .on("click", function (d) {
                //     // Toggle (hide/show reports of the clicked episode)
                //     let nodes = d3.selectAll("." + episode2CssClass(d));
                //     nodes.each(function () {
                //         let node = d3.select(this);
                //         node.classed("hide", !node.classed("hide"));
                //     });
                //
                //     // Also toggle the episode legend look
                //     let legendCircle = d3.select(this);
                //     let cssClass = "selected_episode_legend_circle";
                //     legendCircle.classed(cssClass, !legendCircle.classed(cssClass));
                // });

            // Legend label text
            episodeLegend
                .append("text")
                .attr("x", function (d, i) {
                    return reportMainRadius * 2 + legendSpacing + episodeLegendX(i);
                })
                .attr("y", 10)
                .attr("class", "episode_legend_text")
                .text(function (d) {
                    return d + " ()";
                })
                // .on("click", function (d, i) {
                //     // Toggle
                //     let legendText = d3.select(this);
                //     let cssClass = "selected_episode_legend_text";
                //
                //     if (legendText.classed(cssClass)) {
                //         legendText.classed(cssClass, false);
                //
                //         // Reset to show all
                //         defocusEpisode();
                //     } else {
                //         // Remove previously added class on other legend text
                //         $(".episode_legend_text").removeClass(cssClass);
                //
                //         legendText.classed(cssClass, true);
                //
                //         // episodeSpansData maintains the same order of episodes as the episodes array
                //         // so we can safely use i to get the corresponding startDate and endDate
                //         let episodeSpanObj = episodeSpansData[i];
                //         focusEpisode(episodeSpanObj);
                //     }
                // });

            // Specify a specific region of an element to display, rather than showing the complete area
            // Any parts of the drawing that lie outside of the region bounded by the currently active clipping path are not drawn.
            svg
                .append("defs")
                .append("clipPath")
                .attr("id", "main_area_clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height + gapBetweenlegendAndMain);

            setTimeout(() => {
                d3.select("#main_area_clip rect")
                    .attr("width", 2000)
                    .attr("height", 2000);
                console.log("Forced ClipPath Update:", d3.select("#main_area_clip rect").attr("height"));
            }, 100);


            let update = function () {
                // Update the episode bars
                d3.selectAll(".episode_bar")
                    .attr("x", function (d) {
                        return mainX(d.startDate) - reportMainRadius;
                    })
                    .attr("width", function (d) {
                        return (
                            mainX(d.endDate) - mainX(d.startDate) + reportMainRadius * 2
                        );
                    });

                // Update main area
                d3.selectAll(".main_report").attr("cx", function (d) {
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
                overview
                    .select(".brush")
                    .call(brush.move, mainX.range().map(transform.invertX, transform));

                // Also need to update the position of custom brush handles
                // First we need to get the current brush selection
                // https://github.com/d3/d3-brush#brushSelection
                // The node desired in the argument for d3.brushSelection is the g element corresponding to your brush.
                let selection = d3.brushSelection(overviewBrush.node());

                // Then translate the x of each custom brush handle
                showAndMoveCustomBrushHandles(selection);
            };

            // Zoom rect that covers the main main area
            let zoom = d3
                .zoom()
                .scaleExtent([1, Infinity])
                .translateExtent([
                    [0, 0],
                    [width, height],
                ])
                .extent([
                    [0, 0],
                    [width, height],
                ])
                .on("zoom", zoomed);

            // Appending zoom rect after the main area will prevent clicking on the report circles/
            // So we need to create the zoom panel first
            // svg
            //     .append("rect")
            //     .attr("class", "zoom")
            //     .attr("width", width)
            //     .attr("height", height + gapBetweenlegendAndMain)
            //     .attr(
            //         "transform",
            //         "translate(" + margin.left + "," + (margin.top + legendHeight) + ")"
            //     )
            //     .call(zoom);

            // Main area
            // Create main area after zoom panel, so we can select the report circles
            let main = svg
                .append("g")
                .attr("class", "main")
                .attr(
                    "transform",
                    "translate(" +
                    margin.left +
                    "," +
                    (margin.top + legendHeight + gapBetweenlegendAndMain) +
                    ")"
                );

            // Encounter ages
            let age = svg
                .append("g")
                .attr("class", "age")
                .attr(
                    "transform",
                    "translate(" +
                    margin.left +
                    "," +
                    (margin.top +
                        legendHeight +
                        gapBetweenlegendAndMain +
                        height +
                        pad) +
                    ")"
                );

            // Mini overview
            let overview = svg
                .append("g")
                .attr("class", "overview")
                .attr(
                    "transform",
                    "translate(" +
                    margin.left +
                    "," +
                    (margin.top +
                        legendHeight +
                        gapBetweenlegendAndMain +
                        height +
                        pad +
                        ageAreaHeight +
                        ageAreaBottomPad) +
                    ")"
                );

            // TODO: This needs to change to getReportLinePostionY
            let getReportCirclePositionY = function (
                d,
                yScaleCallback,
                chemoTextRowHeightPerCount
            ) {
                // let arr = reportsGroupedByDateAndTypeObj[d.date][d.type];

                // if (arr.length > 1) {
                //     let index = 0;
                //     for (let i = 0; i < arr.length; i++) {
                //         if (arr[i].id === d.id) {
                //             index = i;
                //             break;
                //         }
                //     }
                //
                //     // The height of per chunk
                //     let h =
                //         (maxVerticalCountsPerType[d.type] * chemoTextRowHeightPerCount) /
                //         arr.length;
                //     return (
                //         yScaleCallback(verticalPositions[d.type]) -
                //         ((arr.length - (index + 1)) * h + h / 2)
                //     );
                // } else {
                //     // Vertically center the dot if only one
                //     return (
                //         yScaleCallback(verticalPositions[d.type]) -
                //         (chemoTextRowHeightPerCount * maxVerticalCountsPerType[d.type]) /
                //         2
                //     );
                // }
            };



            // let getReportLinPositionY = function (
            //     d,
            //
            // )

            // Episode interval spans
            // let focusEpisode = function (episode) {
            //     // Here we we add extra days before the start and after the end date to have a little cushion
            //     let daysDiff = Math.floor(
            //         (episode.endDate - episode.startDate) / (1000 * 60 * 60 * 24)
            //     );
            //     let numOfDays = daysDiff > 30 ? 3 : 1;
            //
            //     // setDate() will change the start and end dates, and we still need the origional dates to update the episode bar
            //     // so we clone the date objects
            //     let newStartDate = new Date(episode.startDate.getTime());
            //     let newEndDate = new Date(episode.endDate.getTime());
            //
            //     // The setDate() method sets the day of the month to the date object.
            //     newStartDate.setDate(newStartDate.getDate() - numOfDays);
            //     newEndDate.setDate(newEndDate.getDate() + numOfDays);
            //
            //     // Span the episode coverage across the whole main area using this new domain
            //     mainX.domain([newStartDate, newEndDate]);
            //
            //     let transt = d3
            //         .transition()
            //         .duration(transitionDuration)
            //         .ease(d3.easeLinear);
            //
            //     // Move the brush with transition
            //     // The brush move will cause the report circles move accordingly
            //     // So no need to call update() with transition
            //     // https://github.com/d3/d3-selection#selection_call
            //     //Can also use brush.move(d3.select(".brush"), [overviewX(newStartDate), overviewX(newEndDate)]);
            //     overview
            //         .select(".brush")
            //         .transition(transt)
            //         .call(brush.move, [overviewX(newStartDate), overviewX(newEndDate)]);
            // };

            // let defocusEpisode = function () {
            //     // Reset the mainX domain
            //     mainX.domain([startDate, endDate]);
            //
            //     // Move the brush with transition
            //     // https://github.com/d3/d3-selection#selection_call
            //     //Can also use brush.move(d3.select(".brush"), [overviewX(newStartDate), overviewX(newEndDate)]);
            //     overview
            //         .select(".brush")
            //         .transition(transt)
            //         .call(brush.move, [overviewX(startDate), overviewX(endDate)]);
            // };

            // function dateToX(id) {
            //     const totalDuration = endDate - startDate;
            //     return minX + ((new Date(date) - startDate) / totalDuration) * svgWidth;
            // }

            // function idToX(id, dataSet, scale) {
            //     let entry = dataSet.find(d => d.id === id);
            //     if (!entry) return null;
            //
            //     // Convert the start date to a Date object
            //     const startDate = new Date(entry.start);
            //
            //     if (isNaN(startDate)) {
            //         console.error(`Invalid start date: ${entry.start}`);
            //         return null;
            //     }
            //
            //     return scale(startDate); // Now using a Date object
            // }

            // function idToX2(id, dataSet, scale) {
            //     let entry = dataSet.find(d => d.id === id);
            //     if (!entry) return null;
            //
            //     // Convert the end date to a Date object
            //     const endDate = new Date(entry.end);
            //
            //     if (isNaN(endDate)) {
            //         console.error(`Invalid end date: ${entry.end}`);
            //         return null;
            //     }
            //
            //     return scale(endDate); // Now using a Date object
            // }
            function getProcedureY(label, chemoText, verticalPositions, mainY) {
                const found = chemoText.find(d => d === label);
                if (found) {
                    return mainY(verticalPositions[found] - 1 /2);
                }
                return null; // Return null if not found
            }

            const yCoord = getProcedureY("procedure", chemoText, verticalPositions, mainY);
            console.log(yCoord);


            // Mian report type divider lines
            // Put this before rendering the report dots so the enlarged dot on hover will cover the divider line
            // console.log(chemoText)
            main
                .append("g")
                .selectAll(".report_type_divider")
                // Don't create line for the first type
                .data(chemoText)
                .enter()
                .append("line")
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
            main
                .append("g")
                .selectAll(".report_type_label")
                .data(chemoText)
                .enter()
                .append("text")
                .text(function (d) {
                    return d + " (" + chemoTextCounts[d] + "):";
                })
                .attr("x", -textMargin) // textMargin on the left of main area
                .attr("y", function (d, i) {
                    return mainY(
                        verticalPositions[d] - 1 / 2
                    );
                })
                .attr("dy", ".5ex")
                .attr("class", "report_type_label");


            // Report dots in main area
            // Reference the clipping path that shows the report dots
            const colorScale = d3.scaleOrdinal(d3.schemeCategory10); // D3 provides color schemes

            let mainReports = main
                .append("g")
                .attr("clip-path", "url(#main_area_clip)");
            // const that = this;
            // Report circles in main area
            mainReports
                .selectAll(".main_report")
                .data(eventData)
                .enter()
                .append("g")
                .append("line")
                .attr("class", function (d) {
                    return "main_report ";
                })
                // .attr("id", function (d) {
                //     // Prefix with "main_"
                //     return "main_" + d.id;
                // })
                .attr("data-episode", function (d) {
                    // For debugging
                    // console.log(d);
                    // console.log(d.color);
                    // console.log(verticalPositions[d.id] * 16)
                    console.log(d);
                    return d.id;
                })
                .attr("x1", function (d) {
                    return d.formattedStartDate; // Convert the start date to x1
                })
                .attr("x2", function (d) {
                    return d.formattedEndDate; // Convert the end date to x2
                })
                .attr("y1", function (d) {
                    // console.log(`y1 for ${d.id}:`, y1); // Log the y1 value
                    return getProcedureY(d.chemo_text, chemoText, verticalPositions, mainY);
                })
                .attr("y2", function (d) {
                    // console.log(`y2 for ${d.id}:`, y2); // Log the y2 value
                    return getProcedureY(d.chemo_text, chemoText, verticalPositions, mainY);
                })
                // .style("fill", function (d) {
                //     return color(d.episode);
                // })
                .attr("stroke", (d, i) => colorScale(i))
                .attr("stroke-width", 3);
                // .on("click", function (d) {
                //     $("#docs").show();
                //     // Check to see if this report is one of the fact-based reports that are being highlighted
                //     // d.id has no prefix, just raw id
                //     if (Object.keys(factBasedReports).indexOf(d.id) === -1) {
                //         // Remove the fact related highlighting
                //         removeFactBasedHighlighting(d.id);
                //     }
                //
                //     // Highlight the selected report circle with solid fill and thicker stroke
                //     highlightSelectedTimelineReport(d.id);
                //
                //     // And show the report content
                //     $("#report_instance").show();
                //     that.setReportId(d.id);
                //     //that.setReportId("fake_patient1_fake_patient1_04032024_225414_fake_patient1_doc8_SP_8_04032024_225414_M_42")
                //     //that.getReport(d.id, "", that.patientJson);
                // });


            // Main area x axis
            // https://github.com/d3/d3-axis#axisBottom
            let xAxis = d3
                .axisBottom(mainX)
                // https://github.com/d3/d3-axis#axis_tickSizeInner
                .tickSizeInner(5)
                .tickSizeOuter(0)
                // Abbreviated month format
                .tickFormat(d3.timeFormat("%b"));

            // Append x axis to the bottom of main area
            main
                .append("g")
                .attr("class", "main-x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            // Encounter ages
            age
                .append("text")
                .attr("x", -textMargin)
                .attr("y", ageAreaHeight / 2) // Relative to the overview area
                .attr("dy", ".5ex")
                .attr("class", "age_label")
                .text("Patient Age");

            // Patient's first and last encounter dates and corresponding ages
            // We use the dates to render x position
            let encounterDates = [minStartDate, maxEndDate];
            // We use the calculated ages to render the text of age
            let encounterAges = [
                53,
                53,
            ];

            age
                .selectAll(".encounter_age")
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
            age
                .selectAll(".encounter_age_guideline")
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
            overview
                .append("text")
                .attr("x", -textMargin)
                .attr("y", overviewHeight / 2) // Relative to the overview area
                .attr("dy", ".5ex")
                .attr("class", "overview_label")
                .text("Timeline events");

            // Report dots in overview area
            // No need to use clipping path since the overview area contains all the report dots
            overview
                .append("g")
                .selectAll(".overview_report")
                // .data(reportData)
                .enter()
                .append("g")
                .append("circle")
                .attr("id", function (d) {
                    // Prefix with "overview_"
                    return "overview_" + d.id;
                })
                .attr("class", "overview_report")
                .attr("r", reportOverviewRadius)
                .attr("cx", function (d) {
                    return overviewX(d.formattedDate);
                })
                .attr("cy", function (d) {
                    return getReportCirclePositionY(
                        d,
                        overviewY,
                        overviewChemoTextRowHeightPerCount
                    );
                })
                .style("fill", function (d) {
                    return color(d.episode);
                });

            // Overview x axis
            let overviewXAxis = d3
                .axisBottom(overviewX)
                .tickSizeInner(5)
                .tickSizeOuter(0)
                // Abbreviated month format
                .tickFormat(d3.timeFormat("%b"));

            // Append x axis to the bottom of overview area
            overview
                .append("g")
                .attr("class", "overview-x-axis")
                .attr("transform", "translate(0, " + overviewHeight + ")")
                .call(overviewXAxis);

            // Add brush to overview
            let overviewBrush = overview.append("g").attr("class", "brush");

            // Add custom brush handles
            let customBrushHandlesData = [{ type: "w" }, { type: "e" }];

            // Function expression to create custom brush handle path
            let createCustomBrushHandle = function (d) {
                let e = +(d.type === "e"),
                    x = e ? 1 : -1,
                    y = overviewHeight / 2;

                return (
                    "M" +
                    0.5 * x +
                    "," +
                    y +
                    "A6,6 0 0 " +
                    e +
                    " " +
                    6.5 * x +
                    "," +
                    (y + 6) +
                    "V" +
                    (2 * y - 6) +
                    "A6,6 0 0 " +
                    e +
                    " " +
                    0.5 * x +
                    "," +
                    2 * y +
                    "ZM" +
                    2.5 * x +
                    "," +
                    (y + 8) +
                    "V" +
                    (2 * y - 8) +
                    "M" +
                    4.5 * x +
                    "," +
                    (y + 8) +
                    "V" +
                    (2 * y - 8)
                );
            };

            // Add two custom brush handles
            let customBrushHandle = overviewBrush
                .selectAll(".handle--custom")
                .data(customBrushHandlesData)
                .enter()
                .append("path")
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
                svg
                    .select(".zoom")
                    .call(
                        zoom.transform,
                        d3.zoomIdentity
                            .scale(width / (selection[1] - selection[0]))
                            .translate(-selection[0], 0)
                    );
            };

            // D3 brush
            let brush = d3
                .brushX()
                .extent([
                    [0, 0],
                    [width, overviewHeight],
                ])
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
            svg
                .append("foreignObject")
                .attr("id", "reset")
                .attr(
                    "transform",
                    "translate(10, " +
                    (margin.top +
                        pad +
                        height +
                        pad +
                        ageAreaHeight +
                        ageAreaBottomPad +
                        overviewHeight) +
                    ")"
                )
                .append("xhtml:body")
                .html("<button>Reset</button>");
        }
    };

        // this.fetchData(url).then(function (response) {
        //     response.json().then(function (jsonResponse) {
        //         processTimelineResponse(jsonResponse);
        //     });
        // });
    // }

    render() {
        return <div className="Timeline" id={this.svgContainerId}></div>;
    }
}
