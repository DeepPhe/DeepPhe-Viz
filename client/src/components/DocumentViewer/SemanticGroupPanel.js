import GridItem from "../Grid/GridItem";
import React, { useState } from "react";

export function SemanticGroupPanel(props) {
  const semanticGroups = props.semanticGroups;
  const handleSemanticGroupChange = props.handleSemanticGroupChange;

  function buildColorDistribution(textMention) {
    let colorDistribution = [];
    let increment = (100 / textMention.count).toFixed(2);

    for (let i = 0; i < textMention.count; i++) {
      let bgcolor = "highlight_terms";
      let start = i > 0 ? i * increment + "%" : 0;
      let finish =
        i < textMention.count - 1 ? (i + 1) * increment + "%" : "100%";
      colorDistribution.push(bgcolor + " " + start);
      colorDistribution.push(bgcolor + " " + finish);
    }
    return colorDistribution;
  }

  const handleCheckboxChange = (e) => {
    handleSemanticGroupChange(e.target.dataset.semanticGroup, e.target.checked);
  };

  const getHeader = () => {
    return (
      <div className="dropdown">
        <div
          className={`dropdown-container ${
            checkboxGridVisible() ? "visible" : "hidden"
          }`}
        >
          <div className="caret-options-container">
            <div className="options-container">
              <span>Semantic Groups</span>
            </div>
          </div>
          <hr className="line" />
        </div>

        <div
          className={`checkbox-grid ${
            checkboxGridVisible() ? "visible" : "hidden"
          }`}
        />
      </div>
    );
  };

  const getSemanticGroupBox = (group, index, values) => {
    const id = "checkbox" + index;
    return (
      <div
        style={{
          margin: "0 5px 5px 0",
          cursor: "pointer",
          fontFamily: "Monaco, monospace",
          borderRadius: "5px",
          float: "left",
          backgroundColor: values.color,
        }}
      >
        <input
          name={"semanticGroups"}
          key={id}
          type="radio"
          id={id}
          checked={values.checked}
          onChange={handleCheckboxChange}
          data-semantic-group={group}
        />
        <label htmlFor={id}>{group}</label>
      </div>
    );
  };

  const getSemanticGroups = () => {
    return (
      <div className="semantic-groups">
        {Object.keys(semanticGroups).map((group, index) => {
          return getSemanticGroupBox(group, index, semanticGroups[group]);
        })}
      </div>
    );
  };

  const checkboxGridVisible = () => {
    return true;
  };
  //props.getCheckboxGridVisible;
  return (
    <GridItem>
      {getHeader()}
      {getSemanticGroups()}
    </GridItem>
  );
}
