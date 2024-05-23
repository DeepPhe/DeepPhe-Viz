import GridItem from "../Grid/GridItem";
import React, {useEffect} from "react";
import $ from "jquery";
import {FormControlLabel, FormLabel, Radio, RadioGroup} from "@mui/material";
import FormControl from "@material-ui/core/FormControl";

export function SortPanel(props) {
    const { filteredConcepts, setFilteredConcepts } = props;


    $("#occ_radio").prop("checked", true);

    $('input[type=radio][name="sort_order"]').change(function () {
        const value = $(this).val();
        if (value === "alphabetically") {
            sortMentions(value);
        } else if (value === "occurrence") {
            sortMentions(value);
        }
    });

    function sortMentions(method) {
        // Copy the filteredConcepts array to avoid mutating the original state
        const conceptsCopy = filteredConcepts;

        console.log(conceptsCopy);
        if (conceptsCopy.length > 0) {
            // Sort the conceptsCopy array based on the sorting method
            conceptsCopy.sort((a, b) => {
                console.log("a", a, "b", b);
                if (method === 'alphabetically') {
                    return a.preferredText.toLowerCase().localeCompare(b.preferredText.toLowerCase());
                } else if (method === 'occurrence') {
                    return a.dataBegin - b.dataBegin; // Assuming dataBegin is a property of the concepts
                } else {
                    return 0; // No sorting
                }
            });

            // Update the filteredConcepts state with the sorted array
            setFilteredConcepts(conceptsCopy);
        }
    }


    return (

        <GridItem xs={6} >
        <FormControl>
            <FormLabel sx={{ fontWeight: 'light', fontSize: '1em'}}><b>Sort Order:</b></FormLabel>
            <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="female"
                name="radio-buttons-group"
            >
                <FormControlLabel value="female" control={<Radio size='small'/>} label="Female" />
                <FormControlLabel value="male" control={<Radio size='small'/>} label="Male" />
                <FormControlLabel value="other" control={<Radio size='small'/>} label="Other" />
            </RadioGroup>
        </FormControl>
        </GridItem>

    );
}
