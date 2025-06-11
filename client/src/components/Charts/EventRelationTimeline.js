import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3v4";
import { appendMentionsToTSV } from '../../scripts/appendConceptAndMention';
import {indexOf, sum} from "lodash";

const baseUri = "http://localhost:3001/api";
const transitionDuration = 800; // time in ms


const laneGroups = {

        // Severity
        'behavior': 'Severity',
        'disease stage qualifier':'Severity',
        'disease grade qualifier': 'Severity',
        'temporal qualifier': 'Severity',
        'severity': 'Severity',
        'pathologic tnm finding': 'Severity',
        'generic tnm finding': 'Severity',

        // Qualifier
        // 'disease qualifier': 'Qualifier',
        // 'property or attribute': 'Qualifier',
        // 'general qualifier': 'Qualifier',
        // 'clinical course of disease': 'Qualifier',
        // 'pathologic process': 'Qualifier',
        // 'quantitative concept': 'Qualifier',
        // 'position': 'Qualifier',

        // Site
        // 'lymph node': 'Site',
        // 'body part': 'Site',
        // 'body fluid or substance': 'Site',
        // 'side': 'Site',
        // 'spatial qualifier': 'Site',
        // 'tissue': 'Site',

        // Finding
        'finding': 'Finding',
        'clinical test result': 'Finding',
        'gene' : 'Finding',
        'gene product': 'Finding',

        // Disease
        'disease or disorder': 'Disease',
        'neoplasm': 'Disease',
        'mass': 'Disease',

        // Treatment
        'pharmacologic substance': 'Treatment',
        'chemo/immuno/hormone therapy regimen': 'Treatment',
        'intervention or procedure': 'Treatment',
        'imaging device': 'Treatment',

        // Other
        'unknown': 'Other'
};

let mentionedTerms = "";
let reportTextRight = "";
export { mentionedTerms };
export { reportTextRight };

