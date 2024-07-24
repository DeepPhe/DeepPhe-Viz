import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import {axisClasses, BarChart} from '@mui/x-charts';
import {FormLabel} from "@mui/material";

export function ConfidenceDataViz(props) {
    const handleConfidenceChange = props.handleConfidenceChange;
    const concepts = props.concepts;
    const [value, setValue] = useState(50);
    // const orange1 = concepts.filter(concepts => concepts.confidence >= 0 && concepts.confidence <= 0.164);
    // const orange2 = concepts.filter(concepts => concepts.confidence >= 0.165 && concepts.confidence <= 0.329);
    // const yellow1 = concepts.filter(concepts => concepts.confidence >= 0.330 && concepts.confidence <= 0.494);
    // const yellow2 = concepts.filter(concepts => concepts.confidence >= 0.495 && concepts.confidence <= 0.659);
    // const green1 = concepts.filter(concepts => concepts.confidence >= 0.660 && concepts.confidence <= 0.824);
    // const green2 = concepts.filter(concepts => concepts.confidence >= 0.825 && concepts.confidence <= 1);


    // const orange1 = concepts.filter(concepts => concepts.confidence >= 0 && concepts.confidence <= 0.050); 5%
    // const orange2 = concepts.filter(concepts => concepts.confidence >= 0.051 && concepts.confidence <= 0.10);
    // const orange3 = concepts.filter(concepts => concepts.confidence >= 0.101 && concepts.confidence <= 0.15);
    // const orange4 = concepts.filter(concepts => concepts.confidence >= 0.151 && concepts.confidence <= 0.20);
    // const orange5 = concepts.filter(concepts => concepts.confidence >= 0.201 && concepts.confidence <= 0.25);
    // const orange6 = concepts.filter(concepts => concepts.confidence >= 0.251 && concepts.confidence <= 0.30);
    // const orange7 = concepts.filter(concepts => concepts.confidence >= 0.301 && concepts.confidence <= 0.35);
    // const yellow1 = concepts.filter(concepts => concepts.confidence >= 0.351 && concepts.confidence <= 0.40);
    // const yellow2 = concepts.filter(concepts => concepts.confidence >= 0.451 && concepts.confidence <= 0.50);
    // const yellow3 = concepts.filter(concepts => concepts.confidence >= 0.501 && concepts.confidence <= 0.55);
    // const yellow4 = concepts.filter(concepts => concepts.confidence >= 0.551 && concepts.confidence <= 0.60);
    // const yellow5 = concepts.filter(concepts => concepts.confidence >= 0.601 && concepts.confidence <= 0.65);
    // const yellow6 = concepts.filter(concepts => concepts.confidence >= 0.651 && concepts.confidence <= 0.70);
    // const green1 = concepts.filter(concepts => concepts.confidence >= 0.701 && concepts.confidence <= 0.75);
    // const green2 = concepts.filter(concepts => concepts.confidence >= 0.751 && concepts.confidence <= 80);
    // const green3 = concepts.filter(concepts => concepts.confidence >= 0.801 && concepts.confidence <= 0.85);
    // const green4 = concepts.filter(concepts => concepts.confidence >= 0.851 && concepts.confidence <= 90);
    // const green5 = concepts.filter(concepts => concepts.confidence >= 0.901 && concepts.confidence <= 0.95);
    // const green6 = concepts.filter(concepts => concepts.confidence >= 0.951 && concepts.confidence <= 1);

    const orange1 = concepts.filter(concepts => concepts.confidence >= 0 && concepts.confidence <= 0.10);
    const orange2 = concepts.filter(concepts => concepts.confidence >= 0.101 && concepts.confidence <= 0.20);
    const orange3 = concepts.filter(concepts => concepts.confidence >= 0.201 && concepts.confidence <= 0.30);
    const orange4 = concepts.filter(concepts => concepts.confidence >= 0.301 && concepts.confidence <= 0.40);
    const yellow1 = concepts.filter(concepts => concepts.confidence >= 0.401 && concepts.confidence <= 0.50);
    const yellow2 = concepts.filter(concepts => concepts.confidence >= 0.501 && concepts.confidence <= 0.60);
    const yellow3 = concepts.filter(concepts => concepts.confidence >= 0.601 && concepts.confidence <= 0.70);
    const green1 = concepts.filter(concepts => concepts.confidence >= 0.701 && concepts.confidence <= 0.80);
    const green2 = concepts.filter(concepts => concepts.confidence >= 0.801 && concepts.confidence <= 0.90);
    const green3 = concepts.filter(concepts => concepts.confidence >= 0.901 && concepts.confidence <= 1);


    const series = [{
        // data: [orange1.length, orange2.length, orange3.length, orange4.length, orange5.length, orange6.length, orange7.length,
        //     yellow1.length, yellow2.length, yellow3.length, yellow4.length, yellow5.length, yellow6.length,
        //     green1.length, green2.length, green3.length, green4.length, green5.length, green6.length],
        data: [orange1.length, orange2.length, orange3.length, orange4.length, yellow1.length, yellow2.length, yellow3.length,
            green1.length, green2.length, green3.length],
        // data: [orange1.length, orange2.length, yellow1.length, yellow2.length,  green1.length, green2.length],
        // label: ['0-16.5%', '16.5-33%', '33-49.5%', '49.5-66%', '66-82.5%', '82.5-99%' ]
    }];

    const chartSetting = {
        sx: {
            [`.${axisClasses.left} .${axisClasses.label}`]: {
                transform: "rotate(-90deg) translate(0px, -20px)"
            },
            [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: {
                transform: "rotateZ(-45deg)"
            }
        }
    };


    //TODO: BRING up Dermis issue, 7 occurances in bar chart, but only 6 in filtered list.
    // console.log(concepts);
    // console.log(green1, green2);


    return (
        <GridItem xs={8} alignItems='center'>
            <FormLabel sx={{ fontWeight: 'light', fontSize: '1em', marginBottom: '-5px' }}>
                <b className="titles">Confidence:</b>
            </FormLabel>
            <BarChart
                height={190}
                series={series}
                margin={{ top: 10, bottom: 26, left: 40, right: 10 }}
                yAxis={[{label: 'Occurrences'}]}
                xAxis={[
                    {
                        scaleType: 'band',
                        // data: ['16.5%','33%', '49.5%', '66%', '82.5%', '99%'],
                        // data: ['5%','10%', '15%', '20%', '25%', '30%', '35%', '40%', '45%', '50%', '60%', '65%', '70%', '75%',
                        //     '80%', '85%', '90%', '95%', '100%'],  5%
                        data: ['10%', '20%', '30%', '40%', '50%', '60%', '70%','80%', '90%', '100%'],
                        colorMap:
                            ({
                                type: 'ordinal',
                                // values: ['5%','10%', '15%', '20%', '25%', '30%', '35%', '40%', '45%', '50%', '60%', '65%', '70%', '75%',
                                //     '80%', '85%', '90%', '95%', '100%'], 5%
                                values: ['10%', '20%', '30%', '40%', '50%', '60%', '70%','80%', '90%', '100%'],
                                // values: ['16.5%', '33%', '49.5%', '66%', '82.5%', '99%' ],
                                colors: [
                                    "#FFA500",
                                    "#FFA500",
                                    "#FFA500",
                                    "#FFA500",
                                    // "#FFA500",
                                    // "#FFA500",
                                    // "#FFA500",
                                    '#FFF455',
                                    '#FFF455',
                                    '#FFF455',
                                    // '#FFF455',
                                    // '#FFF455',
                                    // '#FFF455',
                                    '#7ABA78',
                                    '#7ABA78',
                                    '#7ABA78',
                                    // '#7ABA78',
                                    // '#7ABA78',
                                    // '#7ABA78',
                                ],
                            })
                    },
                ]}
                {...chartSetting}
            />
        </GridItem>
    );
}
