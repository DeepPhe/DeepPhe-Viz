import GridItem from "../Grid/GridItem";
import CardHeader from "../Card/CardHeader";
import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import $ from "jquery";


// TODO: change name from ConceptListPanel to FilteredConceptList
export function ConceptListPanel(props) {
    const {concepts, mentions} = props;
    const semanticGroups = props.semanticGroups;
    const confidence = props.confidence;

    // const conceptColor = props.color;
    $("#occ_radio").prop("checked", true);
    $("#stack_radio").prop("checked", true);

    $('input[type=radio][name="sort_order"]').change(function () {
        const value = $(this).val();
        if (value === "alphabetically") {
            sortMentions(value);
        } else if (value === "occurrence") {
            sortMentions(value);
        }
    });

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
        console.log(concepts);
        let filteredConcepts = []

        concepts.map((concept) =>{
            if(parseFloat(concept.confidence) >= parseFloat(confidence) && conceptGroupIsSelected(concept)){
                filteredConcepts.push(concept)
            }
        })

        let sortedConcepts = filteredConcepts.sort((a, b) =>
            a.preferredText > b.preferredText ? 1 : -1
        );

        sortedConcepts = sortedConcepts.filter((obj, index, array) => {
            return obj.preferredText !== "" && obj.preferredText !== ";";
        });

        sortedConcepts = sortedConcepts.filter((obj, index, array) => {
            return (
                array.findIndex((a) => a.preferredText === obj.preferredText) === index
            );
        });

        return sortedConcepts;
    }


    function getConceptsList() {
        // const filteredConcepts = filterConcepts(concepts);

        //CODE MOVED TO filterConcepts
        //

        // const mentionCounter = {};
        // sortedConcepts.forEach((obj) => {
        //     const text = obj.preferredText;
        //     if (mentionCounter[text]) {
        //         mentionCounter[text] += 1;
        //     } else {
        //         mentionCounter[text] = 1;
        //     }
        //     obj.mentionFrequency = mentionCounter[text];
        // });
        let sortedConcepts = [];
        if(props.filteredConcepts.length === 0) {
            sortedConcepts = filterConcepts(concepts);
            props.setFilteredConcepts(sortedConcepts);
        }
        else{
            sortedConcepts = props.filteredConcepts;
        }

        return (
            <List id="filtered_concepts" class="filtered_concepts_list">
                {sortedConcepts.map((obj) => {
                    return (
                        <ListItem
                            style={{fontSize: "14px", backgroundColor: semanticGroups[obj.dpheGroup].color}}
                            key={obj.id}
                            class={"report_mentioned_term"} //deleted 'conceptListItem' no apparent use
                            data-id={obj.id}
                            data-negated={obj.negated}
                            data-confidence={obj.confidence}
                            data-uncertain={obj.uncertain}
                            data-text={obj.preferredText}
                            data-dphe-group={obj.dpheGroup}
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
                <CardHeader
                    style={{border: "none", boxShadow: "none"}}
                    id="mentions_label"
                    className={"basicCardHeader"}
                >
                    Concepts
                </CardHeader>
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


