import GridItem from "../Grid/GridItem";
import React, {useRef, useState, useCallback} from "react";
import {BarChart} from '@mui/x-charts';
import {styled} from '@mui/material/styles';
import {FormLabel} from "@mui/material";
import GridContainer from "../Grid/GridContainer";
import _ from 'lodash';
export function ConfidenceDataViz(props) {
    const handleConfidenceChange = props.handleConfidenceChange;
    const concepts = props.concepts;
    // const value = props.value;
    const [confidencePercent, setConfidencePercent] = useState(0);
    const [sliderPosition, setSliderPosition] = useState(40);




    function getSemanticGroupConfidenceCount(name){
        const confidenceList = concepts.filter(item => item.dpheGroup === name).map(item => item.confidence);
        // console.log(confidenceList);
        return percentCounter(confidenceList);

    }

    function percentCounter(confidenceList){
        const buckets = Array(10).fill(0); //fill all buckets as 0 init

        confidenceList.forEach(item => {
            if (item >= 0 && item <= 1) {
                const index = Math.min(Math.floor(item * 10), 9);
                buckets[index] += 1; // add an iterator to the index of the percentage it falls into i.e. '.29 = 2'
            }
        });
        return buckets;
    }

    function groupSemantics(lists) {
        if (lists.length === 0) return [];

        const length = lists[0].length;
        const initial = Array(length).fill(0);

        return lists.reduce((acc, list) => acc.map((num, idx) => num + (list[idx] || 0)), initial);
    }

    const Behavior = getSemanticGroupConfidenceCount('Behavior');
    const DSQ = getSemanticGroupConfidenceCount('Disease Stage Qualifier');
    const DGQ = getSemanticGroupConfidenceCount('Disease Grade Qualifier');
    const BFoS = getSemanticGroupConfidenceCount('Body Fluid or Substance');
    const BodyPart = getSemanticGroupConfidenceCount("Body Part");
    const CihTR = getSemanticGroupConfidenceCount("Chemo/immuno/hormone Therapy Regimen");
    const CTR = getSemanticGroupConfidenceCount("Clinical Test Result");
    const CCoD = getSemanticGroupConfidenceCount("Clinical Course of Disease");
    const DoD = getSemanticGroupConfidenceCount("Disease or Disorder");
    const DQ = getSemanticGroupConfidenceCount("Disease Qualifier");
    const Finding = getSemanticGroupConfidenceCount("Finding");
    const Gene = getSemanticGroupConfidenceCount("Gene");
    const GP = getSemanticGroupConfidenceCount("Gene Product");
    const GQ = getSemanticGroupConfidenceCount("General Qualifier");
    const GTNMF = getSemanticGroupConfidenceCount("Generic TNM Finding");
    const IoP = getSemanticGroupConfidenceCount("Intervention or Procedure");
    const ImgD = getSemanticGroupConfidenceCount("Imaging Device");
    const LN = getSemanticGroupConfidenceCount("Lymph Node");
    const TQ = getSemanticGroupConfidenceCount("Temporal Qualifier");
    const Tissue = getSemanticGroupConfidenceCount("Tissue");
    const Mass = getSemanticGroupConfidenceCount("Mass");
    const Neoplasm = getSemanticGroupConfidenceCount("Neoplasm");
    const PP = getSemanticGroupConfidenceCount("Pathologic Process");
    const PTNMF = getSemanticGroupConfidenceCount("Pathologic TNM Finding");
    const PS = getSemanticGroupConfidenceCount("Pharmacologic Substance");
    const Position = getSemanticGroupConfidenceCount("Position");
    const PoA = getSemanticGroupConfidenceCount("Property or Attribute");
    const QC = getSemanticGroupConfidenceCount("Quantitative Concept");
    const Side = getSemanticGroupConfidenceCount("Side");
    const SQ = getSemanticGroupConfidenceCount("Spatial Qualifier");
    const Severity = getSemanticGroupConfidenceCount("Severity");
    const Unknown = getSemanticGroupConfidenceCount("Unknown");

    const orangeGroup = groupSemantics([Behavior, DSQ, DGQ, TQ, Severity, PTNMF, GTNMF]); //Done
    const yellowGroup = groupSemantics([DQ, PoA, GQ, CCoD, PP]); //Done
    const blueGroup = groupSemantics([LN, BodyPart, BFoS, Side, SQ, Tissue]);
    const pinkGroup = groupSemantics([Finding, CTR, Gene, GP]);
    const greenGroup = groupSemantics([DoD, Neoplasm, Mass, QC]);
    const purpleGroup = groupSemantics([PS, CihTR, IoP, ImgD]);
    const brownGroup = groupSemantics([Position]);
    const greyGroup = groupSemantics([Unknown]);


    const series = [
        { data: orangeGroup, stack: 'total', color: 'rgba(255, 135, 18, 0.65)'},
        { data: yellowGroup, stack: 'total', color: 'rgba(255, 191, 0, 0.65)' },
        { data: blueGroup, stack: 'total', color: 'rgba(173, 216, 230, 0.65)' },
        { data: pinkGroup, stack: 'total', color: 'rgba(255, 158, 164, 0.65)' },
        { data: greenGroup, stack: 'total', color: 'rgba(127, 206, 148, 0.65)' },
        { data: purpleGroup, stack: 'total', color: 'rgba(179, 108, 239, 0.65)' },
        { data: brownGroup, stack: 'total', color: 'rgba(255, 158, 164, 0.65)' },
        { data: greyGroup, stack: 'total', color: 'rgba(128, 128, 128, 0.65)' },
    ]

    const chartRef = useRef(null);

    const throttledHandleConfidenceChange = useCallback(
        _.throttle((confidencePercent) => {
            handleConfidenceChange(confidencePercent);
        }, 300), // 100ms throttle interval
        []
    );

    const handleSliderChange = (event) => {
        const yAxisBuffer = 40
        const endOfGraphBuffer = 16
        const chartRect = chartRef.current.getBoundingClientRect();
        let newValue = event.clientX - chartRect.left;
        if (newValue >= yAxisBuffer && newValue <= chartRect.width-endOfGraphBuffer) {
            const graphPercent = ((chartRect.width - endOfGraphBuffer) - yAxisBuffer) / 100
            const confidencePercent = Math.ceil((newValue - yAxisBuffer ) / graphPercent)
            setSliderPosition(newValue);
            setConfidencePercent(confidencePercent);
            throttledHandleConfidenceChange(confidencePercent);

        }
    };

    const handleMouseDown = () => {
        document.addEventListener('mousemove', handleSliderChange);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleSliderChange);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    const SliderLine = styled('div')(({ theme }) => ({
        position: 'absolute',
        top: 19,
        bottom: 0,
        width: '4px',  // Increased thickness
        backgroundColor: theme.palette.primary.main,
        cursor: 'ew-resize',
        zIndex: 10,  // Ensure it is above the chart
        height: '255px',
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${-sliderPosition+40}px`, // Move the grey background to the left relative to the slider position
            width: `${sliderPosition-40}px`, // The width of the grey background changes dynamically
            backgroundColor: 'rgba(128, 128, 128, 0.5)', // Transparent grey color
            zIndex: -1, // Ensure it appears behind the slider line
            display: "block",
        },
        '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '18px',
            height: '20px', // Thickness of the lines
            backgroundColor: 'lightgrey',
            borderRadius: '2px', // Optional: Rounds the edges of the lines
            display: 'block',
        },
    }));



    return (
        <GridContainer spacing={2}>
            <GridItem xs={12} alignItems='center'>
                <BarChart
                    ref={chartRef}
                    height={300}
                    // series={emptySeries}
                    series={series}
                    margin={{ top: 20, bottom: 26, left: 40, right: 15 }}
                    yAxis={[{label: 'Occurrences',
                    labelFontSize: 17}]}
                    disableAxisListener={true}
                    skipAnimation={true}
                    xAxis={[
                        {
                            scaleType: 'band',
                            data: ['10%', '20%', '30%', '40%', '50%', '60%', '70%','80%', '90%', '100%'],
                            tickLabelPlacement: "tick",
                            tickPlacement: "end",
                        },
                    ]}
                    tooltip={{
                        trigger: 'none',
                    }}
                    axisHighlight={{
                        x: 'none',
                        y: 'none'
                    }}
                />
                <SliderLine style={{ left: `${sliderPosition}px` }} onMouseDown={handleMouseDown}/>

            </GridItem>
            <GridItem xs={12}>
                <FormLabel sx={{ fontWeight: 'light', fontSize: '1em', marginBottom: '-5px',display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center' }}>
                    <b className="confidence_title">Confidence: </b> <span id="confidenceValue">{confidencePercent}</span> %
                </FormLabel>
            </GridItem>
        </GridContainer>
    );
}
