import GridItem from "../Grid/GridItem";
import $ from "jquery";
import React from "react";

export function SearchPanel(props) {
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

  return (
    <React.Fragment>
      <GridItem
        id="search_label"
        // className={`${checkboxGridVisible() ? "visible" : "hidden"}`}
      >
        {" "}
        Filter Concepts
        <input
          type="search"
          id="mention_search_input"
          placeholder="Search for mentions.."
        ></input>
      </GridItem>
    </React.Fragment>
  );
}