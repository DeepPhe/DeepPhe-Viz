import React, {useState, useEffect} from "react";
import * as d3 from "d3v4";
import * as $ from "jquery";
import * as Cohort from '../../cohort.js'
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {ListGroup} from "react-bootstrap";
import {ListGroupItem} from "react-bootstrap";
import CardHeader from "../Card/CardHeader";
import Card from "../Card/Card";
import CardBody from "../Card/CardBody";

const allStagesLabel = "All stages";
const baseUri = "http://localhost:3001";
const baseGuiUri = "http://localhost:3000";
const transitionDuration = 800; // time in ms


export default class DerivedChart extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: false,
            title: false,
        };
    }

    componentDidMount() {
        const componentThis = this;

        function GetCohortData() {
            fetch(baseUri + '/api/cohortData').then(response => response.json()).then(cohortData => {

                componentThis.setState({data: cohortData}, () => {
                    let patientData = componentThis.state.data.patients;
                    patientData.sort((a, b) => a.firstEncounterAge.localeCompare(b.firstEncounterAge));

                    let youngest = patientData[0].firstEncounterAge;
                    let oldest = patientData[patientData.length - 1].firstEncounterAge;
                    patientData.sort((a, b) => a.patientId.localeCompare(b.patientId));
                    componentThis.setState({title: "Patients (" + patientData.length + " Patients w/ First Encounter Age Between " + youngest + " and " + oldest + ")"});
                    showDerivedChart(patientData, componentThis.state.data.stage, 0);
                });
            })
        }

        GetCohortData();


        // function getBiomarkers(patientIds) {
        //     let obj = JSON.parse(`{"biomarkersOverviewData":[{"label":"Patients with biomarkers found","count":"0.714"},{"label":"Patients without biomarkers found","count":"0.286"}],"patientsWithBiomarkersData":{"biomarkersPool":["has_ER_Status","has_PR_Status","has_HER2_Status"],"biomarkerStatus":["positive","negative","unknown"],"data":[{"biomarker":"has_ER_Status","positive":"0.667","negative":"0.333","unknown":"0.000"},{"biomarker":"has_PR_Status","positive":"0.667","negative":"0.333","unknown":"0.000"},{"biomarker":"has_HER2_Status","positive":"0.200","negative":"0.800","unknown":"0.000"}]}}`)
        //     showBiomarkersOverviewChart("biomarkers_overview", obj.biomarkersOverviewData);
        //     showPatientsWithBiomarkersChart("patients_with_biomarkers", obj.patientsWithBiomarkersData);
        //
        //     // $.ajax({
        //     //     url: baseUri + '/biomarkers/' + patientIds.join('+'),
        //     //     method: 'GET',
        //     //     async : true,
        //     //     dataType : 'json'
        //     // })
        //     //     .done(function(response) {
        //     //         response
        //     //         //console.log(response);
        //     //         showBiomarkersOverviewChart("biomarkers_overview", response.biomarkersOverviewData);
        //     //         showPatientsWithBiomarkersChart("patients_with_biomarkers", response.patientsWithBiomarkersData);
        //     //     })
        //     //     .fail(function () {
        //     //         console.log("Ajax error - can't get patients biomarkers info");
        //     //     });
        // }


    }

    //TODO: Make "patients", "diagnosis", etc. reactive just like title
    render() {
        const title = this.state.title;

        if (title) {
            return (
                <React.Fragment>

                        <Card>
                            <CardHeader  className={"basicCardHeader"}>
                                Case Details Given Age and Inclusion Criteria
                            </CardHeader>
                            <CardBody className={"basicCard"}>
                                <Row>
                                    <div id="target_patients_title" className="patients_table_title">{this.state.title}</div>
                                </Row>

                                <Row>
                                    <Col>
                                        <div id="patients"></div>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={12}>
                                        <div id="diagnosis"></div>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <div id="biomarkers_overview"></div>
                                    </Col>
                                    <Col md={6}>
                                        <div id="patients_with_biomarkers"></div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>

                </React.Fragment>
            );
        } else {
            return (
                <span>Loading patient data...</span>
            )
        }
    }
}

