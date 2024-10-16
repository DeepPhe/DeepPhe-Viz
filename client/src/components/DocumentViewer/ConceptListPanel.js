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
    const doc = props.doc;

    const getMentionsGivenMentionIds = (mentionIds) => {
        return doc.mentions.filter((m) => mentionIds.includes(m.id));
    };
    const getMentionsForConcept = (conceptId) => {
        if(conceptId === ""){
            return [];
        }
        if(conceptId !== undefined) {
            const idx = concepts.findIndex((c) => c.id === conceptId);
            if(idx === -1){
                return [];
            }
            return concepts[idx].mentionIds.filter((mentionId) => {
                return doc.mentions.some((m) => m.id === mentionId);
            });
        }
        else{
            return [];
        }
    };

    function getAllConceptIDs(){
        let conceptIDList = [];
        for(let i = 0; i < concepts.length; i++){
            const mentions = getMentionsGivenMentionIds(getMentionsForConcept(concepts[i].id));
            conceptIDList.push(mentions);
        }
        return conceptIDList;
    }

    // Gets mention count for concept for single document of patient
    const getDocMentionsCountForConcept = (conceptId) => {
        const idx = concepts.findIndex((c) => c.id === conceptId);
        if(idx === -1){
            return 0;
        }
        return concepts[idx].mentionIds.filter((mentionId) => {
            return mentions.some((m) => m.id === mentionId);
        }).length;
    };

    // Gets mention count for concept for whole patient history
    const getPatientMentionsCountForConcept = (conceptId) => {
        const idx = concepts.findIndex((c) => c.id === conceptId);
        if(idx === -1){
            return 0;
        }
        return concepts[idx].mentionIds.length;
    };


    useEffect(() => {
        const sortedConcepts = filterConceptsByConfidenceAndSemanticGroup(concepts);
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


    // FilterConceptsByConfidenceAndSemanticGroup keeps an array of concepts that are updated dynamically
    // based on confidence and Semantic group selection
    function filterConceptsByConfidenceAndSemanticGroup(concepts){
        let filteredConcepts = []
        for(let i = 0; i < concepts.length; i++){
            if(parseFloat(concepts[i].confidence) >= parseFloat(confidence) && conceptGroupIsSelected(concepts[i])){
                filteredConcepts.push(concepts[i]);
            }
        }
        // console.log(sortConceptsByOccurrence(filteredConcepts));
        return filteredConcepts;

    }

    // function sortConceptsByOccurrence(filteredConcepts){
    //     return filteredConcepts.sort((a, b) => {
    //         // Calculate occurrence (duration) for each object
    //         const occurrenceA = a.end - a.begin;
    //         const occurrenceB = b.end - b.begin;
    //
    //         // Sort in ascending order based on the occurrence
    //         return occurrenceA - occurrenceB;
    //     });
    // }

    function separateWords(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space before capital letters
            .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')  // Handle consecutive capitals like "URL"
            .trim();  // Remove any leading/trailing spaces
    }

    // Function to check if the classUri value already exists in the array
    // function isClassUriUnique(array, newObj) {
    //     return !array.some(obj => obj.classUri === newObj.classUri);
    // }
    function getConceptsList() {
        let sortedConcepts = [];
        let groupedMentions = [];
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

        // const conceptIDList = getAllConceptIDs()
        //
        // conceptIDList.forEach(function (nestedArray) {
        //     nestedArray.forEach(function (obj) {
        //         if(isClassUriUnique(groupedMentions,obj)){
        //             groupedMentions.push(obj);
        //         }
        //     });
        // });

        //If we want to list the concepts we will use : filterConceptsByConfidenceAndSemanticGroup(concepts)
        //If we want to list the Mentions we will use : groupedMentions
        return (
            <List id="filtered_concepts" class="filtered_concepts_list">
                {filterConceptsByConfidenceAndSemanticGroup(concepts).map((obj) => {
                    return (
                        <ListItem
                            style={{fontSize: "14px", fontFamily: "Monaco, monospace", backgroundColor: hexToRgba(semanticGroups[obj.dpheGroup].backgroundColor, 0.65), margin: "4px", borderStyle: 'solid', borderColor: 'transparent', fontWeight:'bold'}}
                            key={obj.id}
                            class={"report_mentioned_term"}
                            data-id={obj.id}
                            data-negated={obj.negated}
                            data-confidence={obj.confidence}
                            data-uncertain={obj.uncertain}
                            data-text={obj.classUri}
                            data-dphe-group={obj.dpheGroup}
                            onClick={props.handleTermClick}
                        >
                            {separateWords(obj.classUri)} ({getDocMentionsCountForConcept(obj.id)},{getPatientMentionsCountForConcept(obj.id)}):{Math.round(obj.confidence * 100)}%
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


