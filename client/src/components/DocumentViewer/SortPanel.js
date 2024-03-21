import GridItem from "../Grid/GridItem";
import React from "react";
import $ from "jquery";

export function SortPanel(props) {


    return (
        <React.Fragment>
            <GridItem xs={12} id="sort_label">
                Sort Concepts
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
        </React.Fragment>
    );
}