/*
Everything below here is pretty much "old school/global java" and needs to be updated
 */
export function removeChart(containerId) {
    d3.select("#" + containerId).selectAll("*").remove();
}

export function showPatientsWithBiomarkersChart(svgContainerId, data) {
    const svgWidth = 480;
    const svgHeight = 180;
    const svgPadding = {top: 10, right: 10, bottom: 15, left: 80};
    const chartWidth = svgWidth - svgPadding.left - svgPadding.right;
    const chartHeight = svgHeight - svgPadding.top - svgPadding.bottom;
    const chartTopMargin = 35;

    const legendGroupWidth = 65;
    const legendRectSize = 10;
    const legnedTextRectPad = 3;

    // Band scale of biomarkers
    let y = d3.scaleBand()
        .domain(data.biomarkersPool)
        .range([0, chartHeight - chartTopMargin])
        .padding(0.2);

    // Percentage X
    let x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, chartWidth - legendGroupWidth]);

    // Colors of status: positive, negative, unknown
    let color = d3.scaleOrdinal()
        .range(["rgb(214, 39, 40)", "rgb(44, 160, 44)", "rgb(150, 150, 150)"]);

    // https://github.com/d3/d3-format
    // keep one decimal in percentage, like 45.5%
    let formatPercentBarText = d3.format(".1%");

    // No decimal, like 45%
    let formatPercentAxisTick = d3.format(".0%");

    // Create the stack data structure
    // https://github.com/d3/d3-shape/blob/master/README.md#stack
    var stack = d3.stack()
        .keys(data.biomarkerStatus)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    var stackData = stack(data.data);

    // Only draw everything for the first time
    if (d3.select(".biomarkers_chart_group").empty()) {
        let svg = d3.select("#" + svgContainerId).append("svg")
            .attr("class", "biomarkers_chart") // Used for CSS styling
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        let biomarkersChartGrp = svg.append("g")
            .attr("class", "biomarkers_chart_group")
            .attr("transform", "translate(" + svgPadding.left + "," + chartTopMargin + ")");

        // Chart title
        svg.append("text")
            .attr("class", "biomarkers_chart_title")
            .attr("transform", function (d) {
                return "translate(" + svgWidth / 2 + ", " + svgPadding.top + ")";
            })
            .text("Patients With Biomarkers Found");

        let biomarkerStatusGrp = biomarkersChartGrp.selectAll(".biomarker_status_group")
            .data(stackData)
            .enter().append("g")
            .attr("class", function (d) {
                return "biomarker_status_group " + d.key;
            })
            .attr("fill", function (d) {
                return color(d.key);
            });

        // Status bars inside each biomarker group
        biomarkerStatusGrp.selectAll(".biomarker_status_bar")
            // here d is each object in the stackData array
            .data(function (d) {
                return d;
            })
            .enter().append("rect")
            .attr("class", "biomarker_status_bar")
            .attr("x", function (d) {
                return x(d[0]);
            })
            .attr("y", function (d) {
                return y(d.data.biomarker);
            })
            .attr("height", y.bandwidth())
            .transition()
            .duration(transitionDuration)
            .attr("width", function (d) {
                // Return the absolute value to avoid errors due to negative value
                return Math.abs(x(d[1]) - x(d[0]));
            });

        // Append the percentage text
        biomarkerStatusGrp.selectAll(".biomarker_status_percentage")
            // here d is each object in the stackData array
            .data(function (d) {
                // Add status property to make it available in the text()
                d.forEach(function (item) {
                    item.status = d.key;
                });

                return d;
            })
            .enter().append("text")
            .attr("id", function (d) {
                return d.data.biomarker + "_" + d.status;
            })
            .attr("class", "biomarker_status_percentage")
            .attr("x", function (d) {
                return x(d[0]) + 5; // Add 5px margin to left
            })
            .attr("y", function (d) {
                return y(d.data.biomarker) + y.bandwidth() / 2;
            })
            .text(function (d) {
                // Only show percentage text for values bigger than 10%
                if (d.data[d.status] > 0.1) {
                    return formatPercentBarText(d.data[d.status]);
                }
            });

        // Y axis
        biomarkersChartGrp.append("g")
            .attr("class", "biomarkers_chart_y_axis")
            .call(d3.axisLeft(y))
            // Now modify the label text to add patients count
            .selectAll("text")
            .text(function (d) {
                if (d === "has_ER_Status") {
                    return "ER";
                } else if (d === "has_PR_Status") {
                    return "PR";
                } else if (d === "has_HER2_Status") {
                    return "HER2/Neu";
                } else {
                    return d.replace("_", " ");
                }
            });

        // X axis
        biomarkersChartGrp.append("g")
            .attr("class", "biomarkers_chart_x_axis")
            .attr("transform", "translate(0," + (chartHeight - chartTopMargin) + ")")
            .call(d3.axisBottom(x).tickFormat(formatPercentAxisTick));

        // Status legend
        let legend = biomarkersChartGrp.append("g")
            .attr("class", "biomarkers_chart_legend")
            .selectAll("g")
            .data(data.biomarkerStatus)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(0," + i * (legendRectSize + legnedTextRectPad) + ")";
            });

        legend.append("rect")
            .attr("class", "biomarker_status_legend")
            .attr("x", chartWidth - legendRectSize)
            .attr("width", legendRectSize)
            .attr("height", legendRectSize)
            .attr("fill", function (d) {
                return color(d);
            })
            .attr("stroke", function (d) {
                return color(d);
            });

        legend.append("text")
            .attr("class", "biomarker_status_legend_text")
            .attr("x", chartWidth - legendRectSize - legnedTextRectPad)
            .attr("y", 9)
            .text(function (d) {
                // Capitalized
                return d.charAt(0).toUpperCase() + d.slice(1);
                ;
            });
    } else {
        // Update the data
        let biomarkerStatusGrp = d3.selectAll(".biomarkers_chart_group").selectAll(".biomarker_status_group")
            .data(stackData);

        // Update the status bars position and width
        biomarkerStatusGrp.selectAll(".biomarker_status_bar")
            // here d is each object in the stackData array
            .data(function (d) {
                return d;
            })
            .attr("x", function (d) {
                return x(d[0]);
            })
            .transition()
            .duration(transitionDuration)
            .attr("width", function (d, i) {
                // Return the absolute value to avoid errors due to negative value
                // during transitioning from one stage to another stage
                return Math.abs(x(d[1]) - x(d[0]));
            });

        // Update the percentage text and x position
        biomarkerStatusGrp.selectAll(".biomarker_status_percentage")
            // here d is each object in the stackData array
            .data(function (d) {
                // Add status property to make it available in the text()
                d.forEach(function (item) {
                    item.status = d.key;
                });

                return d;
            })
            .attr("x", function (d) {
                return x(d[0]) + 5;
            })
            .text(function (d) {
                // Only show percentage text for values bigger than 10%
                if (d.data[d.status] > 0.1) {
                    return formatPercentBarText(d.data[d.status]);
                }
            });
    }
}

