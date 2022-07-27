import React from "react";
//mport {makeStyles} from "@material-ui/core/styles";

import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";

import CardBody from "components/Card/CardBody.js";
import {Col, Container, Nav, Navbar, Row} from "react-bootstrap";
//import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import PatientCountPerStageChart from "../../components/Charts/PatientCountPerStageChart";
import PatientFirstEncounterAgePerStageChart from "../../components/Charts/PatientFirstEncounterAgePerStageChart";
import DerivedChart from "../../components/Charts/DerivedChart";
import Grid from "@material-ui/core/Grid";

//const useStyles = makeStyles(styles);

export default function Dashboard() {
    return (
        <span>
        <Navbar className={"mainNavBar"}>
            <Container>
                <Navbar.Brand className={"mainNavBar"} href="#home">DeepPhe Visualizer<span
                    style={{"fontSize": '20px'}}> v2.0.0.0</span></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="justify-content-end" style={{width: "100%"}}>

                       <Nav.Link className={"navItem"} target="_blank"
                                 href="https://deepphe.github.io/">About</Nav.Link>
                        <Nav.Link className={"navItem"} target="_blank"
                                  href="https://github.com/DeepPhe/">GitHub</Nav.Link>


                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
            <Grid container direction="row" justifyContent="center" align="center" spacing={10} >
                {/*<Grid item xs={1} sm={1} md={1} xl={0}/>*/}
                <Grid item xs={10} sm={10} md={7} lg={5} xl={4}>
                    <Card>
                        <CardHeader className={'basicCardHeader'}>Set Corpus by Age Criteria</CardHeader>
                        <CardBody>
                            <PatientFirstEncounterAgePerStageChart docId={"pfe-chart"}/>
                        </CardBody>
                    </Card>
                </Grid>
                <Grid item xs={10} sm={10} md={7} lg={5} xl={4}>
                    <Card>
                        <CardHeader className={'basicCardHeader'}>Cases Matching Inclusion Criteria</CardHeader>
                        <CardBody>
                            <PatientCountPerStageChart docId={"pcps-chart"}/>
                        </CardBody>
                    </Card>
                </Grid>
            </Grid>

              <Grid container direction="row" justifyContent="center" align="center" spacing={10} >

                <Grid item xs={12} sm={12} md={10} xl={8}>
                            <DerivedChart>
                            </DerivedChart>
                </Grid>
               =
              </Grid>

        <div className={"mainFooter"}>
            <Row>
                <Col md={1}></Col>
                <Col md={4}>Supported by the <a target="_blank" rel="noopener noreferrer" href="https://itcr.cancer.gov/">National Cancer Institute's Information Technology for Cancer Research</a> initiative. (Grant #U24CA248010)</Col>
                <Col md={1}></Col>
                <Col md={5}>©2022 Harvard Medical School, University of Pittsburgh, and Vanderbilt University Medical Center.</Col>
               <Col md={1}></Col>
            </Row>
        </div>
        </span>
)}
