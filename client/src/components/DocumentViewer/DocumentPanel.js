import React, {useEffect, useState} from "react";
import parse from "html-react-parser";
import {hexToRgba} from "./ColorUtils";

export function DocumentPanel(props) {
  const [doc, setDoc] = useState(props.doc);
  const [docText, setDocText] = useState(props.doc.text);
  const concepts = props.concepts;
  const clickedTerm = props.clickedTerm;
  const semanticGroups = props.semanticGroups;
  const filteredConcepts = props.filteredConcepts;
  const fontSize = props.fontSize;

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


  function createMentionObj(mentionedTerms) {
    let textMentions = [];
    // console.log(filteredConcepts);
    // console.log(mentionedTerms);
    mentionedTerms.forEach(function (nestedArray) {
        nestedArray.forEach(function(obj) {
        let textMentionObj = {};
        const index = filteredConcepts.findIndex(filConcept => filConcept.dpheGroup === obj.dpheGroup);

        const conceptConfidence = Math.round(filteredConcepts[index].confidence * 100);
        // console.log(conceptConfidence);

        textMentionObj.preferredText = obj["preferredText"];
        textMentionObj.begin = obj.begin;
        textMentionObj.end = obj.end;
        const hexColor = semanticGroups[obj.dpheGroup].backgroundColor;
        textMentionObj.backgroundColor = hexToRgba(hexColor, 0.65);
        textMentionObj.color = semanticGroups[obj.dpheGroup].color;
        textMentionObj.id = obj.id;
        textMentionObj.negated = obj.negated;
        textMentionObj.confidence = conceptConfidence;
        const mentionsForHighlight = getMentionsForConcept(clickedTerm);

        textMentionObj.clickedTerm = mentionsForHighlight.includes(textMentionObj.id);
        textMentions.push(textMentionObj);
      });
    });

    return textMentions;
  }


  function flattenRanges(ranges) {
    let points = [];
    let flattened = [];
    for (let i in ranges) {
      if (ranges[i].end < ranges[i].begin) {
        //RE-ORDER THIS ITEM (BEGIN/END)
        let tmp = ranges[i].end; //RE-ORDER BY SWAPPING
        ranges[i].end = ranges[i].begin;
        ranges[i].begin = tmp;
      }
      points.push(ranges[i].begin);
      points.push(ranges[i].end);
    }

    //MAKE SURE OUR LIST OF POINTS IS IN ORDER
    //COMMENT THIS OUT LATER
    points.sort(function (a, b) {
      return a - b;
    });

    // FIND THE INTERSECTING SPANS FOR EACH PAIR OF POINTS (IF ANY)
    // ALSO MERGE THE ATTRIBUTES OF EACH INTERSECTING SPAN, AND INCREASE THE COUNT FOR EACH INTERSECTION
    for (let i in points) {
      if (i === 0 || points[i] === points[i - 1]) continue;
      let includedRanges = ranges.filter(function (x) {
        return Math.max(x.begin, points[i - 1]) < Math.min(x.end, points[i]);
      });

      if (includedRanges.length > 0) {
        let flattenedRange = {
          begin: points[i - 1],
          end: points[i],
          count: 0,
        };

        for (let j in includedRanges) {
          let includedRange = includedRanges[j];

          for (let prop in includedRange) {
            if (prop !== "begin" && prop !== "end") {
              if (!flattenedRange[prop]) flattenedRange[prop] = [];
              flattenedRange[prop].push(includedRange[prop]);
            }
          }

          flattenedRange.count++;
        }

        flattened.push(flattenedRange);
      }
    }

    return flattened;
  }

  function isNegated(negatedArray) {
    return negatedArray.includes(true);
  }


  function highlightTextMentions(textMentions, reportText, term = "NONE") {

    //No mentions in reportText, we return just reportText
    if(textMentions.length === 0){
      return reportText;
    }

    // Flatten the ranges, this is the key to solve overlapping
    textMentions = flattenRanges(textMentions);

    let textFragments = [];
    let lastValidTMIndex = 0;

    // For loop to highlight each mention in the report text
    for (let i = 0; i < textMentions.length; i++) {
      let textMention = textMentions[i];

      textMention.backgroundColor = textMention.backgroundColor[textMention.backgroundColor.length - 1];

      let lastValidTM = textMentions[lastValidTMIndex];

      if (i === 0) {
        if (textMention.begin === 0) {
          textFragments.push("");
        } else {
          textFragments.push(reportText.substring(0, textMention.begin));
        }
      } else {
        if (textMention.begin <= lastValidTM.end) {
          lastValidTMIndex = i;
        } else {
          textFragments.push(reportText.substring(lastValidTM.end, textMention.begin));
        }
      }
      // borderLeft: solid; borderTop: solid; borderBottom: solid;
      // console.log(textMention.clickedTerm.some((element) => {return element}));
      let borderRadiusStyle = textMention.clickedTerm.some((element) => {return element}) ? 'border-style: solid;' : 'border-style: none;';

      //we want to check for different cases, how many possible cases are there:
      //1. nothing to left and nothing to right, so border stays circular on both sides
      //2. nothing to left and something to right, so border is circular on left and flat on right
      //3. something to left and nothing to right, so border is flat on left and circular on right
      //4. something to left and something to right, so border is flat on both sides
      // with 4 possible solutions we can create a helper function to determine the correct solution to each
      // situation and then make that change in the main function
      console.log(textMention.preferredText);
      //We want to check what is in front of textmention without checking what is behind it, so this is a special
      //case for the first textMention
      if(i === 0 && textMentions[i+1]){
        if (textMention.backgroundColor === textMentions[i + 1].backgroundColor[textMentions[i + 1].backgroundColor.length - 1]) {
          const spanClass = isNegated(textMention.negated) ? 'neg' : '';
          const spanStyle =
              `background-color: ${textMention.backgroundColor}; 
              ${borderRadiusStyle};
              border-radius: 5px 0 0 5px;
              padding-left: 2px;
              padding-right: 2px;`;

          const htmlString = `<span style="${spanStyle}" class="span-info ${spanClass}">` +
              `${reportText.substring(textMention.begin, textMention.end).trim()}` +
              `<span class="tooltip">${textMention.confidence[0]}%</span>` +
              (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
              `</span>`;

          textFragments.push(htmlString);
        }
        //regular 5px border
        else{
          const spanClass = isNegated(textMention.negated) ? 'neg' : '';
          const spanStyle = `background-color: ${textMention.backgroundColor};
          ${borderRadiusStyle};
          border-radius: 5px;
          padding-left: 2px;
          padding-right: 2px;`;
          const htmlString = `<span style="${spanStyle}" class="span-info ${spanClass}">` +
              `${reportText.substring(textMention.begin, textMention.end).trim()}` +
              `<span class="tooltip">${textMention.confidence[0]}%</span>` +
              (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
              `</span>`;

          textFragments.push(htmlString);
        }
      }

      //check for past and future textMention, if they are same color then change border to 0
      if( i > 0 && i < textMentions.length - 1 && reportText.substring(textMention.begin, textMention.end).trim() !== "") {

        if (textMentions[i - 1].backgroundColor === textMention.backgroundColor && textMentions[i + 1].backgroundColor[textMentions[i + 1].backgroundColor.length - 1] === textMention.backgroundColor) {
          const spanClass = isNegated(textMention.negated) ? 'neg' : '';
          const spanStyle = `background-color: ${textMention.backgroundColor};
          ${borderRadiusStyle};
          border-radius:0;
          padding-left: 2px;
          padding-right: 2px;`;
          const htmlString = `<span style="${spanStyle}" class="span-info ${spanClass}">` +
              `${reportText.substring(textMention.begin, textMention.end).trim()}` +
              `<span class="tooltip">${textMention.confidence[0]}%</span>` +
              (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
              `</span>`;

          textFragments.push(htmlString);
        }
        //checking past textMention only
        else if(textMentions[i - 1].backgroundColor === textMention.backgroundColor) {
          const spanClass = isNegated(textMention.negated) ? 'neg' : '';
          const spanStyle = `background-color: ${textMention.backgroundColor};
          ${borderRadiusStyle};
          border-radius:0 5px 5px 0;
          padding-left: 2px;
          padding-right: 2px;`;

          const htmlString = `<span style="${spanStyle}" class="span-info ${spanClass}">` +
              `${reportText.substring(textMention.begin, textMention.end).trim()}` +
              `<span class="tooltip">${textMention.confidence[0]}%</span>` +
              (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
              `</span>`;

          textFragments.push(htmlString);
        }
        //checking future textMention only
        else if (textMention.backgroundColor === textMentions[i + 1].backgroundColor[textMentions[i+1].backgroundColor.length - 1]) {
          const spanClass = isNegated(textMention.negated) ? 'neg' : '';
          const spanStyle = `background-color: ${textMention.backgroundColor};
          ${borderRadiusStyle};
          border-radius: 5px 0 0 5px;
          padding-left: 2px;
          padding-right: 2px;`;
          const htmlString = `<span style="${spanStyle}" class="span-info ${spanClass}">` +
              `${reportText.substring(textMention.begin, textMention.end).trim()}` +
              `<span class="tooltip">${textMention.confidence[0]}%</span>` +
              (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
              `</span>`;

          textFragments.push(htmlString);
        }
        else {
          const spanClass = isNegated(textMention.negated) ? 'neg' : '';
          const spanStyle = `background-color: ${textMention.backgroundColor};
          ${borderRadiusStyle};
          border-radius: 5px;
          padding-left: 2px;
          padding-right: 2px;`;
          const htmlString = `<span style="${spanStyle}" class="span-info ${spanClass}">` +
              `${reportText.substring(textMention.begin, textMention.end).trim()}` +
              `<span class="tooltip">${textMention.confidence[0]}%</span>` +
              (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
              `</span>`;

          textFragments.push(htmlString);

          }
      }

      lastValidTMIndex = i;
    }
    console.log(reportText.substring(textMentions[lastValidTMIndex].end))
    textFragments.push(
        reportText.substring(textMentions[lastValidTMIndex].end)
    );

    // Assemble the final report content with highlighted texts
    let highlightedReportText = "";

    textFragments = cleanUpTextFragments(textFragments);

    for (let j = 0; j < textFragments.length; j++) {
      highlightedReportText += textFragments[j];
    }

    return highlightedReportText;
  }

  function determineHighlightedBorder(textMention){

    //4.  nothing to left and nothing to right, so border stays circular on both sides

  }

  function cleanUpTextFragments(textFragments){

    //getting correct click
    for(let i = 0; i < textFragments.length; i++){
      if(textFragments[i].includes('border-style: solid;')){
        // console.log('solid: ', textFragments[i]);
        if(textFragments[i+1].includes('</span>') && !textFragments[i-1].includes('</span>')){
          // console.log('left', textFragments[i]);
          textFragments[i] = textFragments[i].replace('border-style: solid;', 'borderLeft: solid; borderTop: solid; borderBottom: solid;');
        }
        else if(textFragments[i-1].includes('</span>') && !textFragments[i+1].includes('border-style: solid;')){
          // console.log('right', textFragments[i]);
          textFragments[i] = textFragments[i].replace('border-style: solid;', 'borderRight: solid; borderTop: solid; borderBottom: solid;');
        }
        else if(textFragments[i+1].includes('</span>') && textFragments[i-1].includes('</span>')){
          // console.log('middle', textFragments[i]);
          textFragments[i] = textFragments[i].replace('border-style: solid;', 'borderTop: solid; borderBottom: solid;');
        }
      }

      //if border-radius is 5px 0 0 5px, there should be a span to the right, if there isn't then we should change that border
      if(textFragments[i].includes('border-radius: 5px 0 0 5px;' )){
        if(!textFragments[i+1].includes('</span>')){
          textFragments[i] = textFragments[i].replace('border-radius: 5px 0 0 5px;', 'border-radius: 5px;');
        }
      }

      //if border-radius is 0, there should be a span to the right and left of it
      //if not, there could be a mention to the right or left of it that is spaced away
      //we need to figure this out and make changes accordingly
      if(textFragments[i].includes('border-radius:0;' )){
        if(!textFragments[i+1].includes('</span>')){
          textFragments[i] = textFragments[i].replace('border-radius:0;', 'border-radius:0 5px 5px 0;');
        }
        else if(!textFragments[i-1].includes('</span>')){
          textFragments[i] = textFragments[i].replace('border-radius:0;', 'border-radius: 5px 0 0 5px;');
        }
      }

      //if border-radius is 0 5px 5px 0, there should be a span to the left, if there isn't then we should change that border
      if(textFragments[i].includes('border-radius:0 5px 5px 0')){
        if(!textFragments[i-1].includes('</span>')){
          textFragments[i] = textFragments[i].replace('border-radius:0 5px 5px 0;', 'border-radius: 5px;');
        }

      }

    }
    return textFragments;
  }

  function getAllConceptIDs(){
    let conceptIDList = [];

    for(let i = 0; i < filteredConcepts.length; i++){
        const mentions = getMentionsGivenMentionIds(getMentionsForConcept(filteredConcepts[i].id));
        conceptIDList.push(mentions);
    }
    return conceptIDList;
  }

  function setHTML() {
    let conceptIds = getAllConceptIDs();
    setDocText(highlightTextMentions(createMentionObj(conceptIds), doc.text));
  }

  useEffect(() => {
    if(props.filteredConcepts.length > 0){
      setDoc(props.doc);
      setDocText(props.doc.text);
      setHTML()
    }
  },[props.doc, props.filteredConcepts, props.clickedTerm]);
  // props.doc, props.filteredConcepts, props.clickedTerm

  const getHTML = (docText) => {
    return parse(docText);
  };


  if (doc === null) {
    return <div>Loading...</div>;
  } else {
      return (
        <React.Fragment>
          <div style={{'fontSize': fontSize}}>
            {getHTML(docText)}
          </div>
        </React.Fragment>
      );
  }
}