export function showBiomarkersOverviewChart(svgContainerId, data) {
    const svgWidth = 480;
    const svgHeight = 120;
    const svgPadding = {top: 10, right: 15, bottom: 15, left: 180};
    const chartWidth = svgWidth - svgPadding.left - svgPadding.right;
    const chartHeight = svgHeight - svgPadding.top - svgPadding.bottom;
    const chartTopMargin = 35;

    let yLables = [];
    data.forEach(function (obj) {
        yLables.push(obj.label);
    });

    // Band scale of biomarkers
    let y = d3.scaleBand()
        .domain(yLables)
        .range([0, chartHeight - chartTopMargin])
        .padding(0.2);

    // Percentage X
    let x = d3.scaleLinear()
        .domain([0, 1])
        .range([0, chartWidth]);

    // https://github.com/d3/d3-format
    // keep one decimal in percentage, like 45.5%
    let formatPercentBarText = d3.format(".1%");

    // No decimal, like 45%
    let formatPercentAxisTick = d3.format(".0%");

    // Only draw everything for the first time
    if (d3.select(".biomarkers_overview_chart_group").empty()) {
        let svg = d3.select("#" + svgContainerId).append("svg")
            .attr("class", "biomarkers_overview_chart") // Used for CSS styling
            .attr("width", svgWidth)
            .attr("height", svgHeight);

        // Chart title
        svg.append("text")
            .attr("class", "biomarkers_chart_title")
            .attr("transform", function (d) {
                return "translate(" + svgWidth / 2 + ", " + svgPadding.top + ")";
            })
            .text("Biomarkers Overview");

        let biomarkersPatientsChartGrp = svg.append("g")
            .attr("class", "biomarkers_overview_chart_group")
            .attr("transform", "translate(" + svgPadding.left + "," + chartTopMargin + ")");

        // Bars
        let barGrp = biomarkersPatientsChartGrp.selectAll(".biomarkers_overview_chart_bar_group")
            .data(data)
            .enter().append("g")
            .attr("class", "biomarkers_overview_chart_bar_group");

        // Bar
        barGrp.append("rect")
            .attr("class", "biomarkers_overview_chart_bar")
            .attr("x", 0)
            .attr("y", function (d) {
                return y(d.label);
            })
            .attr("height", y.bandwidth())
            .transition()
            .duration(transitionDuration)
            .attr("width", function (d) {
                return x(d.count);
            });

        // Percentage text
        barGrp.append("text")
            .attr("id", function (d) {
                return d.label + "_" + d.status;
            })
            .attr("class", "biomarkers_overview_chart_bar_percentage")
            .attr("x", 5)
            .attr("y", function (d) {
                return y(d.label) + y.bandwidth() / 2;
            })
            .text(function (d) {
                return formatPercentBarText(d.count);
            });

        // Y axis
        biomarkersPatientsChartGrp.append("g")
            .attr("class", "biomarkers_overview_chart_y_axis")
            .call(d3.axisLeft(y));

        // X axis
        biomarkersPatientsChartGrp.append("g")
            .attr("class", "biomarkers_overview_chart_x_axis")
            .attr("transform", "translate(0," + (chartHeight - chartTopMargin) + ")")
            .call(d3.axisBottom(x).tickFormat(formatPercentAxisTick));
    } else {
        // Update the data
        let biomarkersPatientsGrp = d3.selectAll(".biomarkers_overview_chart_group").selectAll(".biomarkers_overview_chart_bar_group")
            .data(data);

        // Update the bar width for each category
        biomarkersPatientsGrp.select(".biomarkers_overview_chart_bar")
            .transition()
            .duration(transitionDuration)
            .attr("width", function (d) {
                return x(d.count);
            });


        // Update the percentage text
        biomarkersPatientsGrp.select(".biomarkers_overview_chart_bar_percentage")
            .text(function (d) {
                return formatPercentBarText(d.count);
            });
    }
}

