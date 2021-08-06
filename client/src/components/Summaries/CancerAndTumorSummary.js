import React from "react";

import Handlebars from "handlebars";
import ReactDOM from "react-dom";
import {withRouter} from "react-router-dom";



const { Component, createElement } = React;

const source = `

{{#if cancers.length}}

<!--<div class="section_heading">Cancer & Tumor Summary</div>-->

{{#each cancers}}
<div class="cancer_and_tumor_summary clearfix">

<div class="cancer_id">{{title}}: </div>

<div class="cancer_and_tnm">

<ul class="cancer_facts">
    {{#each collatedCancerFacts}}
    <li class="cancer_facts_item">
        <span class="cancer_fact_category_name">{{categoryName}}: </span>
        <ul class="cancer_fact_list">
          {{#each facts}}
            <li><span class="fact" id="{{id}}">{{prettyName}}</span></li>
          {{/each}}
        </ul>
    </li>
    {{/each}}
</ul>



<!-- TNM -->
{{#if tnm.length}}
    <div class="tnm clearfix">
        {{#each tnm}}
        <div class="tnm_by_type">
            <span class="tnm_type">{{type}} TNM: </span>
            
            {{#if data.T}}
            <ul class="cancer_tnm_fact_list">
                {{#each data.T}}
                <li><span class="fact" id="{{id}}">{{prettyName}}</span></li>
                {{/each}}
            </ul>
            {{/if}}
            
            {{#if data.N}}
            <ul class="cancer_tnm_fact_list">
                {{#each data.N}}
                <li><span class="fact" id="{{id}}">{{prettyName}}</span></li>
                {{/each}}
            </ul>
            {{/if}}
  
            {{#if data.M}}
            <ul class="cancer_tnm_fact_list">
                {{#each data.M}}
                <li><span class="fact" id="{{id}}">{{prettyName}}</span></li>
                {{/each}}
            </ul>
            {{/if}}
        </div>
        {{/each}}

    </div>
{{/if}}
</div>


<!-- Tumor Summary -->
{{#if tumors.tumors.length}}
<div class="tumor_summary">
<div class="tumor_summary_title">Tumor Summary</div>
<div class="view_options" id="view_options_{{cancerId}}">
<input type="radio" id="list_view_option_{{cancerId}}" class="list_view_option" name="view_options_{{cancerId}}" value="List View" checked />
<label for="list_view_option_{{cancerId}}"><i class="fa fa-list"></i> List View</label>
<input type="radio" id="table_view_option_{{cancerId}}" class="table_view_option" name="view_options_{{cancerId}}" value="Table View" />
<label for="table_view_option_{{cancerId}}"><i class="fa fa-table"></i> Table View</label>
</div>



<!-- List View -->
<div id="list_view_{{cancerId}}" class="list_view">
{{#each tumors.listViewData}}
<div class="list_view_tumor clearfix">
    <div class="list_view_tumor_type" title="Click to expand/collapse"><span class="arrow"><i class="fa fa-dot-circle-o"></i><i class="fa fa-caret-down"></i></span> {{type}}</div>
    <ul class="list_view_tumor_list clearfix">
        {{#each data}}
            {{#if facts}} <!-- Don't show empty facts for now, use categoryClass as CSS selectors -->
            <li class="list_view_tumor_list_item {{categoryClass}}">
                <!-- Show full info of Body Site and Diagnosis, others just bars until expanded -->
                {{#ifEquals category "Body Site"}} 
                    <ul class="list_view_tumor_fact_list">
                    {{#each facts}}
                        <li><span class="fact" id="list_view_{{id}}">{{prettyName}}</span></li>
                    {{/each}}
                    </ul>
                {{else ifEquals category "Laterality"}} 
                    <ul class="list_view_tumor_fact_list">
                    {{#each facts}}
                        <li><span class="fact" id="list_view_{{id}}">{{prettyName}}</span></li>
                    {{/each}}
                    </ul>
                {{else ifEquals category "Diagnosis"}} 
                    <ul class="list_view_tumor_fact_list">
                    {{#each facts}}
                        <li><span class="fact" id="list_view_{{id}}">{{prettyName}}</span></li>
                    {{/each}}
                    </ul>
                {{else}}
<!--                    <div class="toggleable">-->
                    {{category}}:
                    <ul class="list_view_tumor_fact_list">
                    {{#each facts}}
                        <!-- "../"" is the notation to access outer scope variables -->
<!--                        JDL 2021-6-18: taking this out because I don't have melanoma data at this time and this is causing problems-->
<!--                        {{#inArray prettyName ../../../../melanomaAttributes}}-->
<!--                            &lt;!&ndash; Melanoma specific &ndash;&gt;-->
<!--                            <li><span class="fact" id="list_view_{{id}}"><span class="present">&#x2714;</span> Present</span></li>-->
<!--                        {{else}}-->
                            <li><span class="fact" id="list_view_{{id}}">{{prettyName}}</span></li>
<!--                        {{/inArray}}-->
                      {{/each}}
                    </ul>
<!--                    </div>-->
                {{/ifEquals}}
            </li>
            {{/if}}
        {{/each}}
    </ul>
</div>
{{/each}}
</div>




<!-- Table View -->
<div id="table_view_{{cancerId}}" class="table_view">
<table class="table">

<thead>
    <tr>
        <th class="th"></th>
        {{#each tumors.tumors}}
            <th class="th">{{type}}</th>
        {{/each}}
    </tr>
</thead>

<tbody>
    {{#each tumors.tableViewData}}
   
    <tr>
        <th class="th_vertical {{categoryClass}}">{{category}}</th>
        {{#each data}}
         
            {{#if facts}}
                <td>
                
                <ul class="tumor_fact_list">
                    {{#each facts}}

                            <li><span class="fact" id="table_view_{{id}}">{{prettyName}}</span></li>

                    {{/each}}
                </ul>
                </td>
            {{else}}
                <td class="empty_cell"></td>
            {{/if}}
        {{/each}}
    </tr>
    {{/each}}

</tbody>

</table>
</div>

</div>

{{/if}}

</div>

{{/each}}

{{/if}}

`;



const template  =  Handlebars.compile( source );

Handlebars.registerHelper('ifEquals',
    function(arg1, arg2, options) {
        return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
}
);

Handlebars.registerHelper('inArray',
    function(item, arr, opts) {
            if (Array.isArray(arr)) {
                if (arr.indexOf(item) > -1) {
                    return opts.fn(this);
                } else {
                    return opts.inverse(this);
                }
            } else {

                console.error("ERROR: arr is not an array!");
                console.error("Item:" + item);
                console.error("OptsL" + opts);
                return false;
            }

    }
);


class CancerAndTumorSummary extends Component {

    // constructor(props) {
    //     super(props);
    //
    // };

    render () {
        return <div className="container" dangerouslySetInnerHTML={{ __html: template( this.props ) }} />;
    }
}

ReactDOM.render( createElement( CancerAndTumorSummary), document.getElementById("root"));


export default withRouter(CancerAndTumorSummary);