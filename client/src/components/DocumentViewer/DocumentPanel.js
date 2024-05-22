import React, {useEffect, useRef, useState} from "react";
import $ from "jquery";
import parse from "html-react-parser";
import {element} from "prop-types";

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


  function highlightAllMentions(mentionedTerms) {
    let textMentions = [];
    mentionedTerms.forEach(function (obj){
        let textMentionObj = {};
        textMentionObj.preferredText = obj["preferredText"];
        textMentionObj.begin = obj.begin;
        textMentionObj.end = obj.end;
        textMentions.push(textMentionObj);
      });

    return textMentions;
  }

  function createMentionObj(mentionedTerms) {
    let textMentions = [];
    mentionedTerms.forEach(function (nestedArray) {
        nestedArray.forEach(function(obj) {
    // mentionedTerms.forEach(function (obj){
      //grabbing mention begin and end so that I can highlight each mention at the start
        let textMentionObj = {};

        textMentionObj.preferredText = obj["preferredText"];
        textMentionObj.begin = obj.begin;
        textMentionObj.end = obj.end;
        textMentionObj.backgroundColor = semanticGroups[obj.dpheGroup].backgroundColor;
        textMentionObj.color = semanticGroups[obj.dpheGroup].color;
        textMentionObj.id = obj.id;
        const mentionsForHighlight = getMentionsForConcept(clickedTerm);
        //grab mentionIds from conceptID that I get from click
          //then i check to see if textMentionObj.id is in the list of mentionIDS if it is True, else false
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

  function scrollToHighlightedTextMention(obj, doc, term = "NONE") {
    // Highlight the selected term in the term list
    const cssClass = "current_mentioned_term";
    // First remove the previously added highlighting
    $(".report_mentioned_term").removeClass(cssClass);
    $(
      'li[data-begin="' + obj.begin + '"][data-end="' + obj.end + '"]'
    ).addClass(cssClass);

    let reportTextDiv = $("#report_text");

    let textMentions = [];

    let textMentionObj = {};
    textMentionObj.text = obj.preferredText;
    // textMentionObj.text = obj.text;
    textMentionObj.begin = obj.begin;
    textMentionObj.end = obj.end;

    textMentions.push(textMentionObj);

    // Highlight this term in the report text
    textMentions = highlightAllMentions(doc.mentions);
    let highlightedReportText = highlightTextMentions(
      doc.mentions,
      doc.text,
      obj.term
    );
    // Use html() for html rendering
    reportTextDiv.html(highlightedReportText);

  }

  function highlightTextMentions(textMentions, reportText, term = "NONE") {
    if(textMentions.length === 0){
      return reportText;
    }

    // Flatten the ranges, this is the key to solve overlapping
    textMentions = flattenRanges(textMentions);

    let textFragments = [];
    let lastValidTMIndex = 0;



    for (let i = 0; i < textMentions.length; i++) {
      let textMention = textMentions[i];

      textMention.backgroundColor = textMention.backgroundColor[textMention.backgroundColor.length - 1];

      let lastValidTM = textMentions[lastValidTMIndex];

      // If this is the first textmention, paste the start of the document before the first TM.
      if (i === 0) {
        if (textMention.begin === 0) {
          textFragments.push("");
        } else {
          textFragments.push(reportText.substring(0, textMention.begin));
        }
      } else {
        // Otherwise, check if this text mention is valid. if it is, paste the text from last valid TM to this one.
        if (textMention.begin <= lastValidTM.end) {
          lastValidTMIndex = i;
        } else {
          textFragments.push(
            reportText.substring(lastValidTM.end, textMention.begin)
          );
        }
      }
      let borderRadiusStyle = textMention.clickedTerm.some((element) => {return element}) ? 'border-style:solid;' : 'border-style: none;';

      if (textMention.preferredText.indexOf(term) > -1) {
        textFragments.push(
          '<span style="background-color:'+textMention.backgroundColor+'; border-radius:5px">' +
            reportText.substring(textMention.begin, textMention.end) +
            "</span>"
        );
      }
      else {

        textFragments.push(
          '<span style="background-color:' + textMention.backgroundColor + ';' + borderRadiusStyle + ' border-radius:5px;">' +
            reportText.substring(textMention.begin, textMention.end) + "</span>"
        );
      }

      lastValidTMIndex = i;
    }
    // debugger;
    // Push end of the document
    textFragments.push(
        reportText.substring(textMentions[lastValidTMIndex].end)
    );

    // Assemble the final report content with highlighted texts
    let highlightedReportText = "";

    for (let j = 0; j < textFragments.length; j++) {
      highlightedReportText += textFragments[j];
    }

    return highlightedReportText;
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
  },[props.doc]);


  const getHTML = (docText) => {
    return parse(docText);
  };


  if (doc === null) {
    return <div>Loading...</div>;
  } else {
      return (
        <React.Fragment>
          <div style={{'fontSize': props.fontSize}}>
            {getHTML(docText)}
          </div>
        </React.Fragment>
      );
  }
}