export function showDerivedChart(patientsArr, stage, firstEncounterAgeRange) {
    if (patientsArr.length > 0) {
        let patientIds = [];
        patientsArr.forEach(function (patient) {
            patientIds.push(patient.patientId);
        });

        //showResultsTitle("results_title", patientsArr, stage, firstEncounterAgeRange);

        // Resulting target patients list
        showPatientsList("patients", patientsArr);

        // Make another ajax call to get diagnosis for the list of patients
        getDiagnosis(patientIds);

        // Make another ajax call to get biomarkers info for the list of patients
        Cohort.getBiomarkers(patientIds);
    } else {
        console.log("Empty target patients list");
        // We'll need to remove the previous resulting charts
        removeChart("patients");
        removeChart("diagnosis");
        removeChart("biomarkers");
    }
}

export function showDiagnosisChart(svgContainerId, data) {
    removeChart(svgContainerId);

    const diagnosisDotRadius = 4;
    const highlightedDotRadius = 5;
    const overviewDotRadius = 1.5;
    const svgPadding = {top: 10, right: 75, bottom: 10, left: 100};
    const gapBetweenYAxisAndXAxis = 10;
    const chartTopMargin = 40;
    const xAxisHeight = 20;
    // 15 is the line height of each Y axis label
    const yAxisHeight = data.diagnosisGroups.length * 15;
    const overviewHeight = data.diagnosisGroups.length * overviewDotRadius * 3;
    const svgWidth = 700;
    const svgHeight = xAxisHeight + yAxisHeight + chartTopMargin + overviewHeight + gapBetweenYAxisAndXAxis * 2;
    const chartWidth = svgWidth - svgPadding.left - svgPadding.right;
    const overviewWidth = chartWidth - gapBetweenYAxisAndXAxis;
    const chartHeight = svgHeight - svgPadding.top - svgPadding.bottom - overviewHeight - gapBetweenYAxisAndXAxis;

    let svg = d3.select("#" + svgContainerId).append("svg")
        .attr("class", "diagnosis_chart") // Used for CSS styling
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    let diagnosisChartGrp = svg.append("g")
        .attr("class", "diagnosis_chart_group")
        .attr("transform", "translate(" + svgPadding.left + "," + chartTopMargin + ")");

    const dotColor = "rgb(107, 174, 214)";
    const highlightedDotColor = "rgb(230, 85, 13)";

    let xDomain = [];

    let diagnosisDots = [];

    data.data.forEach(function (d) {

        xDomain.push(d.patient);

        d.diagnosisGroups.forEach(function (diagGrp) {
            let dot = {};
            dot.patientId = d.patient;
            dot.diagnosisGroups = diagGrp;

            diagnosisDots.push(dot);
        });
    });

    let widthPerPatient = (chartWidth - gapBetweenYAxisAndXAxis * 2) / (xDomain.length - 1);
    let patientsNumDisplay = 4;

    // Show the first patientsNumDisplay patients by default
    let defaultPatients = xDomain.slice(0, patientsNumDisplay);

    // Set the ranges
    let x = d3.scalePoint()
        .domain(defaultPatients)
        .range([gapBetweenYAxisAndXAxis, overviewWidth]);

    let overviewX = d3.scalePoint()
        .domain(xDomain)
        .range([gapBetweenYAxisAndXAxis, overviewWidth]);

    let y = d3.scalePoint()
        .domain(data.diagnosisGroups)
        .range([0, chartHeight - chartTopMargin - svgPadding.bottom - gapBetweenYAxisAndXAxis]);

    let overviewY = d3.scalePoint()
        .domain(data.diagnosisGroups)
        .range([0, overviewHeight]);

    // Replace all spaces, commas, and () with underscores
    let diagnosis2Class = function (diagnosis) {
        return diagnosis.replace(/ |,|\(|\)|/g, "_");
    };

    // Chart title
    svg.append("text")
        .attr("class", "diagnosis_chart_title")
        .attr("transform", function (d) {
            return "translate(" + svgWidth / 2 + ", " + svgPadding.top + ")";
        })
        .text("Diagnosis");

    // Patient diagnosis dots
    diagnosisChartGrp.selectAll(".diagnosis_dot")
        .data(diagnosisDots.filter(function (obj) {
            // By default only show the dots of patients in the x.domain()
            return x.domain().indexOf(obj.patientId) !== -1
        }))
        .enter().append("circle")
        .attr("class", function (d) {
            return "diagnosis_dot " + d.patientId;
        })
        .attr("cx", function (d, i) {
            return x(d.patientId);
        })
        .attr("cy", function (d) {
            return y(d.diagnosisGroups);
        })
        .attr("r", diagnosisDotRadius)
        .attr("fill", dotColor);


    // Add the x Axis
    diagnosisChartGrp.append("g")
        .attr("transform", "translate(0," + (chartHeight - chartTopMargin - svgPadding.bottom) + ")")
        .attr("class", "diagnosis_x_axis");

    createXAxis();

    // Will be reused when moving slider
    function createXAxis() {
        diagnosisChartGrp.append("g")
            .attr("transform", "translate(0," + (chartHeight - chartTopMargin - svgPadding.bottom) + ")")
            .attr("class", "diagnosis_x_axis")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("class", "diagnosis_x_label")
            .on("mouseover", function (d) {
                // Highlight all dots of this patient
                d3.selectAll("." + d)
                    .attr("r", highlightedDotRadius)
                    .attr("fill", highlightedDotColor);

                // Insert instead of append() guideline so it gets covered by dots
                d3.select(".diagnosis_chart_group").insert("line", ":first-child")
                    .attr("class", "diagnosis_guideline")
                    .attr("x1", x(d))
                    .attr("y1", 0)
                    .attr("x2", x(d))
                    .attr("y2", chartHeight - chartTopMargin);

                // Also highlight the corresponding Y labels
                data.patients[d].forEach(function (diagnosis) {
                    $("." + diagnosis2Class(diagnosis)).addClass("highlighted_diagnosis_label");
                });
            })
            .on("mouseout", function (d) {
                // Reset dot size and color
                d3.selectAll("." + d)
                    .attr("r", diagnosisDotRadius)
                    .attr("fill", dotColor);

                // Remove added guideline
                d3.selectAll(".diagnosis_guideline").remove();

                // Also dehighlight the corresponding Y labels
                data.patients[d].forEach(function (diagnosis) {
                    $("." + diagnosis2Class(diagnosis)).removeClass("highlighted_diagnosis_label");
                });
            });
    }

    // Add the y Axis
    diagnosisChartGrp.append("g")
        .call(d3.axisLeft(y))
        // Now add class to the label text
        .selectAll("text")
        .attr("class", function (d) {
            return diagnosis2Class(d);
        })
        // Replace underscore with white space
        .text(function (d) {
            return d;
        });

    // Only show the slider when there are more patients than patientsNumDisplay
    if (xDomain.length > patientsNumDisplay) {
        createSlider();
    }

    function createSlider() {
        // Overview area with slider
        let overview = svg.append("g")
            .attr("class", "overview")
            .attr("transform", "translate(" + svgPadding.left + "," + (svgPadding.top + chartHeight + gapBetweenYAxisAndXAxis) + ")");

        overview.selectAll(".overview_diagnosis_dot")
            .data(diagnosisDots)
            .enter().append("g").append("circle")
            .attr('class', 'overview_diagnosis_dot')
            .attr("cx", function (d) {
                return overviewX(d.patientId);
            })
            .attr("cy", function (d) {
                return overviewY(d.diagnosisGroups);
            })
            .attr("r", overviewDotRadius)
            .attr("fill", dotColor);

        // Add overview step slider
        let sliderWidth = widthPerPatient * (patientsNumDisplay - 1) + 2 * overviewDotRadius;

        // Highlight the target patients in target patients list by default
        highlightTargetPatients(defaultPatients);

        let drag = d3.drag()
            .on("drag", dragged);

        overview.append("rect")
            .attr("class", "slider")
            .attr("x", gapBetweenYAxisAndXAxis - overviewDotRadius)
            .attr("y", -overviewDotRadius) // take care of the radius
            .attr("width", sliderWidth)
            .attr("height", overviewHeight + 2 * overviewDotRadius)
            .attr("pointer-events", "all")
            .attr("cursor", "ew-resize")
            .call(drag);

        function dragged(d) {
            let dragX = d3.event.x;

            // Restrict start and end point of the slider
            const beginX = 0;
            // endX is always the x position of the first patient dot in the slider
            // when the slider is moved to the very end
            const endX = overviewX(xDomain[xDomain.length - patientsNumDisplay]) - overviewDotRadius * 2;

            if (dragX < beginX) {
                dragX = beginX;
            }

            if (dragX > endX) {
                dragX = endX;
            }

            // Now we need to know the start and end index of the domain array
            let startIndex = Math.floor(dragX / widthPerPatient);

            // Step Slider
            let midPoint = (overviewX(xDomain[startIndex]) + overviewX(xDomain[startIndex + 1])) / 2;

            let targetIndex = null;
            if (dragX < midPoint) {
                targetIndex = startIndex;
            } else {
                targetIndex = startIndex + 1;
                targetIndex = startIndex + 1;
            }

            let endIndex = targetIndex + patientsNumDisplay;

            // Move the slider rect to new position
            let newX = overviewX(xDomain[targetIndex]) - overviewDotRadius;

            d3.select(this).attr("x", newX);

            // Element of endIndex is not included
            let newXDomain = xDomain.slice(targetIndex, endIndex);

            // Update x domain
            x.domain(newXDomain);

            // Remove and recreate the x axis
            diagnosisChartGrp.selectAll(".diagnosis_x_axis").remove();
            createXAxis();

            let newDiagnosisDots = diagnosisDots.filter(function (obj) {
                return newXDomain.indexOf(obj.patientId) !== -1
            });

            // Remove all old dots
            diagnosisChartGrp.selectAll(".diagnosis_dot").remove();

            // Recreate and position the new dots
            diagnosisChartGrp.selectAll(".diagnosis_dot")
                .data(newDiagnosisDots)
                .enter().append("circle")
                .attr("class", function (d) {
                    return "diagnosis_dot " + d.patientId;
                })
                .attr("cx", function (d) {
                    return x(d.patientId);
                })
                .attr("cy", function (d) {
                    return y(d.diagnosisGroups);
                })
                .attr("r", 4)
                .attr("fill", dotColor);

            // Also highlight the target patients in the patient list
            $(".target_patient").removeClass("highlighted_target_patient_in_diagnosis");
            highlightTargetPatients(newXDomain);
        };
    }
}

