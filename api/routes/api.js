var express = require('express');

var router = express.Router();
var cors = require('cors')
// Use neo4j-driver to access to Neo4j
const neo4j = require('neo4j-driver').v1;

// DataProcessor class with all static methods, local module
const dataProcessor = require('../dataProcessor.js');

// Load neo4j configuration data
const neo4jConfig = require('../configs/neo4j.json');

// Neo4j queries object, local module
const neo4jFunctions = require('../neo4jFunctions.js');

// neo4j bolt driver, default bolt port is 7687
const neo4jDriver = neo4j.driver(neo4jConfig.uri, neo4j.auth.basic(neo4jConfig.username, neo4jConfig.password));

router.use(cors());

router.get('/cohortData', function (req, res) {
  const session = neo4jDriver.session(neo4j.session.READ);
  session.run(neo4jFunctions.getCohortData())
      .then(function(neo4jResult) {
        session.close();

        // 'cohortData' is the key
        // Neo4j function deepphe.getCohortData() returns a list of patient data
        let neo4jRawArr = neo4jResult.records[0].get('cohortData');

        // Convert the body into desired json data structure
        res.send(dataProcessor.getCohortData(neo4jRawArr));
      })
      .catch(function(error) {
        console.log('Failed to call the neo4j function: getCohortData()');
        console.error(error);
      });


});

router.get('/biomarkers/:patientIds', function (req, res) {

    let patientIds = req.params.patientIds.split('+');
    const session = neo4jDriver.session(neo4j.session.READ);
    let promise = session.run(neo4jFunctions.getBiomarkers(patientIds))
        .then(function(neo4jResult) {
            session.close();

            let neo4jRawArr = neo4jResult.records[0].get('biomarkers');

            // Further process the data for target chart
            let biomarkers = dataProcessor.getBiomarkers(neo4jRawArr, patientIds);

            res.send(biomarkers);
        })
        .catch(function(error) {
            console.log('Failed to call the neo4j function: getBiomarkers()');
            console.error(error);
            res.send(error);
        });



});

router.get('/diagnosis/:patientIds', function (req, res) {
    let patientIds = req.params.patientIds.split('+');
    const session = neo4jDriver.session(neo4j.session.READ);
    let promise = session.run(neo4jFunctions.getDiagnosis(patientIds))
        .then(function(neo4jResult) {
            session.close();
            let neo4jRawArr = neo4jResult.records[0].get('diagnosis');
            // Convert the body into desired json data structure
            res.send(dataProcessor.getDiagnosis(patientIds, neo4jRawArr));
        })
        .catch(function(error) {
            console.log('Failed to call the neo4j function: getDiagnosis()');
            console.error(error);
            res.send(error)
        });
});

router.get('/patient/:patientId/timeline', function (req, res) {
    let patientId = req.params.patientId;
    const session = neo4jDriver.session(neo4j.session.READ);
    let promise = session.run(neo4jFunctions.getTimelineData(patientId))
        .then(function(neo4jResult) {
            session.close();

            let neo4jRawJson = neo4jResult.records[0].get('timelineData');

            //console.log('timeline data: ' + JSON.stringify(neo4jRawJson, null, 4));
            let timelineData = dataProcessor.getTimelineData(JSON.parse(neo4jRawJson));

            res.send(timelineData);
        })
        .catch(function(error) {
            console.log('Failed to call the neo4j function: getTimelineData()');
            console.error(error);
            res.send(error);
        });



});

router.get('/patient/:patientId/cancerAndTumorSummary', function(req, res) {
    let patientId = req.params.patientId;
    const session = neo4jDriver.session(neo4j.session.READ);
    let promise = session.run(neo4jFunctions.getCancerAndTumorSummary(patientId))
        .then(function(neo4jResult) {
            session.close();

            let neo4jRawJson = neo4jResult.records[0].get('cancerAndTumorSummary');


            //console.log('timeline data: ' + JSON.stringify(neo4jRawJson, null, 4));
            neo4jRawJson = JSON.parse(neo4jRawJson);
            let cancerAndTumorSummary = dataProcessor.getCancerAndTumorSummary(neo4jRawJson.cancers);

            res.send(cancerAndTumorSummary);
        })
        .catch(function(error) {
            console.log('Failed to call the neo4j function: getCancerAndTumorSummary()');
            console.error(error);
            res.send(error);
        });



});

router.get('/reports/:reportId', function(req, res) {
    let reportId = req.params.reportId;
    const session = neo4jDriver.session(neo4j.session.READ);
    let promise = session.run(neo4jFunctions.getReport(reportId))
        .then(function(neo4jResult) {
            session.close();

            // The neo4j function returns the report text and all textMentions as a JSON directly
            let neo4jRawJson = neo4jResult.records[0].get('report');
            res.send(neo4jRawJson);
        })
        .catch(function(error) {
            console.log('Failed to call the neo4j function: getReport()');
            console.error(error);
            res.send(error);
        });
});




