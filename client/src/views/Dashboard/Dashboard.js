import React from "react";
// react plugin for creating charts
//import ChartistGraph from "react-chartist";
// @material-ui/core
import {makeStyles} from "@material-ui/core/styles";
//import Icon from "@material-ui/core/Icon";
// @material-ui/icons
//import Store from "@material-ui/icons/Store";
// import Warning from "@material-ui/icons/Warning";
// import DateRange from "@material-ui/icons/DateRange";
// import LocalOffer from "@material-ui/icons/LocalOffer";
// import Update from "@material-ui/icons/Update";
// import ArrowUpward from "@material-ui/icons/ArrowUpward";
import AccessTime from "@material-ui/icons/AccessTime";
// import Accessibility from "@material-ui/icons/Accessibility";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Tasks from "components/Tasks/Tasks.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
//import Danger from "components/Typography/Danger.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
//import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import {Col, Nav, Navbar, NavDropdown, NavItem, Row} from "react-bootstrap";
import {Container} from "react-bootstrap";
import CardFooter from "components/Card/CardFooter.js";

import {bugs, website, server} from "variables/general.js";
//
// import {
//   dailySalesChart,
//   emailsSubscriptionChart,
//   completedTasksChart
// } from "variables/charts.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import PatientCountPerStageChart from "../../components/Charts/PatientCountPerStageChart";
import PatientFirstEncounterAgePerStageChart from "../../components/Charts/PatientFirstEncounterAgePerStageChart";
import DerivedChart from "../../components/Charts/DerivedChart";
import Footer from "../../components/Footer/Footer";
import {AppBar, Typography} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";

const useStyles = makeStyles(styles);

export default function Dashboard() {
    const classes = useStyles();

    return (<span>
        <Navbar className={"mainNavBar"}>
            <Container>
                <Navbar.Brand className={"mainNavBar"} href="#home">DeepPhe Visualizer<span style={{"font-size":'20px'}}> v2.0.0.0</span></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" >
                    <Nav className="justify-content-end" style={{ width: "100%" }}>

                       <Nav.Link className={"navItem"} target="_blank" href="https://deepphe.github.io/jekyll-website/">About</Nav.Link>
                        <Nav.Link className={"navItem"} target="_blank" href="https://github.com/DeepPhe/">GitHub</Nav.Link>

                    {/*    <Nav.Link href="#link">Link</Nav.Link>*/}
                    {/*    <NavDropdown title="Dropdown" id="basic-nav-dropdown">*/}
                    {/*        <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>*/}
                    {/*        <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>*/}
                    {/*        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>*/}
                    {/*        <NavDropdown.Divider />*/}
                    {/*        <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>*/}
                    {/*    </NavDropdown>*/}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>

        <div className="justify-content-center" >

            <GridContainer style={{marginTop:"14px"}} spacing={2} >
                <GridItem xs={12} sm={12} md={2}/>
                <GridItem xs={12} sm={12} md={4}>
                    <Card>
                        <CardHeader className={'basicCardHeader'}>Set Corpus by Age Criteria</CardHeader>
                        <CardBody>
                            <PatientFirstEncounterAgePerStageChart id="john"></PatientFirstEncounterAgePerStageChart>
                        </CardBody>
                    </Card>
                </GridItem>
                <GridItem xs={12} sm={12} md={4}>
                    <Card>
                        <CardHeader className={'basicCardHeader'}>Cases Matching Inclusion Criteria</CardHeader>
                        {/*<CardHeader color="warning">*/}
                        {/*  <ChartistGraph*/}
                        {/*    className="ct-chart"*/}
                        {/*    data={emailsSubscriptionChart.data}*/}
                        {/*    type="Bar"*/}
                        {/*    options={emailsSubscriptionChart.options}*/}
                        {/*    responsiveOptions={emailsSubscriptionChart.responsiveOptions}*/}
                        {/*    listener={emailsSubscriptionChart.animation}*/}
                        {/*  />*/}
                        {/*</CardHeader>*/}
                        <CardBody>
                            <PatientCountPerStageChart id="john"></PatientCountPerStageChart>

                            {/*<h4 className={classes.cardTitle}>Email Subscriptions</h4>*/}
                            {/*<p className={classes.cardCategory}>Last Campaign Performance</p>*/}
                        </CardBody>
                        {/*<CardFooter chart>*/}
                        {/*  <div className={classes.stats}>*/}
                        {/*    <AccessTime /> campaign sent 2 days ago*/}
                        {/*  </div>*/}
                        {/*</CardFooter>*/}
                    </Card>
                </GridItem>
            </GridContainer>

            <GridContainer>
                <GridItem xs={12} sm={12} md={2}/>
                <GridItem xs={12} sm={12} md={8}>

                            <DerivedChart>
                            </DerivedChart>

                </GridItem>
                <GridItem xs={12} sm={12} md={2}/>
            </GridContainer>
        </div>

        <div className={"mainFooter"}>

                {/*<Navbar.Brand className={"mainFooter"} href="#home"><div>© 2021</div><span style={{"font-size":'12px'}}>Harvard Medical School, University of Pittsburgh, and Vanderbilt University Medical Center</span></Navbar.Brand>*/}
                {/*<Navbar.Toggle aria-controls="basic-navbar-nav" />*/}
                {/*<Navbar.Collapse id="basic-navbar-nav">*/}
                {/*    <Nav className="me-auto" style={{'float':'right'}}>
                */}
            <Row>
                <Col md={1}></Col>
                <Col md={4}>Supported by the <a target="_blank" href="https://itcr.cancer.gov/">National Cancer Institute's Information Technology for Cancer Research</a> initiative. (Grant #U24CA248010)</Col>
                <Col md={1}></Col>
                <Col md={5}>©2021 Harvard Medical School, University of Pittsburgh, and Vanderbilt University Medical Center.</Col>
               <Col md={1}></Col>
            </Row>



        </div>
        </span>

    );
}
