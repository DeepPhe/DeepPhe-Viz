import React from "react";
import Grid from "@material-ui/core/Grid";
import DiagnosisChart from "./DiagnosisChart";
import BiomarkerOverview from "./BiomarkerOverview";
import PatientsWithBiomarkersFound from "./PatientsWithBiomarkersFound";
import {TextField} from "@material-ui/core";

const baseUri = "http://localhost:3001";
const baseGuiUri = "http://localhost:3000/deepphe";
const transitionDuration = 800; // time in ms

export default class DerivedChart extends React.Component {
    state = {
        data: this.props.data,
        getMinMaxAge: this.props.getMinMaxAge,
        title: false,
    };

    constructor(props) {
        super(props);
    }

    // getCohortData = () => {
    //     const that = this;
    //     fetch(baseUri + '/api/cohortData').then(response => response.json()).then(cohortData => {
    //
    //         // that.setState({data: cohortData}, () => {
    //             let patientData = that.state.data.patients;
    //             patientData.sort((a, b) => a.firstEncounterAge.localeCompare(b.firstEncounterAge));
    //             let youngest = patientData[0].firstEncounterAge;
    //             let oldest = patientData[patientData.length - 1].firstEncounterAge;
    //             patientData.sort((a, b) => a.patientId.localeCompare(b.patientId));
    //             that.setState({title: "Patients (" + patientData.length + " Patients w/ First Encounter Age Between " + youngest + " and " + oldest + ")"});
    //             that.setState({patients: patientData});
    //      //   });
    //     })
    // }

    componentDidMount() {
        //  this.getCohortData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const internalUpdate = JSON.stringify(prevProps.data.patients) != JSON.stringify(this.state.data.patients)
        //const sizeChange = prevState.width != this.state.width;
        if (internalUpdate) {
            this.setState({data: this.props.data})
            console.log("Derived Chart Changed");
            //this.getCohortData()
        }
    }

    render() {
        return (
            <React.Fragment>
                <div id="patients">
                    <Grid container direction="row" justifyContent="center" align="center" spacing={1}>
                        <Grid item xs={12} sm={12} md={3} lg={3} xl={3}>
                            <ul id="patient_list">
                        {this.props.data.patients.map(patient => (
                            <li >
                                <a id={patient.patientId} className="target_patient"
                                   href={baseGuiUri + "/./patient/" + patient.patientId}
                                   target="_blank">{patient.patientId}</a>({patient.firstEncounterAge})
                            </li>

                        ))}
                            </ul>
                        </Grid>


                    <Grid item xs={12} sm={12} md={9} lg={9} xl={9}>
                        <DiagnosisChart
                            patients={this.props.data.patients}
                            stateChanger={this.props.stateChanger}>
                        </DiagnosisChart>
                    </Grid>
                </Grid>
            </div>

                <Grid container direction="row" justifyContent="center" align="center" spacing={1}>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <BiomarkerOverview
                            patients={this.props.data.patients}
                            stateChanger={this.props.stateChanger}>
                            getMinMaxAge={this.props.getMinMaxAge}
                        </BiomarkerOverview>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                        <PatientsWithBiomarkersFound
                            data={this.props.data}
                            stateChanger={this.props.stateChanger}>
                            getMinMaxAge={this.props.getMinMaxAge}
                        </PatientsWithBiomarkersFound>
                    </Grid>
                </Grid>
            </React.Fragment>
        );

    }
}