export default function EventRelationTimeline (props) {
    const [json, setJson] = useState(undefined);
    const [patientId, setPatientId] = useState(props.patientId);
    const setReportId = props.setReportId;
    const patientJson = props.patientJson;
    const reportId = props.reportId;
    const concepts = props.concepts;
    const svgContainerId = props.svgContainerId;
    const clickedTerms = props.clickedTerms;
    const setClickedTerms = props.setClickedTerms;
    const conceptsPerDocument = props.conceptsPerDocument;


    useEffect(() => {
        if (clickedTerms.length === 0) {
            document.querySelectorAll("circle").forEach(circle => {
                circle.style.fillOpacity = "0.3";  // Reset fill opacity to default
                // circle.style.stroke = "none";      // Reset stroke to none
                circle.style.strokeWidth = "1px";  // Reset stroke width to none
            });
        }
    }, [clickedTerms]);


    // const fetchTSVData = async (conceptsPerDocument) => {
    //     try {
    //         const response = await fetch("/unsummarized_output.tsv");
    //         if (!response.ok) throw new Error("Failed to load file");
    //
    //         const text = await response.text();
    //         // Only modify TSV if conceptsPerDocument is passed
    //         const modifiedText = conceptsPerDocument
    //             ? appendMentionsToTSV(text, conceptsPerDocument)
    //             : text;
    //
    //         console.log(text);
    //         console.log(modifiedText);
    //         console.log(parseTSV(modifiedText));
    //
    //         return parseTSV(modifiedText);
    //     } catch (error) {
    //         console.error("Error loading TSV:", error);
    //         return null;
    //     }
    // };



    // console.log(fetchTXTData(conceptsPerDocument))

    // Function to parse TSV text into an object
    // const parseTSV = (tsvText) => {
    //     const lines = tsvText.trim().split("\n");
    //     const headers = lines[0].split("\t").map(h => h.trim());
    //     const chemoCounts = {};
    //     const chemoGroupCounts =   {};
    //     const tLinkCounts = {};
    //
    //
    //     const data = lines.slice(1).map(line => {
    //         const values = line.split("\t"); // Split the line into columns by tab
    //
    //         const obj = headers.reduce((acc, header, index) => {
    //             let value = values[index]?.trim()?.replace(/^"|"$/g, ''); // Trim and remove quotes
    //
    //             if (header === "chemo_text"){
    //                 value = value.toLowerCase()
    //             }
    //
    //             if (value === 'contained-by'){
    //                 value = 'overlap'
    //             }
    //
    //             acc[header] = value;
    //             // Assign chemo_text to a group if it exists in the lookup
    //             if (header === "chemo_text" && chemoTextGroups[value]) {
    //                 acc["chemo_group"] = chemoTextGroups[value]; // Add group to object
    //                 chemoGroupCounts[chemoTextGroups[value]] = (chemoGroupCounts[chemoTextGroups[value]] || 0) + 1;
    //             }
    //             return acc;
    //         }, {});
    //
    //         const chemoName = obj["chemo_text"];
    //         if (chemoName) {
    //             chemoCounts[chemoName] = (chemoCounts[chemoName] || 0) + 1;
    //         }
    //
    //         // Track tlink counts
    //         const tlinkValue = obj["tlink"];
    //         if (tlinkValue) {
    //             tLinkCounts[tlinkValue] = (tLinkCounts[tlinkValue] || 0) + 1;
    //         }
    //
    //
    //         return obj;
    //     });
    //     // Include chemoCounts inside the data array as an additional property
    //     data.chemoTextCounts = chemoCounts;
    //     data.chemoTextGroupCounts = chemoGroupCounts;
    //     data.tLinkCounts = tLinkCounts;
    //
    //     return data; // Return data array with chemoCounts included
    // };

    const fetchTXTData = async () => {
        try {
            const response = await fetch("/Patient01_times.txt");
            if (!response.ok) throw new Error("Failed to load file");

            const text = await response.text();
            return parseTXT(text);

        } catch (error) {
            console.error("Error loading TSV:", error);
            return null;
        }
    };

    function getDpheGroupByConceptId(conceptId) {
        const concept = concepts.find(concept => concept.id === conceptId);
        return concept ? concept.dpheGroup : null;
    }


    const parseTXT = (txt) => {
        const lines = txt.trim().split("\n");
        const headers = lines[0].split("\t").map(h => h.trim());
        const dpheGroupCounts = {};
        const laneGroupCounts = {};
        // const tLinkCounts = {};

        const data = lines.slice(1).map(line => {
            const values = line.split("\t");
            const obj = headers.reduce((acc, header, index) => {
                acc[header] = values[index]?.trim()?.replace(/^"|"$/g, '');
                return acc;
            }, {});

            // console.log("obj", obj);

            // Get and assign dpheGroup
            const dpheGroup = getDpheGroupByConceptId(obj.ConceptID);
            obj.dpheGroup = dpheGroup;

            // Optionally count occurrences
            if (dpheGroup) {
                dpheGroupCounts[dpheGroup] = (dpheGroupCounts[dpheGroup] || 0) + 1;

                const laneGroup = laneGroups[dpheGroup.toLowerCase()] || 'Uncategorized';
                obj.laneGroup = laneGroup;
                laneGroupCounts[laneGroup] = (laneGroupCounts[laneGroup] || 0) + 1;

            }

            return obj;
        });

        data.dpheGroupCounts = dpheGroupCounts;
        data.laneGroupsCounts = laneGroupCounts;
        return data;
    };


    const transformTXTData = (data) => {
        return {
            patientId: data.map(d => d.PatientID),
            conceptId : data.map(d => d.ConceptID),
            startRelation : data.map(d => d.Relation1),
            startDate: data.map(d => d.Date1),
            endRelation : data.map(d => d.Relation2),
            endDate: data.map(d => d.Date2),
            dpheGroup: data.map(d => d.dpheGroup),
            laneGroup: data.map(d => d.laneGroup),
            dpheGroupCounts: data.dpheGroupCounts,
            laneGroupsCounts: data.laneGroupsCounts
        }
    }



    // const transformTSVData = (data) => {
    //     return {
    //         startDates: data.map(d => d.start_date),
    //         patientId: data.map(d => d.patient_id),
    //         chemoText: data.map(d => d.chemo_text),
    //         chemoTextGroups: data.map(d => d.chemo_group),
    //         chemoTextGroupCounts: data.chemoTextGroupCounts,
    //         endDates: data.map(d => d.end_date),
    //         chemoTextCounts: data.chemoTextCounts,
    //         tLinkCounts: data.tLinkCounts,
    //         noteId : data.map(d => d.note_id),
    //         conceptId : data.map(d => d.concept_id),
    //         tLink : data.map(d => d.tlink)
    //     };
    // }




    const skipNextEffect = useRef(false);

    useEffect(() => {
        if (!conceptsPerDocument) return;

        fetchTXTData(conceptsPerDocument).then(data => {
            if (!data) return;
            setJson(data);
            const transformedData = transformTXTData(data);
            const container = document.getElementById(svgContainerId);
            if (container) {
                container.innerHTML = "";
            }
            const filteredDpheGroup = transformedData.dpheGroup.filter(item => item != null);
            const filteredLaneGroup = transformedData.laneGroup.filter(item => item != null);
            if(filteredDpheGroup.length !== 0 && filteredLaneGroup.length !== 0) {
                renderTimeline(
                    svgContainerId,
                    transformedData.patientId,
                    transformedData.conceptId,
                    transformedData.startRelation,
                    transformedData.startDate,
                    transformedData.endRelation,
                    transformedData.endDate,
                    transformedData.dpheGroup,
                    transformedData.laneGroup,
                    transformedData.dpheGroupCounts,
                    transformedData.laneGroupsCounts
                );
            }
        });
    }, [conceptsPerDocument]);


    useEffect(() => {

        if (skipNextEffect.current) {
            skipNextEffect.current = false; // reset for next time
            return;
        }
        // if (!clickedTerms || clickedTerms.length === 0) return;

        document.querySelectorAll(".relation-icon").forEach(el => {
            if (!el.classList.contains("selected")) {
                el.classList.add("unselected");
            }
        });



        document.querySelectorAll(`.relation-icon`).forEach(el => {

            const conceptId = el.getAttribute("data-concept-id");

            if (clickedTerms.includes(conceptId)) {
                // Highlight it
                if (el.hasAttribute("marker-end")) {
                    el.setAttribute("marker-end", "url(#selectedRightArrow)");
                } else if (el.hasAttribute("marker-start")) {
                    el.setAttribute("marker-start", "url(#selectedLeftArrow)");
                } else {
                    el.classList.add("selected");
                    el.classList.remove("unselected");
                }
            } else {
                // Un-highlight it
                if (el.hasAttribute("marker-end")) {
                    el.setAttribute("marker-end", "url(#rightArrow)");
                } else if (el.hasAttribute("marker-start")) {
                    el.setAttribute("marker-start", "url(#leftArrow)");
                } else {
                    el.classList.remove("selected");
                    el.classList.add("unselected");
                }
            }

            // Show/hide the black outline line
            const group = el.closest("g");
            const isNowSelected = el.classList.contains("selected");
            if (group) {
                const outlines = group.querySelectorAll(".relation-outline");
                if (outlines.length) {
                    outlines.forEach((outline) => {
                        // Do something with the outlines, like showing or hiding
                        outline.setAttribute("stroke-opacity", isNowSelected ? "1" : "0");
                    });
                }
            }
        });

    }, [clickedTerms]);



    const renderTimeline = (
        svgContainerId,
            patientId,
            conceptId,
            startRelation,
            startDate,
            endRelation,
            endDate,
            dpheGroup,
            laneGroup,
            dpheGroupCount,
            laneGroupCount
    ) => {
        // Vertical count position of each report type
        // E.g., "Progress Note" has max 6 vertical reports, "Surgical Pathology Report" has 3
        // then the vertical position of "Progress Note" bottom line is 6, and "Surgical Pathology Report" is 6+3=9
        let verticalPositions = {};
        console.log("svgContainerId", svgContainerId);
        console.log("patientId", patientId);
        console.log("conceptId", conceptId);
        console.log("startRelation", startRelation);
        console.log("startDate", startDate);
        console.log("endRelation", endRelation);
        console.log("endDate", endDate);
        console.log("dpheGroup", dpheGroup);
        console.log("laneGroup", laneGroup);
        console.log("dpheGroupCount", dpheGroupCount);
        console.log("laneGroupCount", laneGroupCount);
        // Vertical max counts from top to bottom
        // This is used to decide the domain range of mainY and overviewY

        function createEventData() {
            const eventData = [];

            for (let i = 0; i < startDate.length; i++) {
                eventData.push({
                    start: startDate[i],
                    end: endDate[i],
                    patient_id: patientId[i], // Use patientId as unique identifier
                    laneGroup: laneGroup[i],
                    relation1: startRelation[i],
                    relation2: endRelation[i],
                    dpheGroup: dpheGroup[i],
                    conceptId: conceptId[i]
                });
            }

            return eventData;
        }

        function removeDuplicatesFromDpheAndLane(){
            //REMOVING DUPLICATES from chemo_text and TLink
            const dpheGroupSet = new Set();
            const laneGroupSet = new Set();
            const relation1Set = new Set();
            const relation2Set = new Set();


            for (let i = 0; i < dpheGroup.length; i++){
                dpheGroupSet.add(dpheGroup[i]);
            }


            for (let i = 0; i < laneGroup.length; i++){
                if (laneGroup[i] !== undefined){
                    laneGroupSet.add(laneGroup[i]);
                }
            }

            for (let i = 0; i < startRelation.length; i++){
                relation1Set.add((startRelation[i]));

            }
            dpheGroup = Array.from(dpheGroupSet);
            laneGroup = Array.from(laneGroupSet);
            startRelation = Array.from(relation1Set);
            endRelation = Array.from(relation2Set);
        }

        // Use the order in reportTypes to calculate totalMaxVerticalCounts of each report type
        // to have a consistent report type order

        function getTotalMaxVertCount(dictionary) {
            let count = 0

            for (let key in dictionary){
                console.log(key, dictionary[key]);
                count += dictionary[key]

                if (typeof verticalPositions[key] !== "undefined") {
                    console.log(verticalPositions[key]);
                    verticalPositions[key] = totalMaxVerticalCounts;
                }
            }


            return count
        }

        let totalMaxVerticalCounts = getTotalMaxVertCount(laneGroupCount);

        const margin = { top: 5, right: 20, bottom: 5, left: 200 };
        const mainChemoTextRowHeightPerCount = 16;
        const overviewChemoTextRowHeightPerCount = 3;

        const legendHeight = 22;
        const legendSpacing = 2;
        const widthPerLetter = 12;
        const episodeLegendAnchorPositionX = 40;
        const episodeLegendAnchorPositionY = 6;

        const gapBetweenlegendAndMain = 5;

        const container = document.getElementById(svgContainerId);
        const containerWidth = container.offsetWidth;

        const svgWidth = containerWidth - margin.left - 25;


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
        const marginOfDays = 50;

        // Gap between texts and mian area left border
        const textMargin = 10;

        // let eventData = null;


        // Need to create EventData before removing duplicates !IMPORTANT!
        // if (startDate && endDate && patientId && dpheGroup && laneGroup){
        const eventData = createEventData();
        // }


        // Convert string to date
        if (eventData !== null) {

            const minStartDate = new Date(startDate.reduce((min, date) => (new Date(date) < new Date(min) ? date : min)));
            const maxEndDate = new Date(endDate.reduce((max, date) => (new Date(date) > new Date(max) ? date : max)));

            minStartDate.setDate(minStartDate.getDate() - marginOfDays);
            maxEndDate.setDate(maxEndDate.getDate() + marginOfDays);

            let mainX = d3
                .scaleTime()
                .domain([minStartDate, maxEndDate])
                .range([0, svgWidth]);

            eventData.forEach(function (d) {
                console.log("FORMATTED",d);
                const startDate = new Date(d.start);
                const endDate = new Date(d.end);

                d.formattedStartDate = mainX(startDate);
                d.formattedEndDate = mainX(endDate);
            });

            removeDuplicatesFromDpheAndLane();


            const groupLaneHeights = {}; // e.g., { 'AC': 2, 'Taxol': 3, ... }
            laneGroup.forEach(group => {
                const eventsInGroup = eventData.filter(d => d.laneGroup === group);
                const slots = [];
                const isPoint = ([start, end]) => start === end;


                const checkOverlap = (a, b) => {
                    if (isPoint(a) && isPoint(b)) {
                        return a[0] === b[0];
                    } else if (isPoint(a)) {
                        return b[0] <= a[0] && a[0] <= b[1];
                    } else if (isPoint(b)) {
                        return a[0] <= b[0] && b[0] <= a[1];
                    } else {
                        return Math.max(a[0], b[0]) < Math.min(a[1], b[1]);
                    }
                };

                eventsInGroup.forEach(d => {

                    const x1 = +d.formattedStartDate;
                    const x2 = +d.formattedEndDate;
                    let row = 0;

                    while (true) {
                        if (!slots[row]) slots[row] = [];

                        const hasOverlap = slots[row].some(slot => checkOverlap([x1, x2], slot));

                        if (!hasOverlap) {
                            slots[row].push([x1, x2]);
                            break;
                        }
                        row += 1;
                    }
                });

                // Now store the number of rows
                groupLaneHeights[group] = slots.length;

            });

            // console.log(groupLaneHeights);


            // Dynamic height based on vertical counts
            const totalGroupLaneHeights = Object.values(groupLaneHeights).reduce((acc, val) => acc + val, 0);
            const height =
                totalGroupLaneHeights * mainChemoTextRowHeightPerCount * 2;

            // Transition used by focus/defocus episode
            let transt = d3
                .transition()
                .duration(transitionDuration)
                .ease(d3.easeLinear);

            // Main area and overview area share the same width

            let overviewX = d3
                .scaleTime()
                .domain([minStartDate, maxEndDate])
                .range([0, svgWidth]);

            // Y scale to handle main area
            let mainY = d3
                .scaleLinear()
                .domain([0, totalGroupLaneHeights])
                .range([0, height]);

            // Y scale to handle overview area
            // console.log("blash", overviewHeight, height)
            let overviewY = d3
                .scaleLinear()
                .domain([0, totalGroupLaneHeights])
                .range([0, overviewHeight]);

            // Process episode dates
            let episodeSpansData = [];


            // Create the container if it doesn't exist
            if (!document.getElementById(svgContainerId)) {
                console.log(svgContainerId);
                const container = document.createElement("div");
                container.id = svgContainerId;
                document.body.appendChild(container); // Append to the desired parent (body, or other parent element)
            }



            // SVG
            let svgTotalHeight =
                margin.top +
                legendHeight +
                gapBetweenlegendAndMain +
                height +
                pad +
                overviewHeight +
                pad +
                ageAreaHeight +
                margin.bottom;

            let svg = d3
                .select("#" + svgContainerId)
                .append("svg")
                .attr("class", "timeline_svg")
                .attr("viewBox", `0 0 ${containerWidth} ${svgTotalHeight}`)
                .attr("preserveAspectRatio", "xMidYMid meet") // Optional
                .style("width", "100%")
                .style("height", "auto");


            let labelPadding = 10; // Minimum space
            let extraPadding = 4; // Additional space per character

            let episodeLegendX = function (index) {
                let x = 30;

                for (let i = 0; i < index; i++) {
                    let processedEpisodeStr = startRelation[i].replace(/-|\s/g, "");
                    let textWidth = processedEpisodeStr.length * widthPerLetter;
                    let dynamicSpacing = labelPadding + (processedEpisodeStr.length * extraPadding);
                    x += textWidth + dynamicSpacing;
                }

                return episodeLegendAnchorPositionX + legendSpacing + x;
            };




            // Add label first in its own position
            svg.append("text")
                .attr("x", 10) // or whatever left margin you want
                .attr("y", margin.top + episodeLegendAnchorPositionY)
                .attr("dy", ".5ex")
                .attr("class", "episode_legend_text")
                .attr("text-anchor", "start")
                .text("Event Occurrence:");

            svg.append("line")
                .attr("x1", 10) // match the x of "Time Relation:"
                .attr("y1", margin.top + legendHeight)
                .attr("x2", margin.left + svgWidth)
                .attr("y2", margin.top + legendHeight)
                .attr("class", "legend_group_divider");

            // Now episodeLegendGrp only contains the icons and labels
            let episodeLegendGrp = svg
                .append("g")
                .attr("class", "episode_legend_group")
                .attr("transform", `translate(80, ${margin.top})`); // shift it right to make room for "Time Relation:"


            let episodeLegend = episodeLegendGrp
                .selectAll(".episode_legend")
                .data(startRelation)
                .enter()
                .append("g")
                .attr("class", "episode_legend")
                .attr("transform", (d, i) => `translate(${episodeLegendX(i)}, 0)`);

            // Arrow paths
            episodeLegend
                .append("path")
                .attr("class", "episode_legend_arrow")
                .attr("d", function (d) {
                    if (d === "On") {
                        return "M 3 0 L 3 12 M 9 0 L 9 12";
                    } else if (d === "Before") {
                        return "M 12 0 L 0 6 L 12 12";
                    } else if (d === "Overlaps") {
                        return "M 0 6 L 12 6";
                    } else {
                        return "M 0 0 L 12 6 L 0 12";
                    }
                })
                .attr("transform", "translate(-18, 0)")
                .style("fill", 'rgb(49, 163, 84)')
                .style("stroke", 'rgb(49, 163, 84)')
                .style("stroke-width", 2);

            // Legend labels
            episodeLegend
                .append("text")
                .attr("x", 0)
                .attr("y", 10)
                .attr("class", "episode_legend_text")
                .text(d => `${d}`)
                // (${startRelation[d]})
                .each(function (d) {
                    // Append a <title> tag to each <text> for the tooltip
                    d3.select(this)
                        .append("title")
                        .text(() => {
                            // Customize definitions here
                            if (d === "Before") return "Event occurs *before* time/date";
                            if (d === "On") return "Event occurs *within* time span";
                            if (d === "Overlap") return "Event *overlaps* time span";
                            if (d === "After") return "Event occurs *after* time/date";
                            return "Unspecified temporal relation.";
                        });
                });

//             let zoomIconGroup = episodeLegendGrp.append("g")
//                 .attr("class", "zoom_icon_group")
//                 .attr("transform", `translate(${1010}, 10)`) // 1000 + 10
//                 .style("cursor", "pointer")
//                 .on("click", () => {
//                     console.log("Zoom icon clicked!");
//                 });
//
// // Add the magnifying glass icon
//             zoomIconGroup.append("text")
//                 .attr("class", "zoom_icon")
//                 .attr("x", 0)
//                 .attr("y", 0)
//                 .attr("dy", ".35em")
//                 .text("🔍");
//
// // Add the label to the right
//             zoomIconGroup.append("text")
//                 .attr("class", "zoom_icon_label")
//                 .attr("x", 20)
//                 .attr("y", 0)
//                 .attr("dy", ".35em")
//                 .text("Scroll to zoom");



            // Specify a specific region of an element to display, rather than showing the complete area
            // Any parts of the drawing that lie outside of the region bounded by the currently active clipping path are not drawn.
            svg.append("defs")
                .append("clipPath")
                .attr("id", "secondary_area_clip")
                .append("rect")
                .attr("width", svgWidth)
                .attr("height", height + gapBetweenlegendAndMain);


            function updateMainReports() {
                // Re-bind data to existing groups
                const groups = d3.selectAll('g[clip-path="url(#secondary_area_clip)"]')
                    .selectAll('.main_report_group');


                // ENTER + UPDATE
                groups.each(function(d, i) {
                    const group = d3.select(this);
                    const startDate = new Date(d.start);
                    const endDate = new Date(d.end);

                    d.formattedStartDate = mainX(startDate);
                    d.formattedEndDate = mainX(endDate);
                    const x1 = d.formattedStartDate;
                    const x2 = d.formattedEndDate;

                    // Update report lines
                    group.selectAll('line[data-line-type="x1-only"]')
                        .attr("x1", x1 - 2)
                        .attr("x2", x1 - 2);

                    group.selectAll('line[data-line-type="x2-only"]')
                        .attr("x1", x2 + 2)
                        .attr("x2", x2 + 2);

                    group.selectAll('line[data-line-type="range"]')
                        .attr("x1", x1)
                        .attr("x2", x2);

                    group.selectAll('rect[data-rect-type="before"]')
                        .attr("x", x1)

                    group.selectAll('rect[data-rect-type="after"]')
                        .attr("x", x2)

                });

                // Update x-axis
                d3.select(".main-ER-x-axis").call(xAxis);
            }


            // Function expression to handle mouse wheel zoom or drag on main area
            let zoomed = function () {
                // Ignore zoom triggered by brushing
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return;

                let transform = d3.event.transform;

                // Rescale the main X-axis based on zoom transform
                let newDomain = transform.rescaleX(overviewX).domain();
                mainX.domain(newDomain);

                // Redraw all reports using new mainX scale
                updateMainReports();

                // Sync brush with zoom
                // let newBrushSelection = mainX.range().map(transform.invertX, transform);
                // overview.select(".brush").call(brush.move, newBrushSelection);
                overview
                    .select(".brush")
                    .call(brush.move, mainX.range().map(transform.invertX, transform));

                // Update custom brush handles (if selection exists)
                let selection = d3.brushSelection(overviewBrush.node());

                showAndMoveCustomBrushHandles(selection);

            };

            // Zoom rect that covers the main area
            let zoom = d3
                .zoom()
                .scaleExtent([1, Infinity])
                .translateExtent([
                    [0, 0],
                    [svgWidth, height],
                ])
                .extent([
                    [0, 0],
                    [svgWidth, height],
                ])
                .on("zoom", zoomed);

            // Appending zoom rect after the main area will prevent clicking on the report circles
            svg
                .append("rect")
                .attr("class", "zoom_ER")
                .attr("width", svgWidth)
                .attr("height", height + gapBetweenlegendAndMain)
                .attr("transform", "translate(" + margin.left + "," + (margin.top + legendHeight) + ")")
                .call(zoom);

            // Main area
            // Create main area after zoom panel, so we can select the report circles
            let main_ER_svg = svg
                .append("g")
                .attr("class", "main_ER_svg")
                .attr(
                    "transform",
                    "translate(" +
                    margin.left +
                    "," +
                    (margin.top + legendHeight + gapBetweenlegendAndMain) +
                    ")"
                );

            // Encounter ages
            let age_ER = svg
                .append("g")
                .attr("class", "age_ER")
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

            // const uniqueLaneGroups = Array.from(new Set(dpheGroup)).filter(item => item !== undefined);
            // console.log("UNIQUEGROUP:", uniqueLaneGroups);
            // // Skip the last group (bottom-most) so we don’t draw an extra divider
            // const groupsToDraw = uniqueLaneGroups.slice(0, -1);


            // *****************************LINE DIVIDER************************************




            // Main report type divider lines
            // Put this before rendering the report dots so the enlarged dot on hover will cover the divider line
            // main_ER_svg
            //     .append("g")
            //     .selectAll(".report_type_divider")
            //     .data(chemoTextGroups)
            //     .enter()
            //     .append("line")
            //     .attr("x1", 0)
            //     .attr("x2", svgWidth)
            //     .each(function(d) {
            //         const y = mainY(groupLaneHeights[d] * verticalPositions[d]);
            //         d3.select(this)
            //             .attr("y1", y)
            //             .attr("y2", y);
            //     })
            //     .attr("class", "report_type_divider");

            /************ COME BACK TO HERE ***********************/
                // Need to take the value of where the label is and then
                // Use this value for getting the correct line divider spot

            let laneOffset = 0;
            // Report types texts
            const labelPositions = []; // Store the y-coordinates

            const labelGroup = main_ER_svg
                .append("g")
                .selectAll(".report_type_label_group")
                .data([...new Set(laneGroup)])
                .enter()
                .append("g")
                .attr("class", "report_type_label_group")
                .attr("transform", function (d) {
                    const y = laneOffset + groupLaneHeights[d] * 16;
                    const transform = `translate(0, ${y})`;

                    // Store the position for dividing lines
                    labelPositions.push({
                        group: d,
                        y: y,
                        endY: y + groupLaneHeights[d] * 16 * 2
                    });

                    laneOffset += groupLaneHeights[d] * 16 * 2;
                    return transform;
                });

            /************ COME BACK TO HERE ***********************/

            // Add the main text label
            labelGroup
                .append("text")
                .attr("class", "report_type_label")
                .attr("dy", ".5ex")
                .attr("x", -textMargin)
                .text(d => `${d} (${laneGroupCount[d]}):`);

            labelGroup.each(function (d) {
                const group = d3.select(this);
                const label = group.select(".report_type_label");

                // Add a <title> to the label itself to show tooltip on hover
                label.append("title")
                    .text(() => {
                        const definitions = {
                            "Finding": "(symptoms, test results)",
                            "Severity": "(stage, grade, tnm)",
                            "Disease": "(neoplasm, disease, disorder)",
                            "Treatment": "(procedure, medication)",
                        };
                        return definitions[d] || "No definition available.";
                    });
            });


            main_ER_svg
                .append("g")
                .selectAll(".report_type_divider")
                .data(labelPositions.slice(0, -1)) // Skip the last one if you don't want a line after the last group
                .enter()
                .append("line")
                .attr("class", "report_type_divider")
                .attr("x1", 0)
                .attr("x2", svgWidth)
                .attr("y1", d => d.endY) // or just d.y if you want lines at the start of each group
                .attr("y2", d => d.endY);

            const defs = d3.select("svg").append("defs");


            // Define the vertical line markers
            // defs.append("marker")
            //     .attr("id", "verticalStart")
            //     .attr("viewBox", "0 0 10 10")
            //     .attr("refX", 10)  // Position at the middle of the line
            //     .attr("refY", 5)  // Position at the middle of the line
            //     .attr("markerWidth", 4)
            //     .attr("markerHeight", 8)
            //     .attr("orient", "auto")
            //     .append("line")
            //     .attr("x1", 0)
            //     .attr("x2", 0)
            //     .attr("y1", 0)
            //     .attr("y2", 15)
            //     .style("stroke", "rgb(49, 163, 84)")
            //     .style("stroke-width", 10)
            //     .style("pointer-events", "none"); // Ensure the line is above everything else


            // Define the right arrow marker
            // defs.append("marker")
            //     .attr("id", "rightArrow")
            //     .attr("viewBox", "0 0 12 12")  // Marker size
            //     .attr("refX", 2)  // Position of the marker on the line
            //     .attr("refY", 6)
            //     .attr("markerWidth", 4)
            //     .attr("markerHeight", 4)
            //     .attr("orient", "auto")
            //     .append("path")
            //     .attr("d", "M 0 0 L 12 6 L 0 12")  // Right-pointing triangle
            //     .style("fill", "rgb(49, 163, 84)");
            const rightArrow = defs.append("marker")
                .attr("id", "rightArrow")
                .attr("class", "relation-icon")
                .attr("viewBox", "0 0 12 12")
                .attr("refX", 0)
                .attr("refY", 6)
                .attr("markerWidth", 3.2)
                .attr("markerHeight", 3.2)
                .attr("fill-opacity", 0.75)
                .attr("orient", "auto");

            // Green "top" arrow (normal size)
            rightArrow.append("path")
                .attr("class", "relation-icon")
                .attr("d", "M 0 0 L 12 6 L 0 12 Z")
                .style("fill", "rgb(49, 163, 84)");




            const selectedRightArrow = defs.append("marker")
                .attr("id", "selectedRightArrow")
                .attr("viewBox", "0 0 12 12")
                .attr("refX", 0)
                .attr("refY", 6)
                .attr("markerWidth", 3.2)
                .attr("markerHeight", 3.2)
                .attr("orient", "auto");

            selectedRightArrow.append("path")
                .attr("d", "M 0 0 L 12 6 L 0 12 Z")
                .style("fill", "rgb(49, 163, 84)")
                .style("stroke", "black")
                .style("stroke-width", 1);


            // Define the left arrow marker
            const leftArrow = defs.append("marker")
                .attr("id", "leftArrow")
                .attr("class", "relation-icon")
                .attr("viewBox", "0 0 12 12")
                .attr("refX", 6)  // Shift the arrowhead slightly left
                .attr("refY", 6)
                .attr("markerWidth", 3.2)
                .attr("fill-opacity", 0.75)
                .attr("markerHeight", 3.2)
                .attr("orient", "auto")


            // leftArrow.append("path")
            //     .attr("d", "M 12 0 L 0 6 L 12 12")
            //     .attr("transform", "translate(1.5, 0)") // Shift just slightly left
            //     .style("fill", "black")
            //     .style("stroke", "black")
            //     .style("stroke-width", 1.7);

            leftArrow.append("path")
                .attr("class", "relation-icon")
                .attr("d", "M 12 0 L 0 6 L 12 12")  // Left-pointing triangle
                .style("fill", "rgb(49, 163, 84)");




            const selectedLeftArrow = defs.append("marker")
                .attr("id", "selectedLeftArrow")
                // .attr("class", "relation-icon")
                .attr("viewBox", "0 0 12 12")
                .attr("refX", 6)  // Shift the arrowhead slightly left
                .attr("refY", 6)
                .attr("markerWidth", 3.2)
                .attr("markerHeight", 3.2)
                .attr("orient", "auto")


            // leftArrow.append("path")
            //     .attr("d", "M 12 0 L 0 6 L 12 12")
            //     .attr("transform", "translate(1.5, 0)") // Shift just slightly left
            //     .style("fill", "black")
            //     .style("stroke", "black")
            //     .style("stroke-width", 1.7);

            selectedLeftArrow.append("path")
                .attr("d", "M 12 0 L 0 6 L 12 12 Z")  // Close the triangle
                .style("fill", "rgb(49, 163, 84)")
                .style("stroke", "black")
                .style("stroke-width", 1);


            let mainReports = main_ER_svg
                .append("g")
                .attr("clip-path", "url(#secondary_area_clip)");


            const occupiedSlots = new Map(); // Key: base Y, Value: array of [x1, x2] pairs
            laneOffset = 0;
            let groupBaseYMap = {};

            console.log(laneGroup);
            [...new Set(laneGroup)].forEach(group => {
                console.log("LANE GROUP", group)
                groupBaseYMap[group] = laneOffset + (groupLaneHeights[group] * 16); // center within the block if needed
                laneOffset += groupLaneHeights[group] * 16 * 2; // double it if each lane is that tall
            });



            // console.log(eventData);
            mainReports
                .selectAll(".main_report_ER")
                .data(eventData)  // Use a key function for data binding
                .enter()
                .append("g")
                .attr("class", "main_report_group")
                .each(function (d) {
                    const group = d3.select(this);
                    const x1 = d.formattedStartDate;
                    const x2 = d.formattedEndDate;
                    const baseY = groupBaseYMap[d.laneGroup];
                    let y = baseY;
                    let yOffset = 0;
                    const buffer = 15;

                    const checkOverlap = (a, b) => Math.max(a[0], b[0]) <= Math.min(a[1], b[1]);
                    let slotList = occupiedSlots.get(baseY) || [];

                    while (slotList.some(slot => checkOverlap([d.formattedStartDate, d.formattedEndDate], slot))) {
                        yOffset += buffer;
                        y = baseY + yOffset;
                        slotList = occupiedSlots.get(y) || [];
                    }

                    // Now reserve this slot
                    slotList.push([d.formattedStartDate, d.formattedEndDate]);
                    occupiedSlots.set(y, slotList);

                    // Adjust line thickness if it's an overlap
                    const lineThickness = d.relation1 === "Overlap" ? 5 : 5;

                    // 1. Create a separate group for `contains` lines (will be drawn first)
                    const containsGroup = group.append("g").attr("class", "contains-group");

                    // 2. Create another group for the main lines (to be drawn on top)
                    const mainLineGroup = group.append("g").attr("class", "main-line-group");

                    console.log("D:", d);

                    if (d.relation1 === "After" && d.relation2 === "After"){
                        //   >

                        mainLineGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1 - 1)
                            .attr("y1", y)
                            .attr("x2", x2 + 1)
                            .attr("y2", y)
                            .attr("stroke", "black")
                            .attr("stroke-width", 7)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);

                        // Append the line
                        mainLineGroup.append("line")
                            .attr("class", "main_report_ER relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "range")
                            .attr("x1", x1)
                            .attr("x2", x2)
                            .attr("y1", y)
                            .attr("y2", y)
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", lineThickness)
                            .attr("stroke-opacity", 0.75)
                            .attr("marker-start", d.relation1 === "Before" ? "url(#leftArrow)" : null)
                            .attr("marker-end", d.relation1 === "After" ? "url(#rightArrow)" : null)
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));

                        mainLineGroup.append("rect")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-rect-type", "after")
                            .attr("x", x2 - 5) // Align with arrow
                            .attr("y", y - 5)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", "transparent")
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));

                    }
                    if (d.relation1 === "After" && d.relation2 === "Overlaps"){
                        // >------

                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1)
                            .attr("y1", y)
                            .attr("x2", x2)
                            .attr("y2", y)
                            .attr("stroke", "black")
                            .attr("stroke-width", 7)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);


                        // TODO: ADD A rightArrowLeft option >----- in defs
                        // Green visible line (drawn second, on top)
                        containsGroup.append("line")
                            .attr("class", "main_report_ER relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "range")
                            .attr("x1", x1)
                            .attr("x2", x2)
                            .attr("y1", y)
                            .attr("y2", y)
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", lineThickness)
                            .attr("stroke-opacity", 0.75)
                            .attr("marker-start", d.relation1 === "After" ? "url(#rightArrow)" : null)
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));

                    }

                    // TODO: NO AFTER , ON to test on
                    if (d.relation1 === "After" && d.relation2 === "On"){
                        // >---|

                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1)
                            .attr("y1", y)
                            .attr("x2", x2)
                            .attr("y2", y)
                            .attr("stroke", "black")
                            .attr("stroke-width", 7)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);


                        // Green visible line (drawn second, on top)
                        containsGroup.append("line")
                            .attr("class", "main_report_ER relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "range")
                            .attr("x1", x1)
                            .attr("x2", x2)
                            .attr("y1", y)
                            .attr("y2", y)
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", lineThickness)
                            .attr("stroke-opacity", 0.75)
                            .attr("marker-start", d.relation1 === "After" ? "url(#rightArrow)" : null)
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));


                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x2 + 2)
                            .attr("y1", y - 7)
                            .attr("x2", x2 + 2)
                            .attr("y2", y + 7)
                            .attr("stroke", "black")
                            .attr("stroke-width", 4)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);

                        containsGroup.append("line")
                            .attr("class", "main_report_contains relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "x2-only")
                            // .attr("x1", 200)
                            // .attr("x2", 200)
                            .attr("y1", y - 6) // Extends above
                            .attr("y2", y + 6) // Extends below
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", 3)
                            .attr("stroke-opacity", 0.75)
                            // .attr("stroke-solid", "4 2") // Dashed line for clarity
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));

                    }

                    if (d.relation1 === "On" && d.relation2 === "On"){
                        // |----|
                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1 - 2)
                            .attr("y1", y - 7)
                            .attr("x2", x1 - 2)
                            .attr("y2", y + 7)
                            .attr("stroke", "black")
                            .attr("stroke-width", 4)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);

                        containsGroup.append("line")
                            .attr("class", "main_report_contains relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "x1-only")
                            // .attr("x1",  50)
                            // .attr("x2",  60)
                            .attr("y1", y - 6) // Extends above
                            .attr("y2", y + 6) // Extends below
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", 3)
                            .attr("stroke-opacity", 0.75)
                            // .attr("stroke-solid", "4 2") // Dashed line for clarity
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));

                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x2 + 2)
                            .attr("y1", y - 7)
                            .attr("x2", x2 + 2)
                            .attr("y2", y + 7)
                            .attr("stroke", "black")
                            .attr("stroke-width", 4)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);

                        containsGroup.append("line")
                            .attr("class", "main_report_contains relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "x2-only")
                            // .attr("x1", 200)
                            // .attr("x2", 200)
                            .attr("y1", y - 6) // Extends above
                            .attr("y2", y + 6) // Extends below
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", 3)
                            .attr("stroke-opacity", 0.75)
                            // .attr("stroke-solid", "4 2") // Dashed line for clarity
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));


                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1)
                            .attr("y1", y)
                            .attr("x2", x2)
                            .attr("y2", y)
                            .attr("stroke", "black")
                            .attr("stroke-width", 7)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);


                        // Green visible line (drawn second, on top)
                        containsGroup.append("line")
                            .attr("class", "main_report_ER relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "range")
                            .attr("x1", x1)
                            .attr("x2", x2)
                            .attr("y1", y)
                            .attr("y2", y)
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", lineThickness)
                            .attr("stroke-opacity", 0.75)
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));
                    }

                    if (d.relation1 === "On" && d.relation2 === "Before"){
                        // |-----<
                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1 - 2)
                            .attr("y1", y - 7)
                            .attr("x2", x1 - 2)
                            .attr("y2", y + 7)
                            .attr("stroke", "black")
                            .attr("stroke-width", 4)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);

                        containsGroup.append("line")
                            .attr("class", "main_report_contains relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "x1-only")
                            // .attr("x1",  50)
                            // .attr("x2",  60)
                            .attr("y1", y - 6) // Extends above
                            .attr("y2", y + 6) // Extends below
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", 3)
                            .attr("stroke-opacity", 0.75)
                            // .attr("stroke-solid", "4 2") // Dashed line for clarity
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));


                        containsGroup.append("line")
                                .attr("class", "relation-outline")
                                .attr("x1", x1)
                                .attr("y1", y)
                                .attr("x2", x2)
                                .attr("y2", y)
                                .attr("stroke", "black")
                                .attr("stroke-width", 7)
                                .style("cursor", "pointer")
                                .attr("stroke-opacity", 0);


                        // Green visible line (drawn second, on top)
                        containsGroup.append("line")
                            .attr("class", "main_report_ER relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "range")
                            .attr("x1", x1)
                            .attr("x2", x2)
                            .attr("y1", y)
                            .attr("y2", y)
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", lineThickness)
                            .attr("stroke-opacity", 0.75)
                            .attr("marker-start", d.relation1 === "before" ? "url(#leftArrow)" : null)
                            .attr("marker-end", d.relation1 === "after" ? "url(#rightArrow)" : null)
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));


                        mainLineGroup.append("rect")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-rect-type", "before")
                            .attr("x", x2 - 10) // Align with arrow
                            .attr("y", y - 5)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", "transparent")
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));

                    }
                    if (d.relation1 === "On" && d.relation2 === "Overlaps"){
                        // |----

                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1 - 2)
                            .attr("y1", y - 7)
                            .attr("x2", x1 - 2)
                            .attr("y2", y + 7)
                            .attr("stroke", "black")
                            .attr("stroke-width", 4)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);

                        containsGroup.append("line")
                            .attr("class", "main_report_contains relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "x1-only")
                            // .attr("x1",  50)
                            // .attr("x2",  60)
                            .attr("y1", y - 6) // Extends above
                            .attr("y2", y + 6) // Extends below
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", 3)
                            .attr("stroke-opacity", 0.75)
                            // .attr("stroke-solid", "4 2") // Dashed line for clarity
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));


                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1)
                            .attr("y1", y)
                            .attr("x2", x2)
                            .attr("y2", y)
                            .attr("stroke", "black")
                            .attr("stroke-width", 7)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);


                        // Green visible line (drawn second, on top)
                        containsGroup.append("line")
                            .attr("class", "main_report_ER relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "range")
                            .attr("x1", x1)
                            .attr("x2", x2)
                            .attr("y1", y)
                            .attr("y2", y)
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", lineThickness)
                            .attr("stroke-opacity", 0.75)
                            .attr("marker-start", d.relation1 === "before" ? "url(#leftArrow)" : null)
                            .attr("marker-end", d.relation1 === "after" ? "url(#rightArrow)" : null)
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));

                    }

                    if (d.relation1 === "After" && d.relation2 === "Before"){
                        // >---<


                        mainLineGroup.append("rect")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-rect-type", "after")
                            .attr("x", x1 - 5) // Align with arrow
                            .attr("y", y - 5)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", "transparent")
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));


                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1)
                            .attr("y1", y)
                            .attr("x2", x2)
                            .attr("y2", y)
                            .attr("stroke", "black")
                            .attr("stroke-width", 7)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);


                        // Green visible line (drawn second, on top)
                        containsGroup.append("line")
                            .attr("class", "main_report_ER relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "range")
                            .attr("x1", x1)
                            .attr("x2", x2)
                            .attr("y1", y)
                            .attr("y2", y)
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", lineThickness)
                            .attr("stroke-opacity", 0.75)
                            .attr("marker-start", d.relation1 === "before" ? "url(#leftArrow)" : null)
                            .attr("marker-end", d.relation1 === "after" ? "url(#rightArrow)" : null)
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));


                        mainLineGroup.append("rect")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-rect-type", "before")
                            .attr("x", x2 - 10) // Align with arrow
                            .attr("y", y - 5)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", "transparent")
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));

                    }

                    if (d.relation1 === "Before" && d.relation2 === "Before"){
                        //    <
                        mainLineGroup.append("rect")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-rect-type", "before")
                            .attr("x", x1 - 10) // Align with arrow
                            .attr("y", y - 5)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", "transparent")
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));

                    }
                    if (d.relation1 === "Before" && d.relation2 === "Overlaps"){
                        // <-------

                        mainLineGroup.append("rect")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-rect-type", "before")
                            .attr("x", x1 - 10) // Align with arrow
                            .attr("y", y - 5)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", "transparent")
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));



                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1)
                            .attr("y1", y)
                            .attr("x2", x2)
                            .attr("y2", y)
                            .attr("stroke", "black")
                            .attr("stroke-width", 7)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);


                        containsGroup.append("line")
                            .attr("class", "main_report_ER relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "range")
                            .attr("x1", x1)
                            .attr("x2", x2)
                            .attr("y1", y)
                            .attr("y2", y)
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", lineThickness)
                            .attr("stroke-opacity", 0.75)
                            .attr("marker-start", d.relation1 === "before" ? "url(#leftArrow)" : null)
                            .attr("marker-end", d.relation1 === "after" ? "url(#rightArrow)" : null)
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));

                    }
                    if (d.relation1 === "Overlaps" && d.relation2 === "Before"){
                        // --------<
                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1)
                            .attr("y1", y)
                            .attr("x2", x2)
                            .attr("y2", y)
                            .attr("stroke", "black")
                            .attr("stroke-width", 7)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);


                        containsGroup.append("line")
                            .attr("class", "main_report_ER relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "range")
                            .attr("x1", x1)
                            .attr("x2", x2)
                            .attr("y1", y)
                            .attr("y2", y)
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", lineThickness)
                            .attr("stroke-opacity", 0.75)
                            .attr("marker-start", d.relation1 === "before" ? "url(#leftArrow)" : null)
                            .attr("marker-end", d.relation1 === "after" ? "url(#rightArrow)" : null)
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));


                        mainLineGroup.append("rect")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-rect-type", "before")
                            .attr("x", x2 - 10) // Align with arrow
                            .attr("y", y - 5)
                            .attr("width", 10)
                            .attr("height", 10)
                            .style("fill", "transparent")
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));

                    }

                    if (d.relation1 === "Overlaps" && d.relation2 === "On"){
                        // -----|

                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1)
                            .attr("y1", y)
                            .attr("x2", x2)
                            .attr("y2", y)
                            .attr("stroke", "black")
                            .attr("stroke-width", 7)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);

                        containsGroup.append("line")
                            .attr("class", "main_report_ER relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "range")
                            .attr("x1", x1)
                            .attr("x2", x2)
                            .attr("y1", y)
                            .attr("y2", y)
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", lineThickness)
                            .attr("stroke-opacity", 0.75)
                            .attr("marker-start", d.relation1 === "before" ? "url(#leftArrow)" : null)
                            .attr("marker-end", d.relation1 === "after" ? "url(#rightArrow)" : null)
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));


                            containsGroup.append("line")
                                .attr("class", "relation-outline")
                                .attr("x1", x2 + 2)
                                .attr("y1", y - 7)
                                .attr("x2", x2 + 2)
                                .attr("y2", y + 7)
                                .attr("stroke", "black")
                                .attr("stroke-width", 4)
                                .style("cursor", "pointer")
                                .attr("stroke-opacity", 0);

                            containsGroup.append("line")
                                .attr("class", "main_report_contains relation-icon")
                                .attr("data-concept-id", d.conceptId)
                                .attr("data-line-type", "x2-only")
                                // .attr("x1", 200)
                                // .attr("x2", 200)
                                .attr("y1", y - 6) // Extends above
                                .attr("y2", y + 6) // Extends below
                                .attr("stroke", 'rgb(49, 163, 84)')
                                .attr("stroke-width", 3)
                                .attr("stroke-opacity", 0.75)
                                // .attr("stroke-solid", "4 2") // Dashed line for clarity
                                .style("cursor", "pointer")
                                .on("click", (event) => handleClick(event, d));


                    }

                    if (d.relation1 === "Overlaps" && d.relation2 === "Overlaps"){
                        // ------

                        containsGroup.append("line")
                            .attr("class", "relation-outline")
                            .attr("x1", x1)
                            .attr("y1", y)
                            .attr("x2", x2)
                            .attr("y2", y)
                            .attr("stroke", "black")
                            .attr("stroke-width", 7)
                            .style("cursor", "pointer")
                            .attr("stroke-opacity", 0);

                        containsGroup.append("line")
                            .attr("class", "main_report_ER relation-icon")
                            .attr("data-concept-id", d.conceptId)
                            .attr("data-line-type", "range")
                            .attr("x1", x1)
                            .attr("x2", x2)
                            .attr("y1", y)
                            .attr("y2", y)
                            .attr("stroke", 'rgb(49, 163, 84)')
                            .attr("stroke-width", lineThickness)
                            .attr("stroke-opacity", 0.75)
                            .attr("marker-start", d.relation1 === "before" ? "url(#leftArrow)" : null)
                            .attr("marker-end", d.relation1 === "after" ? "url(#rightArrow)" : null)
                            .style("cursor", "pointer")
                            .on("click", (event) => handleClick(event, d));
                    }





                    // // Append vertical lines at both start (x1) and end (x2) for "contains" tLink
                    // if (d.relation1 === "contains") {
                    //
                    //     containsGroup.append("line")
                    //         .attr("class", "relation-outline")
                    //         .attr("x1", x1 - 2)
                    //         .attr("y1", y - 7)
                    //         .attr("x2", x1 - 2)
                    //         .attr("y2", y + 7)
                    //         .attr("stroke", "black")
                    //         .attr("stroke-width", 4)
                    //         .style("cursor", "pointer")
                    //         .attr("stroke-opacity", 0);
                    //
                    //     containsGroup.append("line")
                    //         .attr("class", "main_report_contains relation-icon")
                    //         .attr("data-concept-id", d.conceptId)
                    //         .attr("data-line-type", "x1-only")
                    //         // .attr("x1",  50)
                    //         // .attr("x2",  60)
                    //         .attr("y1", y - 6) // Extends above
                    //         .attr("y2", y + 6) // Extends below
                    //         .attr("stroke", 'rgb(49, 163, 84)')
                    //         .attr("stroke-width", 3)
                    //         .attr("stroke-opacity", 0.75)
                    //         // .attr("stroke-solid", "4 2") // Dashed line for clarity
                    //         .style("cursor", "pointer")
                    //         .on("click", (event) => handleClick(event, d));
                    //
                    //     containsGroup.append("line")
                    //         .attr("class", "relation-outline")
                    //         .attr("x1", x2 + 2)
                    //         .attr("y1", y - 7)
                    //         .attr("x2", x2 + 2)
                    //         .attr("y2", y + 7)
                    //         .attr("stroke", "black")
                    //         .attr("stroke-width", 4)
                    //         .style("cursor", "pointer")
                    //         .attr("stroke-opacity", 0);
                    //
                    //     containsGroup.append("line")
                    //         .attr("class", "main_report_contains relation-icon")
                    //         .attr("data-concept-id", d.conceptId)
                    //         .attr("data-line-type", "x2-only")
                    //         // .attr("x1", 200)
                    //         // .attr("x2", 200)
                    //         .attr("y1", y - 6) // Extends above
                    //         .attr("y2", y + 6) // Extends below
                    //         .attr("stroke", 'rgb(49, 163, 84)')
                    //         .attr("stroke-width", 3)
                    //         .attr("stroke-opacity", 0.75)
                    //         // .attr("stroke-solid", "4 2") // Dashed line for clarity
                    //         .style("cursor", "pointer")
                    //         .on("click", (event) => handleClick(event, d));
                    //
                    //
                    //     containsGroup.append("line")
                    //         .attr("class", "relation-outline")
                    //         .attr("x1", x1)
                    //         .attr("y1", y)
                    //         .attr("x2", x2)
                    //         .attr("y2", y)
                    //         .attr("stroke", "black")
                    //         .attr("stroke-width", 7)
                    //         .style("cursor", "pointer")
                    //         .attr("stroke-opacity", 0);
                    //
                    //
                    //     // Green visible line (drawn second, on top)
                    //     containsGroup.append("line")
                    //         .attr("class", "main_report_ER relation-icon")
                    //         .attr("data-concept-id", d.conceptId)
                    //         .attr("data-line-type", "range")
                    //         .attr("x1", x1)
                    //         .attr("x2", x2)
                    //         .attr("y1", y)
                    //         .attr("y2", y)
                    //         .attr("stroke", 'rgb(49, 163, 84)')
                    //         .attr("stroke-width", lineThickness)
                    //         .attr("stroke-opacity", 0.75)
                    //         .attr("marker-start", d.relation1 === "before" ? "url(#leftArrow)" : null)
                    //         .attr("marker-end", d.relation1 === "after" ? "url(#rightArrow)" : null)
                    //         .style("cursor", "pointer")
                    //         .on("click", (event) => handleClick(event, d));
                    // }
                    //
                    //
                    //
                    //
                    // if (d.relation1 !== "contains") {
                    //
                    //     mainLineGroup.append("line")
                    //         .attr("class", "relation-outline")
                    //         .attr("x1", x1 - 1)
                    //         .attr("y1", y)
                    //         .attr("x2", x2 + 1)
                    //         .attr("y2", y)
                    //         .attr("stroke", "black")
                    //         .attr("stroke-width", 7)
                    //         .style("cursor", "pointer")
                    //         .attr("stroke-opacity", 0);
                    //
                    //     // Append the line
                    //     mainLineGroup.append("line")
                    //         .attr("class", "main_report_ER relation-icon")
                    //         .attr("data-concept-id", d.conceptId)
                    //         .attr("data-line-type", "range")
                    //         .attr("x1", x1)
                    //         .attr("x2", x2)
                    //         .attr("y1", y)
                    //         .attr("y2", y)
                    //         .attr("stroke", 'rgb(49, 163, 84)')
                    //         .attr("stroke-width", lineThickness)
                    //         .attr("stroke-opacity", 0.75)
                    //         .attr("marker-start", d.relation1 === "Before" ? "url(#leftArrow)" : null)
                    //         .attr("marker-end", d.relation1 === "After" ? "url(#rightArrow)" : null)
                    //         .style("cursor", "pointer")
                    //         .on("click", (event) => handleClick(event, d));
                    //
                    //     // If start and end are the same, ensure arrow is clickable
                    //     if (x1 === x2) {
                    //         if (d.relation1 === "Before") {
                    //             mainLineGroup.append("rect")
                    //                 .attr("data-concept-id", d.conceptId)
                    //                 .attr("data-rect-type", "before")
                    //                 .attr("x", x1 - 10) // Align with arrow
                    //                 .attr("y", y - 5)
                    //                 .attr("width", 10)
                    //                 .attr("height", 10)
                    //                 .style("fill", "transparent")
                    //                 .style("cursor", "pointer")
                    //                 .on("click", (event) => handleClick(event, d));
                    //
                    //         }
                    //         if (d.relation1 === "after") {
                    //             mainLineGroup.append("rect")
                    //                 .attr("data-concept-id", d.conceptId)
                    //                 .attr("data-rect-type", "after")
                    //                 .attr("x", x2 - 5) // Align with arrow
                    //                 .attr("y", y - 5)
                    //                 .attr("width", 10)
                    //                 .attr("height", 10)
                    //                 .style("fill", "transparent")
                    //                 .style("cursor", "pointer")
                    //                 .on("click", (event) => handleClick(event, d));
                    //
                    //         }
                    //     }
                    // }

                });


            function handleClick(event, d) {
                const clickedConceptId = d.conceptId;
                const clickedNoteId = d.noteId;
                if (!clickedConceptId && !clickedNoteId) return;

                setClickedTerms((prevTerms) => {
                    // Check if the term is already in the array
                    if (prevTerms.includes(clickedConceptId)) {
                        // Remove it if it's already in the array (unclick)
                        return prevTerms.filter(term => term !== clickedConceptId);
                    } else {
                        // Add it if it's not in the array (click)
                        return [...prevTerms, clickedConceptId];
                    }
                });


                // Set all circles and relations to light/transparent
                document.querySelectorAll("circle").forEach(circle => {
                    circle.style.fillOpacity = "0.3";  // very light by default
                });

                document.querySelectorAll(".relation-icon").forEach(el => {
                    if (!el.classList.contains("selected")) {
                        el.classList.add("unselected");
                    }
                });

                // Emphasize matching relations
                document.querySelectorAll(`.relation-icon[data-concept-id="${clickedConceptId}"]`).forEach(el => {
                    skipNextEffect.current = true;



                    if (el.hasAttribute("marker-end")) {
                        const currentMarker = el.getAttribute("marker-end");
                        if (currentMarker === "url(#selectedRightArrow)"){
                            el.setAttribute("marker-end", "url(#rightArrow)");
                        }
                        else{
                            el.setAttribute("marker-end", "url(#selectedRightArrow)");
                        }
                    }
                    else if (el.hasAttribute("marker-start")){
                        const currentMarker = el.getAttribute("marker-start");
                        if (currentMarker === "url(#selectedLeftArrow)"){
                            el.setAttribute("marker-start", "url(#leftArrow)");
                        }
                        else{
                            el.setAttribute("marker-start", "url(#selectedLeftArrow)");
                        }
                    }
                    else{
                        if (el.classList.contains("selected")) {
                            el.classList.remove("selected");
                            el.classList.add("unselected");
                        } else {
                            el.classList.remove("unselected");
                            el.classList.add("selected");



                        }
                    }

                        // Show/hide the black outline line
                    const group = el.closest("g");
                    const isNowSelected = el.classList.contains("selected");
                    if (group) {
                        const outlines = group.querySelectorAll(".relation-outline");
                        if (outlines.length) {
                            outlines.forEach((outline) => {
                                // Do something with the outlines, like showing or hiding
                                outline.setAttribute("stroke-opacity", isNowSelected ? "1" : "0");
                            });
                        }
                    }

                });


                // Emphasize matching circles
                document.querySelectorAll(`circle[id*="${clickedNoteId}"]`).forEach(circle => {
                    circle.style.fillOpacity = "1";
                    circle.style.stroke = "black";
                    circle.style.strokeWidth = "2px";

                });
            }


            // Main area x axis
            // https://github.com/d3/d3-axis#axisBottom
            let xAxis = d3
                .axisBottom(mainX)
                // https://github.com/d3/d3-axis#axis_tickSizeInner
                .tickSizeInner(5)
                .tickSizeOuter(0)
                // Abbreviated month format
                // .tickFormat(d3.timeFormat("%b"));

            // Append x axis to the bottom of main area
            main_ER_svg
                .append("g")
                .attr("class", "main-ER-x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            // Encounter ages
            age_ER
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
            // TODO: NEED TO MAKE ENCOUNTER AGE DYNAMIC
            let encounterAges = [53, 56];

            age_ER
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
            age_ER
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


            let overViewScrollerHeight = overviewHeight / 18;

            // Overview label text
            overview
                .append("text")
                .attr("x", -textMargin)
                .attr("y", overViewScrollerHeight) // Relative to the overview area
                .attr("dy", ".5ex")
                .attr("class", "overview_label")
                .text("Date");

            // Report dots in overview area
            // No need to use clipping path since the overview area contains all the report dots
            // overview
            //     .append("g")
            //     .selectAll(".overview_report")
            //     .data(eventData)
            //     .enter()
            //     .append("g")
            //     .append("circle")
            //     .attr("id", function (d) {
            //         // Prefix with "overview_"
            //         return "overview_" + d.noteName;
            //     })
            //     .attr("class", "overview_report")
            //     .attr("r", reportOverviewRadius)
            //     .attr("cx", function (d) {
            //         return d.formattedStartDate;
            //     })
            //     .attr("cy", function (d) {
            //         return getReportCirclePositionY(
            //             d,
            //             overviewY,
            //             overviewChemoTextRowHeightPerCount
            //         );
            //     })
            //     .style("fill", function (d) {
            //         return 'rgb(49, 163, 84)';
            //     });

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
                    y = overViewScrollerHeight / 2;

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
                    let selection = [0, svgWidth];
                    return "translate(" + [selection[i], -overViewScrollerHeight / 4] + ")";
                });

            // Function expression of updating custom handles positions
            let showAndMoveCustomBrushHandles = function (selection) {
                customBrushHandle
                    // First remove the "display: none" added by brushStart to show the handles
                    .style("display", null)
                    // Then move the handles to desired positions
                    .attr("transform", function (d, i) {
                        return "translate(" + [selection[i], -overViewScrollerHeight / 4] + ")";
                    });
            };

            // Function expression to create brush function redraw with selection
            // Need to define this before defining brush since it's function expression instead of function declaration
            let brushed = function () {
                // Ignore brush triggered by zooming
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return;

                let selection = d3.brushSelection(overviewBrush.node());
                if (!selection) return;

                // Update custom brush handles
                showAndMoveCustomBrushHandles(selection);

                // Rescale main X-axis domain based on brush
                mainX.domain(selection.map(overviewX.invert));

                // Redraw reports
                updateMainReports(eventData);

                // Sync zoom with brush
                svg.select(".zoom_ER").call(
                    zoom.transform,
                    d3.zoomIdentity
                        .scale(svgWidth / (selection[1] - selection[0]))
                        .translate(-selection[0], 0)
                );
            };

            // D3 brush
            let brush = d3
                .brushX()
                .extent([
                    [0, 0],
                    [svgWidth, overViewScrollerHeight],
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


    return (<div className="Timeline" id={svgContainerId}></div>);
}