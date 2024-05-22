import GridItem from "../Grid/GridItem";
import CardHeader from "../Card/CardHeader";
import React, {useEffect, useState} from "react";
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
    const filteredConcepts = props.filteredConcepts;
    const setFilteredConcepts = props.setFilteredConcepts;
    const [clickedTerm, setClickedTerm] = useState("");


    // } else if (method === "occurrence") {
    //     if (
    //         parseInt(li[i].getAttribute("data-begin")) >
    //         parseInt(li[i + 1].getAttribute("data-begin"))
    //     ) {
    //         if (!uniqueArr.includes(li[i].textContent)) {
    //             uniqueArr.push(li[i].textContent);
    //         }
    //         stop = true;
    //         break;
    //     }


    // calculates the count of mentions associated with a given concept based on conceptID
    const getMentionsCountForConcept = (conceptId) => {
        // console.log(concepts);
        const idx = concepts.findIndex((c) => c.id === conceptId);
        if(idx === -1){
            return 0;
        }
        return concepts[idx].mentionIds.filter((mentionId) => {
            return mentions.some((m) => m.id === mentionId);
        }).length;
    };

    useEffect(() => {
        const sortedConcepts = filterConcepts(concepts);
        if (sortedConcepts.length === 0) {
            props.setFilteredConcepts([-1]);
        } else {
            props.setFilteredConcepts(sortedConcepts);
        }
    }, [concepts, confidence]);

    //accessing the .checked property to see if [concept.dpheGroup] is checked
    function conceptGroupIsSelected(concept) {
        if(semanticGroups[concept.dpheGroup]){
            return semanticGroups[concept.dpheGroup].checked
        }
        return false;
    }

    // Filters concepts through many sorts and filters
    function filterConcepts(concepts){
        let filteredConcepts = []

        for(let i = 0; i < concepts.length; i++){
            // console.log(parseFloat(concepts[i].confidence) >= parseFloat(confidence), conceptGroupIsSelected(concepts[i]))
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
        sortedConcepts = filteredConcepts;
        // console.log(sortedConcepts);
        if(filteredConcepts.length === 0) {

            if(sortedConcepts.length === 0){
                sortedConcepts = [-1];
            }
            setFilteredConcepts(sortedConcepts);
        }
        if(sortedConcepts[0] === -1){
            sortedConcepts = [];
        }

        // console.log(sortedConcepts);

        return (
            <List id="filtered_concepts" class="filtered_concepts_list">
                {sortedConcepts.map((obj) => {
                    // console.log('Rendering ListItem:', obj);
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


