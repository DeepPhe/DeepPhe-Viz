// User Defined Neo4j Functions
// Functions are simple computations / conversions and return a single value
// let neo4jFunctions;
// neo4jFunctions = {

/////////////////////////////////////////////////////////////////////////////////////////
//
//                            COHORT DATA
//
////////////////////////////////////////////////////////////////////////////////////////

// The neo4j function deepphe.getCohortData() returns a list of patient data
const getCohortData = () => {
    return 'return deepphe.getCohortData() AS cohortData';
}


// The neo4j function deepphe.getDiagnosis() returns a list of diagnosis per patient
const getDiagnosis = (patientIds) => {
    return "return deepphe.getDiagnosis(['" + patientIds.join("','") + "']) AS diagnosis";
}

// The neo4j function deepphe.getBiomarkers() returns a list of biomarkers information
const getBiomarkers = (patientIds) => {
    return "return deepphe.getBiomarkers(['" + patientIds.join("','") + "']) AS biomarkers";
}


/////////////////////////////////////////////////////////////////////////////////////////
//
//                            INDIVIDUAL PATIENT DATA
//
/////////////////////////////////////////////////////////////////////////////////////////

// The neo4j function deepphe.getPatientInfo() returns the patient properties as a JSON directly
const getPatientInfo = function (patientId) {
    return "return deepphe.getPatientInfo('" + patientId + "') AS patientInfo";
}

// The neo4j function deepphe.getCancerAndTumorSummary() returns a list
const getCancerAndTumorSummary = (patientId) => {
    return "return deepphe.getCancerAndTumorSummary('" + patientId + "') AS cancerAndTumorSummary";
}

// The neo4j function deepphe.getTimelineData() returns the patient information adn a list of all the reports
const getTimelineData = (patientId) => {
    return "return deepphe.getTimelineData('" + patientId + "') AS timelineData";
}

// The neo4j function deepphe.getReport() returns the report text and all text mentions as a JSON directly
const getReport = (reportId) => {
    return "return deepphe.getReport('" + reportId + "') AS report";
}

// The neo4j function deepphe.getFact() returns the fact and all text mentions as a JSON directly
const getFact = (patientId, factId) => {
    return "return deepphe.getFact('" + patientId + "', '" + factId + "') AS fact";
}

// The neo4j function deepphe.getFact() returns the fact and all text mentions as a JSON directly
const getSynonymsForTerm = (term) => {
    return "return deepphe.getSynonymsForTerm('" + term + "')";
}

/////////////////////////////////////////////////////////////////////////////////////////
//
//                            API ONLY
//
/////////////////////////////////////////////////////////////////////////////////////////
// The neo4j function deepphe.getAllPatients() returns a list of patient nodes
const getAllPatients = () => {
    return 'return deepphe.getAllPatients() AS allPatients';
}

// };

/**
 * Expose the neo4jFunctions class as a local module
 */
module.exports.getCohortData = getCohortData
module.exports.getBiomarkers = getBiomarkers
module.exports.getDiagnosis = getDiagnosis
module.exports.getPatientInfo = getPatientInfo
module.exports.getCancerAndTumorSummary = getCancerAndTumorSummary
module.exports.getTimelineData = getTimelineData
module.exports.getReport = getReport
module.exports.getFact = getFact
module.exports.getAllPatients = getAllPatients
module.exports.getSynonymsForTerm = getSynonymsForTerm


