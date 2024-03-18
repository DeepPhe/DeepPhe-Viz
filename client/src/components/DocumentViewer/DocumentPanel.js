import React, { useState } from "react";
import $ from "jquery";
import parse from "html-react-parser";

export function DocumentPanel(props) {
  const [doc, setDoc] = useState(props.doc);
  const [docText, setDocText] = useState(props.doc.text);
  const concepts = props.concepts;
  const semanticGroups = props.semanticGroups;
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
    console.log("Show these mentions: ", mentions);

    setDocText(highlightTextMentions(highlightAllMentions(mentions), doc.text, "yellow"));

    const indexOfLastParenthesis = e.target.textContent.lastIndexOf("(");
    obj.term = e.target.textContent.slice(0, indexOfLastParenthesis);
    obj.begin = e.target.getAttribute("data-begin");
    obj.end = e.target.getAttribute("data-end");

    // scrollToHighlightedTextMention(obj, doc);
  };

  $(document).on("click", ".report_mentioned_term", handleTermClick);

  function highlightAllMentions(mentionedTerms) {
    let textMentions = [];
    mentionedTerms.forEach(function (obj) {
      //grabbing mention begin and end so that I can highlight each mention at the start
      let textMentionObj = {};
      textMentionObj.text = obj.preferredText;
      textMentionObj.begin = obj.begin;
      textMentionObj.end = obj.end;
      textMentionObj.mentionFrequency = obj.frequency;
      //console.log(textMentionObj);
      textMentions.push(textMentionObj);
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
    // console.log("======input ranges======");
    // console.log(ranges);

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
    // console.log("points: ", points);

    //MAKE SURE OUR LIST OF POINTS IS IN ORDER
    //COMMENT THIS OUT LATER
    points.sort(function (a, b) {
      return a - b;
    });
    console.log("sorted points: ", points);

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
    // $('.report_mentioned_term_1').removeClass(cssClass);
    // $('.report_mentioned_term_2').removeClass(cssClass);
    // $('.report_mentioned_term_3').removeClass(cssClass);
    // $('.report_mentioned_term_4').removeClass(cssClass);
    // Then add to this current one by selecting the attributes
    $(
      'li[data-begin="' + obj.begin + '"][data-end="' + obj.end + '"]'
    ).addClass(cssClass);

    let reportTextDiv = $("#report_text");

    let textMentions = [];

    let textMentionObj = {};
    textMentionObj.text = obj.preferredText;
    textMentionObj.begin = obj.begin;
    textMentionObj.end = obj.end;

    //console.log(textMentionObj);
    textMentions.push(textMentionObj);
    //console.log(term);

    // Highlight this term in the report text
    //console.log(mentionedTerms);
    textMentions = highlightAllMentions(doc.mentions);
    // console.log(textMentions);
    let highlightedReportText = highlightTextMentions(
      doc.mentions,
      doc.text,
      obj.term
    );
    //console.log(highlightedReportText);

    // Use html() for html rendering
    reportTextDiv.html(highlightedReportText);

    // Scroll to that position inside the report text div
    // https://stackoverflow.com/questions/2346011/how-do-i-scroll-to-an-element-within-an-overflowed-div
    // 5 is position tweak
    //reportTextDiv.scrollTop(reportTextDiv.scrollTop() + $('.highlighted_term').position().top - 5);
  }

  function highlightTextMentions(textMentions, reportText, color, term = "NONE") {
    const cssClass = "highlighted_term";
    const cssClassAll = "highlight_terms";

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
        if (parseInt(textMention.begin) <= parseInt(lastValidTM.end)) {
          lastValidTMIndex = i;
        } else {
          textFragments.push(
            reportText.substring(lastValidTM.end, textMention.begin)
          );
        }
      }
      console.log(term.slice(0, -3));
      //TODO: FIX this later, Need to get text without the mentionFrequency on it
      let correctTerm = term.slice(0, -3);
      if (textMention.text.indexOf(term) > -1) {
        console.log("reached?");
        textFragments.push(
          '<span style="background-color:'+color+'">' +
            reportText.substring(textMention.begin, textMention.end) +
            "</span>"
        );
      } else {
        textFragments.push(
          '<span style="background-color:'+color+'">' +
            reportText.substring(textMention.begin, textMention.end) +
            "</span>"
        );
      }

      lastValidTMIndex = i;
    }
    // Push end of the document
    textFragments.push(
      reportText.substring(textMentions[lastValidTMIndex].end)
    );

    // Assemble the final report content with highlighted texts
    let highlightedReportText = "";

    for (let j = 0; j < textFragments.length; j++) {
      highlightedReportText += textFragments[j];
    }
    // const e = new Event("change");
    // const element = document.querySelector('input[type=radio][name="sort_order"]');
    // element.dispatchEvent(e);

    return highlightedReportText;
  }

  document.addEventListener("DOMContentLoaded", function () {
    const scrollLine = document.getElementById("scroll-line");
    const content = document.getElementById("report_text");
    // console.log(scrollLine);
    // console.log("HERE");
    // console.log(content.innerHTML);

    // Update the line position when the content is scrolled
    // content.addEventListener("scroll", function () {
    //   const scrollTop = content.scrollTop;
    //   const scrollHeight = content.scrollHeight;
    //   const clientHeight = content.clientHeight;
    //
    //   const scrollFraction = scrollTop / (scrollHeight - clientHeight);
    //
    //   const scrollLineTop = scrollFraction * (clientHeight - 40); // Adjust based on line size
    //   scrollLine.style.top = scrollLineTop + "px";
    //   scrollLine.style.display = "block";
    // });
    //
    // // Hide the line when the user stops scrolling
    // let scrollTimer;
    // content.addEventListener("scroll", function () {
    //   clearTimeout(scrollTimer);
    //   scrollTimer = setTimeout(function () {
    //     scrollLine.style.display = "none";
    //   }, 1000); // Adjust delay as needed
    // });
  });

  // if (factBasedTermsWithPosition.length > 0) {
  //   scrollToHighlightedTextMention(
  //     factBasedTermsWithPosition[0],
  //     reportText,
  //     doc
  //   );

  const getHTML = (docText) => {
    let html = docText
    // Object.keys(semanticGroups).forEach((key) => {
    //   const group = semanticGroups[key];
    //   const mentionsForConcept = getMentionsGivenMentionIds(getMentionsForConcept(group.id));
    //   if (group.checked) {
    //     html = highlightTextMentions(highlightAllMentions(mentionsForConcept), html, group.color);
    //   }
    //
    // })
    // return parse("<svg height=\"1000\" width=\"1000\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
    //   "  <text x=\"5\" y=\"15\" fill=\"red\">"+docText+"</text>\n" +
    //   "</svg>")
    return parse(html);
  };

  if (doc === null) {
    return <div>Loading...</div>;
  } else {
    console.log("calling render");

    return (
      <React.Fragment>
        {/*<div id="scroll-line"></div>*/}
        {getHTML(docText)}
      </React.Fragment>
    );
  }
}
