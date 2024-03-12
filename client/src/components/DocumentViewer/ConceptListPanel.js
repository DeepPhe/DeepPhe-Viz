import GridItem from "../Grid/GridItem";
import CardHeader from "../Card/CardHeader";
import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import $ from "jquery";

export function ConceptListPanel(props) {
  const { concepts, mentions } = props;
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

  const getMentionsCountForConcept = (conceptId) => {
    const idx = concepts.findIndex((c) => c.id === conceptId);
    return concepts[idx].mentionIds.filter((mentionId) => {
      return mentions.some((m) => m.id === mentionId);
    }).length;
  };

  function getConceptsList() {
    let sortedConcepts = concepts.sort((a, b) =>
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

    const mentionCounter = {};
    sortedConcepts.forEach((obj) => {
      const text = obj.preferredText;
      if (mentionCounter[text]) {
        mentionCounter[text] += 1;
      } else {
        mentionCounter[text] = 1;
      }
      obj.mentionFrequency = mentionCounter[text];
    });

    return (
      <List id="mentions" class="mentioned_terms_list">
        {sortedConcepts.map((obj) => {
          return (
            <ListItem
              style={{ fontSize: "14px" }}
              key={obj.id}
              class={"conceptListItem report_mentioned_term"}
              data-id={obj.id}
              data-negated={obj.negated}
              data-confidence={obj.confidence}
              data-uncertain={obj.uncertain}
              data-text={obj.preferredText}
            >
              {obj.preferredText} ({getMentionsCountForConcept(obj.id)})
              {/*// class="report_mentioned_term fact_based_term_class"*/}
              {/*// data-begin={obj.begin}*/}
              {/*// data-end={obj.end}*/}
              {/*// >*/}
              {/*// {obj.preferredText +*/}
              {/*//   <span class="frequency">({obj.mentionFrequency})</span>}*/}
            </ListItem>
          );
        })}
        ;
      </List>
    );
  }

  return (
    <React.Fragment>
      <GridItem md={12} id="concepts_container" className="ment_container">
        <CardHeader
          style={{ border: "none", boxShadow: "none" }}
          id="mentions_label"
          className={"basicCardHeader"}
        >
          Concepts
        </CardHeader>
        <GridItem
          style={{ border: "none", boxShadow: "none" }}
          md={12}
          id="mentions_container"
        >
          <div id="report_mentioned_terms">{getConceptsList()}</div>
        </GridItem>
      </GridItem>
    </React.Fragment>
  );
}
