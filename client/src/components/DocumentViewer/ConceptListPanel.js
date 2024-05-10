import GridItem from "../Grid/GridItem";
import CardHeader from "../Card/CardHeader";
import React, {useState} from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import $ from "jquery";
import {grey} from "@material-ui/core/colors";
// import {getMentionsForConcept} from "./DocumentPanel"


// TODO: change name from ConceptListPanel to FilteredConceptList
export function ConceptListPanel(props) {
    const {concepts, mentions} = props;
    const semanticGroups = props.semanticGroups;
    const confidence = props.confidence;
    const [clickedTerm, setClickedTerm] = useState("");

    // const conceptColor = props.color;
    $("#occ_radio").prop("checked", true);
    $("#stack_radio").prop("checked", true);

    // $('input[type=radio][name="sort_order"]').change(function () {
    //     const value = $(this).val();
    //     if (value === "alphabetically") {
    //         sortMentions(value);
    //     } else if (value === "occurrence") {
    //         sortMentions(value);
    //     }
    // });

    function sortMentions(method) {
        // Declaring Variables
        let geek_list, i, run, li, stop;
        // Taking content of list as input
        geek_list = document.getElementById("mentions");

        if (geek_list !== null && geek_list !== undefined) {
            run = true;
            const uniqueArr = [];

            while (run) {
                run = false;
                li = geek_list.getElementsByTagName("li");

                // Loop traversing through all the list items
                for (i = 0; i < li.length - 1; i++) {
                    stop = false;
                    if (method === "alphabetically") {
                        if (
                            li[i].textContent.toLowerCase() >
                            li[i + 1].textContent.toLowerCase()
                        ) {
                            stop = true;
                            break;
                        }
                    } else if (method === "occurrence") {
                        if (
                            parseInt(li[i].getAttribute("data-begin")) >
                            parseInt(li[i + 1].getAttribute("data-begin"))
                        ) {
                            if (!uniqueArr.includes(li[i].textContent)) {
                                uniqueArr.push(li[i].textContent);
                            }
                            stop = true;
                            break;
                        }
                    }
                }

                /* If the current item is smaller than
                   the next item then adding it after
                   it using insertBefore() method */
                if (stop) {
                    li[i].parentNode.insertBefore(li[i + 1], li[i]);

                    run = true;
                }
            }
        }
    }

    // calculates the count of mentions associated with a given concept based on conceptID
    const getMentionsCountForConcept = (conceptId) => {
        // console.log(concepts);
        const idx = concepts.findIndex((c) => c.id === conceptId);
        return concepts[idx].mentionIds.filter((mentionId) => {
            return mentions.some((m) => m.id === mentionId);
        }).length;
    };


    //accessing the .checked property to see if [concept.dpheGroup] is checked
    function conceptGroupIsSelected(concept) {
        return semanticGroups[concept.dpheGroup].checked
    }

    // Filters concepts through many sorts and filters
    function filterConcepts(concepts){
        let filteredConcepts = []

        for(let i = 0; i < concepts.length; i++){
            if(parseFloat(concepts[i].confidence) >= parseFloat(confidence) && conceptGroupIsSelected(concepts[i])){
                filteredConcepts.push(concepts[i]);
            }
        }

        let sortedConcepts = filteredConcepts.sort((a, b) =>
            a.preferredText > b.preferredText ? 1 : -1
        );

        sortedConcepts = sortedConcepts.filter((obj, index, array) => {
            return obj.preferredText !== "" && obj.preferredText !== ";";
        });
        return sortedConcepts;
    }


    function getConceptsList() {
        let sortedConcepts = [];

        if(props.filteredConcepts.length === 0) {
            sortedConcepts = filterConcepts(concepts);
            if(sortedConcepts.length === 0){
                sortedConcepts = [-1];
            }
            props.setFilteredConcepts(sortedConcepts);
        }
        else{
            sortedConcepts = props.filteredConcepts;
        }
        if(sortedConcepts[0] === -1){
            sortedConcepts = [];
        }

        return (
            <List id="filtered_concepts" class="filtered_concepts_list">
                {sortedConcepts.map((obj) => {
                    return (
                        <ListItem
                            style={{fontSize: "14px", backgroundColor: semanticGroups[obj.dpheGroup].backgroundColor}}
                            key={obj.id}
                            class={"report_mentioned_term"} //deleted 'conceptListItem' no apparent use
                            data-id={obj.id}
                            data-negated={obj.negated}
                            data-confidence={obj.confidence}
                            data-uncertain={obj.uncertain}
                            data-text={obj.preferredText}
                            data-dphe-group={obj.dpheGroup}
                            onClick={props.handleTermClick}
                        >
                            {obj.preferredText} ({getMentionsCountForConcept(obj.id)})
                        </ListItem>
                    );
                })}
            </List>
        );
    }

    return (
        <React.Fragment>
            <GridItem md={12} id="concepts_container" className="ment_container">
                <GridItem
                    style={{border: "none", boxShadow: "none"}}
                    md={12}
                    id="mentions_container"
                >
                    <div id="report_mentioned_terms">{getConceptsList()}</div>
                </GridItem>
            </GridItem>
        </React.Fragment>
    );
}


