import GridItem from "../Grid/GridItem";
import GridContainer from "../Grid/GridContainer";
import { SemanticGroupPanel } from "./SemanticGroupPanel";
import React from "react";
import CardHeader from "../Card/CardHeader";
import $ from "jquery";

export function ConceptPanel(props) {
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
  const checkboxGridVisible = props.getCheckboxGridVisible;
  const setCheckboxGridVisible = props.setCheckboxGridVisible;
  const handleDropdownClick = props.handleDropdownClick;
  return (
    <React.Fragment>
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
      <GridItem xs={12} id="mentions_container">
        <GridContainer>
          <GridItem xs={12}>
            <div
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
            </div>
          </GridItem>
          <SemanticGroupPanel
            getCheckboxGridVisible={checkboxGridVisible}
            setCheckboxGridVisible={setCheckboxGridVisible}
            handleDropdownClick={handleDropdownClick}
          />

          <GridItem xs={12}>
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
        </GridContainer>
      </GridItem>
    </React.Fragment>
  );
}
