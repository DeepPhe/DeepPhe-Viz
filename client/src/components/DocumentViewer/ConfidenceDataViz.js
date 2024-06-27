import GridItem from "../Grid/GridItem";
import React, {useState} from "react";
import { BarChart } from '@mui/x-charts';
import {Stack, Slider, FormLabel} from "@mui/material";

export function ConfidenceDataViz(props) {
    const handleConfidenceChange = props.handleConfidenceChange;
    const [value, setValue] = useState(50);


    return (
        <GridItem xs={6} alignItems='center'>
            <FormLabel sx={{ fontWeight: 'light', fontSize: '1em', marginBottom: '-5px' }}>
                <b className="titles">Confidence:</b>
            </FormLabel>
            <BarChart
                series={[
                    { data: [35, 44, 24] },
                    { data: [51, 6, 49] },
                ]}
                height={190}
                xAxis={[{ data: ['L', 'M', 'H'], scaleType: 'band' }]}
                margin={{ top: 10, bottom: 30, left: 25, right: 10 }}
            />
        </GridItem>
    );
}
