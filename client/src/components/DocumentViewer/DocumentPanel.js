import React, {useEffect, useRef, useState} from "react";
import $ from "jquery";
import parse from "html-react-parser";
// import {sortedConcepts} from "./ConceptListPanel";

export function DocumentPanel(props) {
  const [doc, setDoc] = useState(props.doc);
  const [docText, setDocText] = useState(props.doc.text);
  const concepts = props.concepts;
  const semanticGroups = props.semanticGroups;
  const filteredConcepts = props.filteredConcepts;
  let highlightedMentions = [];

  const getMentionsGivenMentionIds = (mentionIds) => {
    return doc.mentions.filter((m) => mentionIds.includes(m.id));
  };
  const getMentionsForConcept = (conceptId) => {
    const idx = concepts.findIndex((c) => c.id === conceptId);
    return concepts[idx].mentionIds.filter((mentionId) => {
      return doc.mentions.some((m) => m.id === mentionId);
    });
  };
  let handleTermClick = (e) => {
    let obj = {};
    const conceptId = e.target.getAttribute("data-id");

    const mentions = getMentionsGivenMentionIds(
      getMentionsForConcept(conceptId)
    );
    highlightedMentions.push(mentions);
    console.log("Show these mentions: ", highlightedMentions);


    setDocText(highlightTextMentions(highlightAllMentions(highlightedMentions), doc.text, "blue"));

    // const indexOfLastParenthesis = e.target.textContent.lastIndexOf("(");
    // obj.term = e.target.textContent.slice(0, indexOfLastParenthesis);
    // obj.begin = e.target.getAttribute("data-begin");
    // obj.end = e.target.getAttribute("data-end");

    // scrollToHighlightedTextMention(obj, doc);
  };

  $(document).on("click", ".report_mentioned_term", handleTermClick);

  function highlightAllMentions(mentionedTerms) {
    let textMentions = [];
    // mentionedTerms.forEach(function (nestedArray) {
    //   nestedArray.forEach(function(obj) {
    mentionedTerms.forEach(function (obj){
        //grabbing mention begin and end so that I can highlight each mention at the start
        let textMentionObj = {};
        // console.log(obj.begin);
        textMentionObj.preferredText = obj["preferredText"];
        // textMentionObj.text = obj.text;
        textMentionObj.begin = obj.begin;
        textMentionObj.end = obj.end;
        // textMentionObj.mentionFrequency = obj.frequency;
        // console.log(textMentionObj);
        textMentions.push(textMentionObj);
      });
    // });

    return textMentions;
  }

  function createMentionObj(mentionedTerms) {
    let textMentions = [];
    mentionedTerms.forEach(function (nestedArray) {
      nestedArray.forEach(function(obj) {
    // mentionedTerms.forEach(function (obj){
      //grabbing mention begin and end so that I can highlight each mention at the start
      let textMentionObj = {};
      // console.log(obj.begin);
      textMentionObj.preferredText = obj["preferredText"];
        // textMentionObj.text = obj.text;
      textMentionObj.begin = obj.begin;
      textMentionObj.end = obj.end;
      textMentionObj.backgroundColor = semanticGroups[obj.dpheGroup].backgroundColor;
      // console.log(textMentionObj.preferredText, textMentionObj.backgroundColor, obj.dpheGroup);
      textMentionObj.color = semanticGroups[obj.dpheGroup].color;
      // textMentionObj.mentionFrequency = obj.frequency;
      // console.log(textMentionObj);
      textMentions.push(textMentionObj);
      });
    });

    return textMentions;
  }

  $(document).on("click", "#zoom_in_btn", function () {
    let newFontSize = parseInt($("#report_text").css("font-size")) + 1;
    $("#report_text").css("font-size", newFontSize);
  });

  $(document).on("click", "#zoom_out_btn", function () {
    let newFontSize = parseInt($("#report_text").css("font-size")) - 1;
    $("#report_text").css("font-size", newFontSize);
  });

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
    // console.log("sorted points: ", points);

    // FIND THE INTERSECTING SPANS FOR EACH PAIR OF POINTS (IF ANY)
    // ALSO MERGE THE ATTRIBUTES OF EACH INTERSECTING SPAN, AND INCREASE THE COUNT FOR EACH INTERSECTION
    for (let i in points) {
      if (i === 0 || points[i] === points[i - 1]) continue;
      let includedRanges = ranges.filter(function (x) {
        return Math.max(x.begin, points[i - 1]) < Math.min(x.end, points[i]);
      });
      //console.log(includedRanges);

      if (includedRanges.length > 0) {
        let flattenedRange = {
          begin: points[i - 1],
          end: points[i],
          count: 0,
        };

        for (let j in includedRanges) {
          //console.log(includedRanges[j]);
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

    //console.log(textMentionObj);
    textMentions.push(textMentionObj);
    //console.log(term);

    // Highlight this term in the report text
    //console.log(mentionedTerms);
    textMentions = highlightAllMentions(doc.mentions);
    // console.log(textMentions);
    // console.log(textMentions);
    let highlightedReportText = highlightTextMentions(
      doc.mentions,
      doc.text,
      obj.term
    );
    // Use html() for html rendering
    reportTextDiv.html(highlightedReportText);

    // Scroll to that position inside the report text div
    // https://stackoverflow.com/questions/2346011/how-do-i-scroll-to-an-element-within-an-overflowed-div
    // 5 is position tweak
    //reportTextDiv.scrollTop(reportTextDiv.scrollTop() + $('.highlighted_term').position().top - 5);
  }

  function highlightTextMentions(textMentions, reportText, term = "NONE") {
    // const cssClass = "highlighted_term";
    // const cssClassAll = "highlight_terms";
    console.log(textMentions);

    // Flatten the ranges, this is the key to solve overlapping
    textMentions = flattenRanges(textMentions);
    // console.log(textMentions);

    let textFragments = [];
    let lastValidTMIndex = 0;

    for (let i = 0; i < textMentions.length; i++) {
      let textMention = textMentions[i];
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
        // if (parseInt(textMention.begin) <= parseInt(lastValidTM.end)) {
        if (textMention.begin <= lastValidTM.end) {
          lastValidTMIndex = i;
        } else {
          textFragments.push(
            reportText.substring(lastValidTM.end, textMention.begin)
          );
        }
      }

      if (textMention.preferredText.indexOf(term) > -1) {
        // console.log("1", textMention.preferredText, textMention.backgroundColor, reportText.substring(textMention.begin, textMention.end));
        textFragments.push(
          '<span style="background-color:'+textMention.backgroundColor+'; border-radius:5px">' +
            reportText.substring(textMention.begin, textMention.end) +
            "</span>"
        );
      } else {
        // console.log("2", textMention.preferredText, textMention.backgroundColor, reportText.substring(textMention.begin, textMention.end));
        console.log(textMention);
        textFragments.push(
          '<span style="background-color:'+textMention.backgroundColor+'; border-radius:5px">' +
            reportText.substring(textMention.begin, textMention.end) +
            "</span>"
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
      const mentions = getMentionsGivenMentionIds(
          getMentionsForConcept(filteredConcepts[i].id)
      );
      conceptIDList.push(mentions);
    }
    return conceptIDList;
  }

  function setHTML() {
    let conceptIds = getAllConceptIDs();
    console.log(conceptIds, doc.text);
    setDocText(highlightTextMentions(createMentionObj(conceptIds), doc.text));
  }

  useEffect(() => {
    if(props.filteredConcepts.length > 0){
      setHTML()
    }
  });


  const getHTML = (docText) => {
    return parse(docText);
  };


  if (doc === null) {
    return <div>Loading...</div>;
  } else {
      return (
        <React.Fragment>
          {getHTML(docText)}
          {/*{setHTML()}*/}
        </React.Fragment>
      );
  }
}
