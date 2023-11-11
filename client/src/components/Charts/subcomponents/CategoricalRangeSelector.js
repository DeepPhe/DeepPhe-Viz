import React, {Component} from "react";
import Slider from "rc-slider";
import {ChangeResult} from "multi-range-slider-react";
import SwitchControl from "./controls/SwitchControl";
import * as d3 from "d3v4";
import $ from 'jquery';

class CategoricalRangeSelector extends Component {
    state: any = {
        definition: this.props.definition,
        updated: false
    }
    constructor(props) {
        super(props);
    }
    broadcastUpdate = (definition) => {
        this.props.broadcastUpdate(definition)
    }

    handleRangeChange = (e: ChangeResult) => {
        const {definition} = this.state

        let selectedCategoricalRange = []
        for (let i = e[0]; i <= e[1]; i++)
            selectedCategoricalRange.push(definition.globalPatientCountsForCategories[i].category)
        this.setState({...definition.selectedCategoricalRange = selectedCategoricalRange})
        this.setState({updated: false})
    };

    handleSwitchUpdate = (definition) => {
        this.setState({definition: definition, updated: false})
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.updated === false) {
            this.setState({updated: true})
            this.broadcastUpdate(this.state.definition)
        }

        const {definition} = this.props
        console.log(definition.fieldName + ":")
        console.log("    Range: " + definition.selectedCategoricalRange[0] + " - " + definition.selectedCategoricalRange[definition.selectedCategoricalRange.length - 1])

        this.state.definition.switches.forEach(switchInfo => {
            console.log("    Switch " + switchInfo.name + ": " + switchInfo.value)
        })

        var text = "IIA";

        var search = $( "#stage-overlay-row span" ).filter( function ()
        {
            return $( this ).text().toLowerCase().indexOf( text.toLowerCase() ) >= 0;
        }).first();
        var x = $(search).offset().left;
        var y = $(search).offset().top;
        $("#IIA").remove();
        search.append("<svg id='IIA' height=50 width=50 />")
        let svg = d3.select("#IIA")
        svg.style('position', 'absolute').style("top", "-20px")

        debugger;
        svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 50)
            .attr('height', 40)
            .attr('stroke', 'black')
            .attr('fill', '#69a3b2');


    }

    render() {
        const {definition} = this.props
        const globalPatientCountsForCategories = definition.globalPatientCountsForCategories
        const selectedCategoricalRange = definition.selectedCategoricalRange
        const marks = {}
        let minSelectedInRange = 10000000000;
        let maxSelectedInRange = 0;
        globalPatientCountsForCategories.map((item, index) => {
            marks[index] = item.category
            if (selectedCategoricalRange.indexOf(item.category) !== -1) {
                minSelectedInRange = Math.min(minSelectedInRange, index)
                maxSelectedInRange = Math.max(maxSelectedInRange, index)
            }
            return true;
        })

        return (
            <React.Fragment>
                <div id={definition.fieldName.replaceAll(" ", "-").toLowerCase() + "-overlay-row"}>
                    <div id={"categorical-range-selector-row"} className={"row filter_center_rows"}>
                        <div className={"slider-container"}>
                            <Slider range min={0} max={globalPatientCountsForCategories.length - 1}
                                    defaultValue={[minSelectedInRange, maxSelectedInRange]}
                                    onChange={(e) => this.handleRangeChange(e)}
                                    draggableTrack={true} pushable={true} marks={marks} dots={false} step={1}/>
                        </div>
                        <SwitchControl broadcastUpdate = {this.handleSwitchUpdate} definition = {definition}/>
                    </div>
                </div>
            </React.Fragment>

        )
    }
}

export default CategoricalRangeSelector;