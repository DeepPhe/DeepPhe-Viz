import GridItem from "../Grid/GridItem";
import GridContainer from "../Grid/GridContainer";
import { SemanticGroupPanel } from "./SemanticGroupPanel";
import React from "react";
import CardHeader from "../Card/CardHeader";
import $ from "jquery";
import CardBody from "../Card/CardBody";
import Card from "../Card/Card";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

export function ConceptPanel(props) {
  const concepts = props.concepts;
  const mentions = props.mentions;
  const factBasedReports = props.factBasedReports;
  const reportId = props.reportId;
  const factId = props.factId;
  $(document).on("input", "#confidenceRange", function () {
    // Declare variables
    let slider = document.getElementById("confidenceRange");
    let output = document.getElementById("confidenceValue");

    output.innerHTML = slider.value;

    slider.oninput = function () {
      output.innerHTML = this.value;
    };
  });

  $("#occ_radio").prop("checked", true);
  $("#stack_radio").prop("checked", true);

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

  $('input[type=radio][name="sort_order"]').change(function () {
    const value = $(this).val();
    if (value === "alphabetically") {
      sortMentions(value);
    } else if (value === "occurrence") {
      sortMentions(value);
    }
  });
  $(document).on("input", "#mention_search_input", function () {
    // Declare variables
    let input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("mention_search_input");
    filter = input.value.toUpperCase();
    ul = document.getElementById("mentions");
    li = ul.getElementsByTagName("li");

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
      a = li[i];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  });

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
              class={"conceptListItem report_mentioned_term"}
              data-id={obj.id}
              data-negated={obj.negated}
              data-confidence={obj.confidence}
              data-uncertain={obj.uncertain}
            >
              {obj.preferredText}
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

  const checkboxGridVisible = props.getCheckboxGridVisible;
  const setCheckboxGridVisible = props.setCheckboxGridVisible;
  const handleDropdownClick = props.handleDropdownClick;
  return (
    <React.Fragment>
      <Card>
        <CardHeader
          id="mentions_label"
          className={"basicCardHeader"}
          onClick={handleDropdownClick}
        >
          Concept Filter
          {checkboxGridVisible() ? (
            <span>
              <i className="caret-custom fa fa-caret-down fa-2x"></i>
            </span>
          ) : (
            <span>
              <i className="caret-custom fa fa-caret-up fa-2x"></i>
            </span>
          )}
        </CardHeader>
        <CardBody xs={12} id="mentions_container">
          <GridContainer sx={{ bgcolor: "red" }}>
            <GridItem
              id="search_label"
              className={`${checkboxGridVisible() ? "visible" : "hidden"}`}
            >
              {" "}
              Filter Concepts
              <hr className="line" />
              <input
                type="search"
                id="mention_search_input"
                placeholder="Search for mentions.."
              ></input>
            </GridItem>

            <SemanticGroupPanel
              getCheckboxGridVisible={checkboxGridVisible}
              setCheckboxGridVisible={setCheckboxGridVisible}
              handleDropdownClick={handleDropdownClick}
            />

            <GridItem>
              <div
                id="confidence_label"
                className={`${checkboxGridVisible() ? "visible" : "hidden"}`}
              >
                {" "}
                Confidence Range
                <hr className="line" />
                <input
                  type="range"
                  min="1"
                  max="100"
                  className="slider"
                  id="confidenceRange"
                />
                <p>
                  Confidence: <span id="confidenceValue"></span> %
                </p>
              </div>
            </GridItem>

            <GridItem xs={12} id="sort_label">
              Sort Concepts
            </GridItem>
            <hr className="line" />
            <GridItem md={12} lg={6} className="sort_radio_item">
              <input
                id="occ_radio"
                type="radio"
                name="sort_order"
                value="occurrence"
              ></input>
              <label htmlFor="occ_radio">&nbsp; By Occurrence</label>
            </GridItem>
            <GridItem md={12} lg={6} className="sort_radio_item">
              <input
                id="alpha_radio"
                type="radio"
                name="sort_order"
                value="alphabetically"
              ></input>
              <label htmlFor="alpha_radio">&nbsp; Alphabetically</label>
            </GridItem>
            <GridItem
              md={2}
              id="mentions_container3"
              className="ment_container"
            >
              <CardHeader id="mentions_label" className={"basicCardHeader"}>
                Concepts
              </CardHeader>
              <GridItem xs={12} id="mentions_container">
                <div id="report_mentioned_terms">
                  <ul id="mentions">{getConceptsList()}</ul>
                </div>
              </GridItem>
            </GridItem>
          </GridContainer>
        </CardBody>
      </Card>
    </React.Fragment>
  );
}