export function showPatientsList(containerId, data) {

    function rafAsync() {
        return new Promise(resolve => {
            requestAnimationFrame(resolve); //faster than set time out
        });
    }

    function checkElement(selector) {
        if (document.querySelector(selector) === null) {
            return rafAsync().then(() => checkElement(selector));
        } else {
            return Promise.resolve(true);
        }
    }

    //This is necessary until this is "Reactified" properly...bascially we are waiting
    //for the "patients" div to get created before populating it.
    checkElement("#" + containerId).then((element) => {
        removeChart(containerId);
        let html = '<div class="row">';
        data.sort((a, b) => a.patientId.localeCompare(b.patientId));
        data.forEach(function (patient) {

            html += '<div class="col-md-2"><a id="' + patient.patientId + '" class="target_patient" href="' + baseGuiUri + '/patient/' + patient.patientId + '" target="_blank">' + patient.patientId + '</a> (' + patient.firstEncounterAge + ')</div>';
        });
        html += '</div>';
        $("#" + containerId).html(html);
    })
}

export function getDiagnosis(patientIds) {
    $.ajax({
        url: "http://localhost:3001/api/diagnosis/" + patientIds.join('+'),
        method: 'GET',
        async: true,
        dataType: 'json'
    })
        .done(function (response) {
            showDiagnosisChart("diagnosis", response);
        })
        .fail(function () {
            console.log("Ajax error - can't get patients diagnosis info");
        });
}

export function highlightTargetPatients(patientsArr) {
    patientsArr.forEach(function (patient) {
        $("#" + patient).addClass("highlighted_target_patient_in_diagnosis");
    });
}
