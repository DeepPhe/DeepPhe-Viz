import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import { BarChart } from '@mui/x-charts/BarChart';
import {Stack, Slider, FormLabel} from "@mui/material";

export function ConfidenceDataViz(props) {
    const handleConfidenceChange = props.handleConfidenceChange;
    const [value, setValue] = useState(50);


    return (
        <GridItem xs={6} alignItems='center'>
            <BarChart
                series={[
                    { data: [35, 44, 24, 34] },
                    { data: [51, 6, 49, 30] },
                    { data: [15, 25, 30, 50] },
                    { data: [60, 50, 15, 25] },
                ]}
                height={290}
                xAxis={[{ data: ['Q1', 'Q2', 'Q3', 'Q4'], scaleType: 'band' }]}
                margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
            />
        </GridItem>
    );
}
