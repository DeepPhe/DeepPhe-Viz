import GridItem from "../Grid/GridItem";
import React from "react";
import $ from "jquery";

export function SortPanel(props) {
    const {filteredConcepts, setFilteredConcepts} = props


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
        let conceptsCopy = [...filteredConcepts];

        if (conceptsCopy.length > 0) {
            // Sort the conceptsCopy array based on the sorting method
            conceptsCopy.sort((a, b) => {
                if (method === 'alphabetically') {
                    return a.preferredText.toLowerCase().localeCompare(b.preferredText.toLowerCase());
                } else if (method === 'occurrence') {
                    return a.dataBegin - b.dataBegin; // Assuming dataBegin is a property of the concepts
                } else {
                    return 0; // No sorting
                }
            });

            console.log(conceptsCopy);

            // Update the filteredConcepts state with the sorted array
            setFilteredConcepts(conceptsCopy);
        }
    }


    return (
        <React.Fragment>
            <div className="sortPanel">
            <GridItem xs={12} id="sort_label">
                <b>Sort Concepts:</b>
            </GridItem>
            <GridItem md={12} lg={12} className="sort_radio_item">
                <input
                    id="occ_radio"
                    type="radio"
                    name="sort_order"
                    value="occurrence"
                ></input>
                <label htmlFor="occ_radio">&nbsp; By Occurrence</label>
            </GridItem>
            <GridItem md={12} lg={12} className="sort_radio_item">
                <input
                    id="alpha_radio"
                    type="radio"
                    name="sort_order"
                    value="alphabetically"
                ></input>
                <label htmlFor="alpha_radio">&nbsp; Alphabetically</label>
            </GridItem>
            <GridItem md={12} lg={12} className="sort_radio_item">
                <input
                    id="alpha_radio"
                    type="radio"
                    name="sort_order"
                    value="alphabetically"
                ></input>
                <label htmlFor="alpha_radio">&nbsp; By Semantic Group</label>
            </GridItem>
            </div>
        </React.Fragment>
    );
}
