import React, {useEffect, useRef, useState} from "react";
import { useParams } from "react-router-dom";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CustomTable from "../../components/CustomTables/CustomTable";
import CancerAndTumorSummary from "../../components/Summaries/CancerAndTumorSummary";
import Timeline from "../../components/Charts/Timeline";
import TimelineEventsNew from "../../components/Charts/TimelineEventsNew"
import CardHeader from "../../components/Card/CardHeader";
import { Col, Container, Nav, Navbar, Row } from "react-bootstrap";
import { DocumentViewer } from "../../components/DocumentViewer/DocumentViewer";
import { isEmpty } from "../../utils/JsObjectHelper";
import { setEventHandlers } from "./patientEventHandlers";
import { factBasedReports } from "./FactUtils";

function Patient(props) {
  const { patientId } = useParams();
  const [summary, setSummary] = useState({});
  const [patientDocument, setPatientDocument] = useState({});
  const [patientJson, setPatientJson] = useState({});
  const [reportId, setReportId] = useState("");
  const [factId, setFactId] = useState({});
  const [gettingSummary, setGettingSummary] = useState(false);
  const [currDoc, setCurrDoc] = useState(0);
  const [clickedTerms, setClickedTerms] = useState([]); // Initial state set to empty array
  const [processingDone, setProcessingDone] = useState(false);

  const conceptsPerDocumentRef = useRef({});

  useEffect(() => {
    if (!patientJson?.documents?.length) return;

    const map = {};

    patientJson.documents.forEach((doc) => {
      const mentionIdsInDoc = doc.mentions.map((m) => m.id);
      const conceptsInDoc = patientJson.concepts.filter((concept) =>
          concept.mentionIds?.some((id) => mentionIdsInDoc.includes(id))
      );
      map[`main_${doc.name}`] = conceptsInDoc;
    });

    conceptsPerDocumentRef.current = map;
    setProcessingDone(true);
  }, [patientJson]);

  useEffect(() => {
    if (!patientJson?.documents?.length) return;
    const safeDocIndex = Math.max(0, Math.min(currDoc, patientJson.documents.length - 1));
    setPatientDocument(patientJson.documents[safeDocIndex]);
  }, [currDoc, patientJson]);

  function getNewPatientJsonFromFile() {
    return new Promise((resolve, reject) => {
      fetch("../../../docs/fake_patient1.json").then((v) => {
        v.json().then((json) => {
          resolve(json);
        });
      });
    });
  }

  // function appendDocIdAndMentionId() {
  //   console.log("hello" + conceptsPerDocumentRef);
  // }

  function getSummary(patientId) {
    return fetch(
      "http://localhost:3001/api/patient/" +
        patientId +
        "/cancerAndTumorSummary"
    );
  }

  const getComponentPatientEpisodeTimeline = () => {
    return (
      <Card>
        {/*<CardHeader className={"basicCardHeader"}>*/}
        {/*  Patient Episode Timeline*/}
        {/*</CardHeader>*/}
        <CardBody>
          {patientJson && Object.keys(patientJson).length > 0 ? (
          <Timeline
              svgContainerId="timeline1"
              reportId={reportId}
              patientJson={patientJson}
              patientId={patientId}
              setReportId={setReportId}
              setCurrDoc={setCurrDoc}
              //getReport={getReport}
          ></Timeline>
          ) : (
              <div>Loading timeline...</div>
          )}

        </CardBody>
      </Card>
    );
  };

  const getComponentPatientEpisodeTimelineEventsNew= () => {
    return (
        <Card>
          {/*<CardHeader className={"basicCardHeader"}>*/}
          {/*  Temporal Events*/}
          {/*</CardHeader>*/}
          <CardBody>
            <TimelineEventsNew
                setClickedTerms={setClickedTerms}
                clickedTerms={clickedTerms}
                svgContainerId="timeline2"
                reportId={reportId}
                patientJson={patientJson}
                patientId={patientId}
                setReportId={setReportId}
                conceptsPerDocument={conceptsPerDocumentRef.current}
                //getReport={getReport}
            ></TimelineEventsNew>
          </CardBody>
        </Card>
    );
  };





  const getComponentPatientIdAndDemographics = () => {
    return (
      <Card style={{ marginTop: "45px" }}>
        <CardHeader className={"basicCardHeader"}>
          Patient ID and Demographics
        </CardHeader>
        <CardBody>
          <CustomTable></CustomTable>
        </CardBody>
      </Card>
    );
  };
  const getComponentFooter = () => {
    return (
      <React.Fragment>
        <div className={"mainFooter"}>
          <Row>
            <Col md={1}></Col>
            <Col md={4}>
              Supported by the{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://itcr.cancer.gov/"
              >
                National Cancer Institute's Information Technology for Cancer
                Research
              </a>{" "}
              initiative. (Grant #U24CA248010)
            </Col>
            <Col md={1}></Col>
            <Col md={5}>
              ©2021 Harvard Medical School, University of Pittsburgh, and
              Vanderbilt University Medical Center.
            </Col>
            <Col md={1}></Col>
          </Row>
        </div>
      </React.Fragment>
    );
  };

  const getComponentDocumentViewer = () => {

    if (!patientDocument || !patientJson?.concepts?.length) {
      return <div> Loading... </div>;
    }
    const mentionIdsInDocument = patientDocument?.mentions?.map((m) => m.id) || [];
    const conceptsInDocument = patientJson.concepts.filter((c) =>
        c.mentionIds?.some((m) => mentionIdsInDocument.includes(m))
    );

    if (isEmpty(reportId) || !patientDocument?.mentions) {
      return <div> Loading... </div>;
    }

    return (
        <DocumentViewer
            patientId={patientId}
            reportId={reportId}
            factId={factId}
            factBasedReports={factBasedReports}
            patientDocument={patientDocument}
            concepts={conceptsInDocument}
            clickedTerms={clickedTerms}
            setClickedTerms={setClickedTerms}
        ></DocumentViewer>
    );
  };

  const getComponentCancerAndTumorDetail = () => {
    return (
      <React.Fragment>
        <Card>
          <CardHeader className={"basicCardHeader"}>
            Cancer and Tumor Detail
          </CardHeader>
          <CardBody>
            <div id="summary">
              <CancerAndTumorSummary cancers={summary}></CancerAndTumorSummary>
            </div>
          </CardBody>
        </Card>
      </React.Fragment>
    );
  };

  const getComponentNavBar = () => {
    return (
      <Navbar className={"mainNavBar"}>
        <Container>
          <Navbar.Brand className={"mainNavBar"} href="/">
            DeepPhe Visualizer
            <span style={{ fontSize: "20px" }}> v2.0.0.0</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="justify-content-end" style={{ width: "100%" }}>
              <Nav.Link
                className={"navItem"}
                target="_blank"
                rel="noopener noreferrer"
                href="https://deepphe.github.io/"
              >
                About
              </Nav.Link>
              <Nav.Link
                className={"navItem"}
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/DeepPhe/"
              >
                GitHub
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  };

  useEffect(() => {
    if (patientId) {
      setEventHandlers(patientId);
    }
  }, [patientId]);


  useEffect(() => {
    if (summary.length && patientId) {
      getNewPatientJsonFromFile().then((json) => {
        if (!json || Object.keys(json).length === 0) {
          console.warn("Empty or invalid patientJson received!");
        }
        setPatientJson(json);
      });
    }
  }, [summary, patientId]);





  if (isEmpty(summary)) {
    if (!gettingSummary) {
      setGettingSummary(true);
      getSummary(patientId).then((response) =>
          response.json().then((json) => {
            setSummary(json);
            setGettingSummary(false); // optional, useful if you want to reset
          })
      );
    }
    return <div> Loading... </div>;
  }

  return (
      <React.Fragment>
        {getComponentNavBar()}
        <GridContainer>
          <GridItem xs={12} sm={12} md={1}/>
          <GridItem xs={12} sm={12} md={10}>
            {getComponentPatientIdAndDemographics()}
            {getComponentCancerAndTumorDetail()}
            {getComponentPatientEpisodeTimeline()}
            {getComponentPatientEpisodeTimelineEventsNew()}
            {getComponentDocumentViewer()}
          </GridItem>
          <GridItem xs={12} sm={12} md={1}/>
        </GridContainer>
        {getComponentFooter()}
      </React.Fragment>
  );
}

export default Patient;
