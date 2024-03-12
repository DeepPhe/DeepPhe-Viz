import GridItem from "../Grid/GridItem";
import React, { useState } from "react";

export function SemanticGroupPanel(props) {

  //WILL USE THIS LATER
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

  const handleCheckboxChange = (checkboxId) => {
    setCheckboxes((prevState) => ({
      ...prevState,
      [checkboxId]: !prevState[checkboxId],
    }));
  };

  const [checkboxes, setCheckboxes] = useState({
    checkbox1: true, // Set to true if you want it initially checked
    checkbox2: true, // Set to true if you want it initially checked
    checkbox3: true,
    checkbox4: true,
    checkbox5: true,
    checkbox6: true,
    checkbox7: true,
  });

  const checkboxGridVisible = () => {
    return true;
  };
  //props.getCheckboxGridVisible;
  return (
    <GridItem xs={12} md={12} lg={6}>
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
        >
          <div className="report_mentioned_term_magenta">
            <input
              type="checkbox"
              id="checkbox1"
              checked={checkboxes.checkbox1}
              onChange={() => handleCheckboxChange("checkbox1")}
            />
            <label htmlFor="checkbox1">Sign/Symptom</label>
          </div>
          <div className="report_mentioned_term_black">
            <input
              type="checkbox"
              id="checkbox2"
              checked={checkboxes.checkbox2}
              onChange={() => handleCheckboxChange("checkbox2")}
            />
            <label className="black" htmlFor="checkbox2">
              Test/Procedure
            </label>
          </div>
          <div className="report_mentioned_term_grey">
            <input
              type="checkbox"
              id="checkbox3"
              checked={checkboxes.checkbox3}
              onChange={() => handleCheckboxChange("checkbox3")}
            />
            <label htmlFor="checkbox3">Anatomical Site</label>
          </div>
          <div className="report_mentioned_term_green">
            <input
              type="checkbox"
              id="checkbox4"
              checked={checkboxes.checkbox4}
              onChange={() => handleCheckboxChange("checkbox4")}
            />
            <label htmlFor="checkbox4">Disease/Disorder</label>
          </div>
          <div className="report_mentioned_term_red">
            <input
              type="checkbox"
              id="checkbox5"
              checked={checkboxes.checkbox5}
              onChange={() => handleCheckboxChange("checkbox5")}
            />
            <label htmlFor="checkbox5">Medication</label>
          </div>
          <div className="report_mentioned_term">
            <input
              type="checkbox"
              id="checkbox6"
              checked={checkboxes.checkbox6}
              onChange={() => handleCheckboxChange("checkbox6")}
            />
            <label htmlFor="checkbox6">BLUE</label>
          </div>
          <div className="report_mentioned_term">
            <input
              type="checkbox"
              id="checkbox7"
              checked={checkboxes.checkbox7}
              onChange={() => handleCheckboxChange("checkbox7")}
            />
            <label htmlFor="checkbox7">Negated</label>
          </div>
        </div>
      </div>
    </GridItem>
  );
}
