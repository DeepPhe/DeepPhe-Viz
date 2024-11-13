import React, {useRef, useEffect, useState} from "react";
import parse from "html-react-parser";
import {hexToRgba} from "./ColorUtils";
import { useCallback } from 'react';

import { getMentionsGivenMentionIds, getMentionsForConcept } from './mentionUtils';




export function DocumentPanel(props) {
  const [doc, setDoc] = useState(props.doc);
  const [docText, setDocText] = useState(props.doc.text);
  const concepts = props.concepts;
  const clickedTerm = props.clickedTerm;
  const semanticGroups = props.semanticGroups;
  const filteredConcepts = props.filteredConcepts;
  const [filteredConceptsStartingCopy, setFilteredConceptsStartingCopy] = useState([]);
  const fontSize = props.fontSize;
  const confidence = props.confidence;
  const filterLabel = props.filterLabel;

  useEffect(() => {
    // Only set the copy once, when the component mounts
    if (Array.isArray(filteredConcepts) && filteredConcepts.length > 0 && filteredConceptsStartingCopy.length === 0) {
      setFilteredConceptsStartingCopy(filteredConcepts);
    }
  }, [filteredConcepts, filteredConceptsStartingCopy]);

  function createMentionObj(FilteredConceptsIds) {
    let textMentions = [];
    FilteredConceptsIds.forEach(function (nestedArray) {
        nestedArray.forEach(function(obj) {

          let textMentionObj = {};
          let mentionConfidence = 0;

          if(filterLabel === "Concepts"){
            const result = filteredConceptsStartingCopy.find(category =>
                category.mentionIds && category.mentionIds.includes(obj.id)
            );
            if (result) {
              mentionConfidence = Math.round(result.confidence * 100);
            }
            else{
              console.log(result.preferredText, "has no confidence");
            }
          }
          else{
            mentionConfidence = Math.round(obj.confidence);
          }
          textMentionObj.preferredText = obj["preferredText"];
          textMentionObj.begin = obj.begin;
          textMentionObj.end = obj.end;
          textMentionObj.id = obj.id;
          textMentionObj.negated = obj.negated;
          textMentionObj.confidence = mentionConfidence;
          // console.log(obj["preferredText"], semanticGroups[obj.dpheGroup]);
          if(textMentionObj.confidence < confidence * 100 || semanticGroups[obj.dpheGroup].checked === false){
            textMentionObj.backgroundColor = 'lightgrey';
          }
          else{
            const hexColor = semanticGroups[obj.dpheGroup].backgroundColor;
            textMentionObj.backgroundColor = hexToRgba(hexColor, 0.65);
          }

          const mentionsForHighlight = getMentionsForConcept(doc, concepts, clickedTerm);
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

    points.sort(function (a, b) {
      return a - b;
    });

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

      let borderColor = textMention.clickedTerm.some((element) => {return element}) ? 'border-color: black;' : 'border-color: transparent;';

      //We want to check what is in front of textmention without checking what is behind it, so this is a special
      //case for the first textMention
      if(i === 0 && textMentions[i + 1]){
        if (textMention.backgroundColor === textMentions[i + 1].backgroundColor[textMentions[i + 1].backgroundColor.length - 1]) {
          const spanClass = isNegated(textMention.negated) ? 'neg' : '';
          const spanStyle =
              `background-color: ${textMention.backgroundColor};
              border-style: solid; 
              ${borderColor};
              border-radius: 5px 0 0 5px;
              padding-left: 2px;
              padding-right: 2px;`;

          // const htmlString = `<span style="${spanStyle}" class="span-info ${spanClass}">` +
          //     `${reportText.substring(textMention.begin, textMention.end).trim()}` +
          //     `<span class="tooltip">${textMention.confidence[0]}%</span>` +
          //     (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
          //     `</span>`;

          const htmlString = `<span style="${spanStyle}${isNegated(textMention.negated) ? '; line-height: 1.4;' : ''}" class="span-info ${spanClass}">` +
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
          border-style: solid; 
          ${borderColor};
          border-radius: 5px;
          padding-left: 2px;
          padding-right: 2px;`;
          // const htmlString = `<span style="${spanStyle}" class="span-info ${spanClass}">` +
          //     `${reportText.substring(textMention.begin, textMention.end).trim()}` +
          //     `<span class="tooltip">${textMention.confidence[0]}%</span>` +
          //     (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
          //     `</span>`;
          const htmlString = `<span style="${spanStyle}${isNegated(textMention.negated) ? '; line-height: 1.4;' : ''}" class="span-info ${spanClass}">` +
              `${reportText.substring(textMention.begin, textMention.end).trim()}` +
              `<span class="tooltip">${textMention.confidence[0]}%</span>` +
              (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
              `</span>`;

          textFragments.push(htmlString);
        }
      }

      //We want to check what is behind the last textmention without checking what is in front it, so this is a special
      //case for the last textMention
      if(i === textMentions.length - 1 && reportText.substring(textMention.begin, textMention.end).trim() !== ""){
        if(textMentions[i - 1].backgroundColor === textMention.backgroundColor) {
          const spanClass = isNegated(textMention.negated) ? 'neg' : '';
          const spanStyle = `background-color: ${textMention.backgroundColor};
          border-style: solid; 
          ${borderColor};
          border-radius:0 5px 5px 0;
          padding-left: 2px;
          padding-right: 2px;`;

          // const htmlString = `<span style="${spanStyle}" class="span-info ${spanClass}">` +
          //     `${reportText.substring(textMention.begin, textMention.end).trim()}` +
          //     `<span class="tooltip">${textMention.confidence[0]}%</span>` +
          //     (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
          //     `</span>`;
          const htmlString = `<span style="${spanStyle}${isNegated(textMention.negated) ? '; line-height: 1.4;' : ''}" class="span-info ${spanClass}">` +
              `${reportText.substring(textMention.begin, textMention.end).trim()}` +
              `<span class="tooltip">${textMention.confidence[0]}%</span>` +
              (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
              `</span>`;

          textFragments.push(htmlString);
        }
        else{
          const spanClass = isNegated(textMention.negated) ? 'neg' : '';
          const spanStyle = `background-color: ${textMention.backgroundColor};
          border-style: solid; 
          ${borderColor};
          border-radius: 5px;
          padding-left: 2px;
          padding-right: 2px;`;
          // const htmlString = `<span style="${spanStyle}" class="span-info ${spanClass}">` +
          //     `${reportText.substring(textMention.begin, textMention.end).trim()}` +
          //     `<span class="tooltip">${textMention.confidence[0]}%</span>` +
          //     (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
          //     `</span>`;

          const htmlString = `<span style="${spanStyle}${isNegated(textMention.negated) ? '; line-height: 1.4;' : ''}" class="span-info ${spanClass}">` +
              `${reportText.substring(textMention.begin, textMention.end).trim()}` +
              `<span class="tooltip">${textMention.confidence[0]}%</span>` +
              (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
              `</span>`;

          textFragments.push(htmlString);
        }

      }

      if( i > 0 && i < textMentions.length - 1 && reportText.substring(textMention.begin, textMention.end).trim() !== "") {

        const borderRadius = determineBorderRadius(textMention, textMentions, i);
        const spanClass = isNegated(textMention.negated) ? 'neg' : '';
        const spanStyle = `background-color: ${textMention.backgroundColor};
        border-style: solid; 
        ${borderColor};
        border-radius:${borderRadius};
        padding-left: 2px;
        padding-right: 2px;`;
        // const htmlString = `<span style="${spanStyle}" class="span-info ${spanClass}">` +
        //     `${reportText.substring(textMention.begin, textMention.end).trim()}` +
        //     `<span class="tooltip">${textMention.confidence[0]}%</span>` +
        //     (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
        //     `</span>`;
        const htmlString = `<span style="${spanStyle}${isNegated(textMention.negated) ? '; line-height: 1.4;' : ''}" class="span-info ${spanClass}">` +
            `${reportText.substring(textMention.begin, textMention.end).trim()}` +
            `<span class="tooltip">${textMention.confidence[0]}%</span>` +
            (isNegated(textMention.negated) ? '<span class="icon">&#8856;</span>' : '') +
            `</span>`;

        textFragments.push(htmlString);

      }

      lastValidTMIndex = i;
    }

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

  //Backgrounds both have color
  function determineBorderRadius(textMention, textMentions, i) {

    //check for past and future textMention, if they are same color then change border to 0
    if (textMentions[i - 1].backgroundColor && textMention.backgroundColor &&
        textMentions[i + 1].backgroundColor[textMentions[i + 1].backgroundColor.length - 1]) {
      return "0";
    }
    //checking past textMention only
    else if (textMentions[i - 1].backgroundColor && textMention.backgroundColor) {
      return "0 5px 5px 0";
    }
    //checking future textMention only
    else if (textMention.backgroundColor && textMentions[i + 1].backgroundColor[textMentions[i + 1].backgroundColor.length - 1]) {
      return "5px 0 0 5px";
    }
    //its by its self between two non highlighted spans
    else {
      return "5px";
    }
  }

  function cleanUpTextFragments(textFragments){
    //getting correct click
    for(let i = 0; i < textFragments.length; i++){
      if(textFragments[i].includes('border-color: black;')){
        // console.log('solid: ', textFragments[i]);
        if(textFragments[i+1].includes('</span>') && !textFragments[i-1].includes('</span>')){
          // console.log('left', textFragments[i]);
          textFragments[i] = textFragments[i].replace('borderLeft: solid; borderTop: solid; borderBottom: solid;');
        }
        else if(textFragments[i-1].includes('</span>') && !textFragments[i+1].includes('border-style: solid;')){
          // console.log('right', textFragments[i]);
          textFragments[i] = textFragments[i].replace('borderRight: solid; borderTop: solid; borderBottom: solid;');
        }
        else if(textFragments[i+1].includes('</span>') && textFragments[i-1].includes('</span>')){
          // console.log('middle', textFragments[i]);
          textFragments[i] = textFragments[i].replace('borderTop: solid; borderBottom: solid;');
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

  function getAllMentionsInDoc(){
    let MentionList = [];

    for(let i = 0; i < filteredConceptsStartingCopy.length; i++){
      const conceptId = filteredConceptsStartingCopy[i].id;
      const mentionIdsFromConceptId = getMentionsForConcept(doc, concepts, conceptId);
      const mentions = getMentionsGivenMentionIds(doc, mentionIdsFromConceptId);
      MentionList.push(mentions);
    }
    return MentionList;
  }



  const setHTML = useCallback(() => {
    let mentions = getAllMentionsInDoc();
    setDocText(highlightTextMentions(createMentionObj(mentions), doc.text));
  }, [getAllMentionsInDoc, highlightTextMentions, createMentionObj, doc.text]);


  useEffect(() => {
    if(props.filteredConcepts.length > 0){
      setDoc(props.doc);
      setDocText(props.doc.text);
      setHTML()
    }
  },[props.doc,props.clickedTerm, props.confidence, props.semanticGroups, filterLabel]);


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
