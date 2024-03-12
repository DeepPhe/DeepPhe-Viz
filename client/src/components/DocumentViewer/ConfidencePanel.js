import GridItem from "../Grid/GridItem";
import React, { useState } from "react";

export function ConfidencePanel(props: ConfidencePanelProps) {
  const { confidence, onConfidenceChange } = props;
  const [value, setValue] = useState(confidence);

  return (
    <GridItem style={{width:"100%"}}>
      <div
        id="confidence_label"
        // className={`${checkboxGridVisible() ? "visible" : "hidden"}`}
      >
        {" "}
        Confidence Range
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
  );
}
