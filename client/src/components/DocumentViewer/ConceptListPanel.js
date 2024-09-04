import GridItem from "../Grid/GridItem";
import React, {useEffect} from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {hexToRgba} from "./ColorUtils";

export function ConceptListPanel(props) {
    const {concepts, mentions} = props;
    const semanticGroups = props.semanticGroups;
    const confidence = props.confidence;
    const filteredConcepts = props.filteredConcepts;
    const setFilteredConcepts = props.setFilteredConcepts;

    // calculates the count of mentions associated with a given concept based on conceptID
    const getDocMentionsCountForConcept = (conceptId) => {
        const idx = concepts.findIndex((c) => c.id === conceptId);
        if(idx === -1){
            return 0;
        }
        return concepts[idx].mentionIds.filter((mentionId) => {
            return mentions.some((m) => m.id === mentionId);
        }).length;
    };

    const getPatientMentionsCountForConcept = (conceptId) => {
        const idx = concepts.findIndex((c) => c.id === conceptId);
        if(idx === -1){
            return 0;
        }
        return concepts[idx].mentionIds.length;
    };


    useEffect(() => {
        const sortedConcepts = filterConcepts(concepts);

        if (sortedConcepts.length === 0) {
            setFilteredConcepts([-1]);
        } else {
            setFilteredConcepts(sortedConcepts);
        }
    }, [concepts, confidence, semanticGroups]);



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
        if(filteredConcepts.length === 0) {
            if(sortedConcepts.length === 0){
                sortedConcepts = [-1];
            }
            setFilteredConcepts(sortedConcepts);
        }
        if(sortedConcepts[0] === -1){
            sortedConcepts = [];
        }

        return (
            <List id="filtered_concepts" class="filtered_concepts_list">
                {sortedConcepts.map((obj) => {
                    return (
                        <ListItem
                            style={{fontSize: "14px", fontFamily: "Monaco, monospace", backgroundColor: hexToRgba(semanticGroups[obj.dpheGroup].backgroundColor, 0.65), margin: "4px", borderStyle: 'solid', borderColor: 'transparent', fontWeight:'bold'}}
                            key={obj.id}
                            class={"report_mentioned_term"}
                            data-id={obj.id}
                            data-negated={obj.negated}
                            data-confidence={obj.confidence}
                            data-uncertain={obj.uncertain}
                            data-text={obj.preferredText}
                            data-dphe-group={obj.dpheGroup}
                            onClick={props.handleTermClick}
                        >
                            {obj.preferredText} ({getDocMentionsCountForConcept(obj.id)},{getPatientMentionsCountForConcept(obj.id)}):{Math.round(obj.confidence * 100)}%
                        </ListItem>
                    );
                })}
            </List>
        );
    }

    return (

                <GridItem
                    style={{border: "none", boxShadow: "none"}}
                    md={12}
                    id="mentions_container"
                >
                    <div id="report_mentioned_terms">{getConceptsList()}</div>
                </GridItem>

    );
}