router.get('/fact/:patientId/:factId', function(req, res) {
    let patientId = req.params.patientId;
    let factId = req.params.factId;
    const session = neo4jDriver.session(neo4j.session.READ);
    let promise = session.run(neo4jFunctions.getFact(patientId, factId))
        .then(function(neo4jResult) {
            session.close();


            let neo4jRawJson = neo4jResult.records[0].get('fact');
           // neo4jRawJson = `{"sourceFact":{"name":"Left","prettyName":"Left","id":"fake_patient6_Left_611"},"groupedTextProvenances":{"Document_RAD_fake_patient6_doc1_RAD_53":{"docId":"Document_RAD_fake_patient6_doc1_RAD_53","terms":[{"term":"left","begin":"736","end":"740"},{"term":"left","begin":"858","end":"862"},{"term":"left","begin":"1382","end":"1386"},{"term":"left","begin":"1461","end":"1465"},{"term":"left","begin":"580","end":"584"},{"term":"left","begin":"1321","end":"1325"},{"term":"left","begin":"1028","end":"1032"},{"term":"left","begin":"751","end":"755"}],"texts":["left","left","left","left","left","left","left","left"],"textCounts":[{"text":"left","count":8}]},"Document_NOTE_fake_patient6_doc8_NOTE_50":{"docId":"Document_NOTE_fake_patient6_doc8_NOTE_50","terms":[{"term":"left","begin":"1813","end":"1817"},{"term":"left","begin":"1796","end":"1800"},{"term":"left","begin":"1955","end":"1959"}],"texts":["left","left","left"],"textCounts":[{"text":"left","count":3}]},"Document_RAD_fake_patient6_doc2_RAD_51":{"docId":"Document_RAD_fake_patient6_doc2_RAD_51","terms":[{"term":"left","begin":"501","end":"505"},{"term":"left","begin":"1306","end":"1310"},{"term":"left","begin":"1276","end":"1280"},{"term":"left","begin":"465","end":"469"}],"texts":["left","left","left","left"],"textCounts":[{"text":"left","count":4}]},"Document_SP_fake_patient6_doc3_SP_45":{"docId":"Document_SP_fake_patient6_doc3_SP_45","terms":[{"term":"left","begin":"395","end":"399"},{"term":"LEFT","begin":"727","end":"731"},{"term":"left","begin":"368","end":"372"},{"term":"LEFT","begin":"564","end":"568"}],"texts":["left","LEFT","left","LEFT"],"textCounts":[{"text":"left","count":2},{"text":"LEFT","count":2}]},"Document_SP_fake_patient6_doc7_SP_46":{"docId":"Document_SP_fake_patient6_doc7_SP_46","terms":[{"term":"LEFT","begin":"696","end":"700"},{"term":"LEFT","begin":"801","end":"805"},{"term":"LEFT","begin":"561","end":"565"},{"term":"left","begin":"385","end":"389"}],"texts":["LEFT","LEFT","LEFT","left"],"textCounts":[{"text":"LEFT","count":3},{"text":"left","count":1}]},"Document_NOTE_#fake_patient6_doc4_NOTE_48":{"docId":"Document_NOTE_#fake_patient6_doc4_NOTE_48","terms":[{"term":"left","begin":"1771","end":"1775"},{"term":"left","begin":"1788","end":"1792"}],"texts":["left","left"],"textCounts":[{"text":"left","count":2}]},"Document_NOTE_fake_patient6_doc4_NOTE_47":{"docId":"Document_NOTE_fake_patient6_doc4_NOTE_47","terms":[{"term":"left","begin":"1768","end":"1772"},{"term":"left","begin":"1785","end":"1789"}],"texts":["left","left"],"textCounts":[{"text":"left","count":2}]},"Document_NOTE_fake_patient6_doc5_NOTE_49":{"docId":"Document_NOTE_fake_patient6_doc5_NOTE_49","terms":[{"term":"left","begin":"1645","end":"1649"},{"term":"left","begin":"1662","end":"1666"}],"texts":["left","left"],"textCounts":[{"text":"left","count":2}]},"Document_NOTE_fake_patient6_doc6_NOTE_52":{"docId":"Document_NOTE_fake_patient6_doc6_NOTE_52","terms":[{"term":"left","begin":"1853","end":"1857"},{"term":"left","begin":"1870","end":"1874"},{"term":"left","begin":"2024","end":"2028"},{"term":"left","begin":"1997","end":"2001"}],"texts":["left","left","left","left"],"textCounts":[{"text":"left","count":4}]}}}`;
            neo4jRawJson = JSON.parse(neo4jRawJson);
            let factJson = dataProcessor.getFact(neo4jRawJson);

            res.send(factJson);
        })
        .catch(function(error) {
            console.log('Failed to call the neo4j function: getFact()');
            console.error(error);
            res.send(error);
        });
});

module.exports = router;
