/**
 * Module dependencies.
 */

// Load the full build of lodash
// Differences between core build and full build: https://github.com/lodash/lodash/wiki/Build-Differences
const _ = require('lodash');

// For writing debugging JSON into file
//const fs = require('fs');
//
// // Add methods to DataProcessor.prototype
// export class DataProcessor {
//
//     /////////////////////////////////////////////////////////////////////////////////////////
//     //
//     //                            COHORT
//     //
//     ////////////////////////////////////////////////////////////////////////////////////////

const getCohortData = (neo4jRawArr) => {
    neo4jRawArr = JSON.parse(neo4jRawArr)
    let self = this;
    let stagesJson = {};
    stagesJson.stagesInfo = [];
    // Sort uniquePatientsArr by patient age of first encounter
    stagesJson.patients = _.sortBy(neo4jRawArr, 'firstEncounterAge');
    // Get all unique stages
    let uniqueStages = [];

    for (let i = 0; i < neo4jRawArr.length; i++) {
        let stagesArr = neo4jRawArr[i].stages.forEach(function (stage) {
            let stageName = getShortStageName(stage);
            stageName = getRomanNumeralStageName(stageName)
            // Any shortStageName that is not in the order list, will be ignored.
            if (getOrderedCancerStages().indexOf(stageName) !== -1 && uniqueStages.indexOf(stageName) === -1) {
                uniqueStages.push(stageName);
            }
        });
    }

    // Sort the uniqueCancerFactRelnArr by the item's index in the order array
    let sortedUniqueStages = sortByProvidedOrder(uniqueStages, getOrderedCancerStages());

    // Aggregate patients of each stage
    let stagesInfo = [];
    sortedUniqueStages.forEach(function (stage) {
        let obj = {};
        obj.stage = stage;
        obj.patients = [];
        obj.ages = [];

        const topLevelStages = {
            'Stage 0': ['Stage 0'],
            'Stage I': ['Stage I', 'Stage IA', 'Stage IB', 'Stage IC'],
            'Stage II': ['Stage II', 'Stage IIA', 'Stage IIB', 'Stage IIC'],
            'Stage III': ['Stage III', 'Stage IIIA', 'Stage IIIB', 'Stage IIIC'],
            'Stage IV': ['Stage IV', 'Stage IVA', 'Stage IVB', 'Stage IVC'],
            'Stage Unknown': ['Stage Unknown']
        };


        let FOUND_STAGE = false;
        Object.keys(topLevelStages).forEach(function (topLevelStage) {
            if (topLevelStages[topLevelStage].indexOf(stage) !== -1) {
                FOUND_STAGE = true;
                for (let i = 0; i < neo4jRawArr.length; i++) {
                    let patient = neo4jRawArr[i];
                    patient.stages.forEach(function (s) {
                        let stageName = getShortStageName(s);
                        stageName = getRomanNumeralStageName(stageName);
                        // Use lodash's _.findIndex() instead of the native indexOf() to avoid duplicates


                        if ((topLevelStages[topLevelStage].indexOf(stageName) !== -1) &&
                            (_.findIndex(obj.patients, patient) === -1)) {
                            obj.patients.push(patient);
                        }
                    });
                }
            }
        });
        if (!FOUND_STAGE) {
            for (let i = 0; i < neo4jRawArr.length; i++) {
                let patient = neo4jRawArr[i];
                patient.stages.forEach(function (s) {
                    let shortStageName = getShortStageName(s);

                    if ((shortStageName === stage) && (_.findIndex(obj.patients, patient) === -1)) {
                        obj.patients.push(patient);
                    }
                });
            }
        }


        obj.patientsCount = obj.patients.length;

        // Add age of first encounter to the ages array for rendering box plot charts
        obj.patients.forEach(function (patient) {
            obj.ages.push(patient.firstEncounterAge);
        });

        stagesInfo.push(obj);
    });

    // Sort the stages by patients count in ascending order
    //stagesJson.stagesInfo = _.sortBy(stagesInfo, 'patientsCount');
    stagesJson.stagesInfo = stagesInfo;

    // Return the JSON object
    return stagesJson;
};

const getDiagnosis = (patientIds, neo4jRawArr) => {
    neo4jRawArr = JSON.parse(neo4jRawArr);
    let self = this;
    let diagnosisInfo = {};
    diagnosisInfo.patients = {};
    diagnosisInfo.diagnosisGroups = [];
    diagnosisInfo.data = [];

    let uniqueDiagnosisGroupsArr = [];

    // Build an array of unique diagnosis
    for (let i = 0; i < neo4jRawArr.length; i++) {
        neo4jRawArr[i].diagnosis.forEach(function (diagGrp) {
            if (uniqueDiagnosisGroupsArr.indexOf(diagGrp) === -1) {
                uniqueDiagnosisGroupsArr.push(diagGrp);
            }
        });
    }

    // Added sorting for diaplay consistency when switching between stages
    diagnosisInfo.diagnosisGroups = uniqueDiagnosisGroupsArr.sort();

    patientIds.forEach(function (pid) {
        let obj = {};
        obj.patient = pid;
        obj.diagnosisGroups = [];

        for (let i = 0; i < neo4jRawArr.length; i++) {
            neo4jRawArr[i].diagnosis.forEach(function (diagGrp) {
                if (neo4jRawArr[i].patientId === pid && obj.diagnosisGroups.indexOf(diagGrp) === -1) {
                    //this should get called!?!
                    obj.diagnosisGroups.push(diagGrp);
                }
            });
        }

        diagnosisInfo.data.push(obj);

        // Also add to the diagnosisInfo.patients object
        if (typeof diagnosisInfo.patients[pid] === "undefined") {
            diagnosisInfo.patients[pid] = obj.diagnosisGroups;
        }
    });

    return diagnosisInfo;
}

const getBiomarkers = (neo4jRawArr, patientIds) => {
    let info = {};
    info.biomarkersOverviewData = [];
    info.biomarkerStatsPerPatient = [];
    info.patientsWithBiomarkersData = {};
    info.patientsWithBiomarkersData.biomarkersPool = ["ER_", "PR_", "HER2"];
    info.patientsWithBiomarkersData.biomarkerStatus = ['positive', 'negative', 'unknown'];
    info.patientsWithBiomarkersData.data = [];

    let patientsWithBiomarkers = [];
    let patientsWithoutBiomarkers = [];

    let biomarkersData = {};

    // Initialize the biomarker statistics data
    info.patientsWithBiomarkersData.biomarkersPool.forEach(function (biomarker) {
        let obj = {};
        obj.positive = [];
        obj.negative = [];
        obj.unknown = [];

        biomarkersData[biomarker] = obj;
    });


    let jsonData = JSON.parse(neo4jRawArr)
    let uniquePatients = [...new Set(jsonData.map((d) => (d.patientId)))];
    let biomarkerStatsPerPatient = [];
    uniquePatients.forEach((d) => {
        const stats = {
            relationValueArray: [],
            patientId: d,
        }
        biomarkerStatsPerPatient.push(stats);
    })

    // Initialize the biomarker statistics dat
    jsonData.forEach(function (obj) {
        const person = biomarkerStatsPerPatient[
            biomarkerStatsPerPatient.findIndex((d) => {
            return d.patientId === obj.patientId
        })];
        person.relationValueArray.push([obj.tumorFactRelation, obj.valueText]);

        // Count patients with biomarkers
        if (patientsWithBiomarkers.indexOf(obj.patientId) === -1) {
            patientsWithBiomarkers.push(obj.patientId);
        }

        // Skip the case when there's no "valueText" property

        if ((typeof obj.valueText != "undefined") && ((obj.valueText === "positive") || (obj.valueText === "negative") || (obj.valueText === "unknown"))) {
            let status = obj.valueText.toLowerCase();
            if (biomarkersData[obj.tumorFactRelation][status].indexOf(obj.patientId) === -1) {
                biomarkersData[obj.tumorFactRelation][status].push(obj.patientId);
            }
        }
    });
    info.biomarkerStatsPerPatient = biomarkerStatsPerPatient;

    // Patients without biomarkers
    patientIds.forEach(function (id) {
        if (patientsWithBiomarkers.indexOf(id) === -1) {
            patientsWithoutBiomarkers.push(id);
        }
    });

    // Further process to meet the needs of front end rendering
    info.patientsWithBiomarkersData.biomarkersPool.forEach(function (biomarker) {
        let obj = {};
        obj.biomarker = biomarker;
        obj.positive = 0;
        obj.negative = 0;
        obj.unknown = 0;

        let totalCount = biomarkersData[biomarker].positive.length + biomarkersData[biomarker].negative.length + biomarkersData[biomarker].unknown.length;

        // Calculate percentage, decimals without % sign
        if (totalCount > 0) {
            obj.positive = parseFloat(biomarkersData[biomarker].positive.length / totalCount).toFixed(3);
            obj.negative = parseFloat(biomarkersData[biomarker].negative.length / totalCount).toFixed(3);
            obj.unknown = parseFloat(biomarkersData[biomarker].unknown.length / totalCount).toFixed(3);
        }

        info.patientsWithBiomarkersData.data.push(obj);
    });

    // For biomarkers patients chart
    let patientsWithBiomarkersObj = {};
    patientsWithBiomarkersObj.label = "Patients with biomarkers found";
    patientsWithBiomarkersObj.count = parseFloat(patientsWithBiomarkers.length / patientIds.length).toFixed(3);

    let patientsWithoutBiomarkersObj = {};
    patientsWithoutBiomarkersObj.label = "Patients without biomarkers found";
    patientsWithoutBiomarkersObj.count = parseFloat(patientsWithoutBiomarkers.length / patientIds.length).toFixed(3);

    info.biomarkersOverviewData.push(patientsWithBiomarkersObj);
    info.biomarkersOverviewData.push(patientsWithoutBiomarkersObj);

    return info;
};
//
//     /////////////////////////////////////////////////////////////////////////////////////////
//     //
//     //                            INDIVIDUAL PATIENT
//     //
//     ////////////////////////////////////////////////////////////////////////////////////////
//
const getPatientInfo = (neo4jRawJson) => {
    let patientInfo = {};
    let patientObj = neo4jRawJson;

    patientInfo.id = patientObj.patientId;
    patientInfo.name = patientObj.patientName;
    patientInfo.firstEncounterAge = patientObj.firstEncounterAge;
    patientInfo.lastEncounterAge = patientObj.lastEncounterAge;

    return patientInfo;
}

// A patient may have multiple cancers
const getCancerAndTumorSummary = (neo4jRawArr) => {
    let self = this;
    let cancers = [];
    let uniqueCancerIds = [];

    for (let i = 0; i < neo4jRawArr.length; i++) {
        if (uniqueCancerIds.indexOf(neo4jRawArr[i].cancerId) === -1) {
            uniqueCancerIds.push(neo4jRawArr[i].cancerId);
        }
    }

    // Assemble cancerSummary for each cancer
    uniqueCancerIds.forEach(function (cancerId) {
        let cancerSummary = {};

        // Basically the values of hasDiagnosis, hasBodySite and hasLaterality if one exists
        // E.g., "Invasive Ductal Carcinoma, Breast (Left)"
        // Use cancerId for now
        cancerSummary.cancerId = cancerId;
        cancerSummary.title = cancerId;

        // TNM array
        cancerSummary.tnm = [];

        // Tumors object
        cancerSummary.tumors = {};

        // Build an arry of unique cancerFactReln
        let uniqueCancerFactRelnArr = [];

        // For later retrival use
        let relationPrettyNameMap = new Map();

        for (let i = 0; i < neo4jRawArr.length; i++) {
            if (neo4jRawArr[i].cancerId === cancerId) {
                let cancerFacts = neo4jRawArr[i].cancerFacts;

                cancerFacts.forEach(function (cancerFact) {
                    let relation = cancerFact.relation;
                    let relationPrettyName = cancerFact.relationPrettyName;

                    // First compose a meaningful title for this cancer summary
                    // Basically the values of hasDiagnosis, hasBodySite and hasLaterality if one exists

                    // Skip the body site, it's in the tumor summary
                    // Don't show Diagnosis, Tumor Extent, and TNM Prefix in cancer summary
                    let excludedRelations = [
                        "hasBodySite",
                        "hasDiagnosis",
                        "hasTumorExtent"
                    ];

                    if (uniqueCancerFactRelnArr.indexOf(relation) === -1 && excludedRelations.indexOf(relation) === -1) {
                        // Histological type could be interesting - but not needed for breast cancer
                        // Need to filter here?
                        uniqueCancerFactRelnArr.push(relation);

                        // Also add to the relationPrettyName mapping
                        relationPrettyNameMap.set(relation, relationPrettyName);
                    }
                });
            }
        }

        // Sort this uniqueCancerFactRelnArr in a specific order
        // categories not in this order will be listed at the bottom
        // based on their original order
        const order = [
            'hasCancerStage',
            'hasTreatment'
        ];

        // Sort the uniqueCancerFactRelnArr by the item's index in the order array
        let sortedUniqueCancerFactRelnArr = self.sortByProvidedOrder(uniqueCancerFactRelnArr, order);

        // Build new data structure
        // This is similar to what getCollatedFacts() does,
        // except it only handles one cancer ID.
        let allCollatedCancerFacts = [];

        for (let j = 0; j < sortedUniqueCancerFactRelnArr.length; j++) {
            let collatedCancerFactObj = {};

            // The name of category
            collatedCancerFactObj.category = sortedUniqueCancerFactRelnArr[j];
            collatedCancerFactObj.categoryName = titleCase(relationPrettyNameMap.get(sortedUniqueCancerFactRelnArr[j]));


            // Array of facts of this category
            collatedCancerFactObj.facts = [];

            let factsArr = [];

            // Loop through the origional data
            for (let k = 0; k < neo4jRawArr.length; k++) {
                if (neo4jRawArr[k].cancerId === cancerId) {
                    neo4jRawArr[k].cancerFacts.forEach(function (cancerFact) {
                        let cancerFactReln = cancerFact.relation;

                        let factObj = {};
                        factObj.id = cancerFact.cancerFactInfo.id;
                        factObj.name = cancerFact.relationPrettyName;
                        factObj.prettyName = cancerFact.cancerFactInfo.prettyName;
                        factObj.value = cancerFact.cancerFactInfo.value;


                        if (factObj.id == undefined || factObj.name == undefined || factObj.prettyName == undefined || factObj.value == undefined) {
                            console.log("error reading cancer facts")
                        } else {
                            // Add to facts array
                            // Filter out Treatment facts that start with "Other" or "pharmacotherapeutic", they are not helpful to show
                            if (cancerFactReln === collatedCancerFactObj.category && !factObj.prettyName.startsWith("Other") && !factObj.prettyName.startsWith("pharmacotherapeutic")) {
                                factsArr.push(factObj);
                            }
                        }
                    });
                }
            }

            // Array of facts of this category
            // Remove duplicates using lodash's _.uniqWith() then sort by the alphabetical order of 'prettyName'
            collatedCancerFactObj.facts = _.sortBy(_.uniqWith(factsArr, _.isEqual), ['name']);

            // Add collatedFactObj to allCollatedFacts only when the facts array is not empty after all the above filtering
            // E.g., treatment facts can be an empty array if the treatements are OtherTherapeuticProcedure and OtherMedication
            // since they'll get filtered out
            if (collatedCancerFactObj.facts.length > 0) {
                allCollatedCancerFacts.push(collatedCancerFactObj);
            }
        }
        allCollatedCancerFacts = allCollatedCancerFacts.sort(function (a, b) {
            const nameA = a.category;
            const nameB = b.category;
            if (nameA > nameB) return 1;
            if (nameA < nameB) return -1;
            return 0;
        });

        // Will use this to build TNM staging table
        const tnmClassifications = {
            "clinical": [
                'has_Clinical_T',
                'has_Clinical_N',
                'has_Clinical_M',
                "T",
                "N",
                "M",
                "t",
                "n",
                "m"
            ],
            "pathologic": [
                'has_Pathologic_T',
                'has_Pathologic_N',
                'has_Pathologic_M'
            ]
        };

        // Hard code type names
        // Use "Unspecified" as the title of Generic TNM
        let clinicalTNM = buildTNM(allCollatedCancerFacts, "Clinical", tnmClassifications.clinical);
        let pathologicTNM = buildTNM(allCollatedCancerFacts, "Pathologic", tnmClassifications.pathologic);

        // Add to cancerSummary.tnm if has data
        if (clinicalTNM.data.length > 0 || clinicalTNM.data.T.length > 0 || clinicalTNM.data.N.length > 0 || clinicalTNM.data.M.length > 0) {
            cancerSummary.tnm.push(clinicalTNM);
        }

        if (pathologicTNM.data.length > 0 || pathologicTNM.data.T.length > 0 || pathologicTNM.data.N.length > 0 || pathologicTNM.data.M.length > 0) {
            cancerSummary.tnm.push(pathologicTNM);
        }

        // Categories other than TNM
        cancerSummary.collatedCancerFacts = allCollatedCancerFacts.filter(function (obj) {
            return (tnmClassifications.clinical.indexOf(obj.category) === -1 && tnmClassifications.pathologic.indexOf(obj.category) === -1);
        });

        // Get tumor summary
        neo4jRawArr.forEach(function (cancer) {
            if (cancer.cancerId === cancerId) {
                // Add to the tumors
                cancerSummary.tumors = getTumorSummary(cancer.tumors);

                // Finally add to the cancers array
                cancers.push(cancerSummary);
            }
        });
    });

    return cancers;
}

const getTumorSummary = (tumorsArr) => {
    let self = this;

    let tumorSummary = {};
    // Sorted target tumors
    tumorSummary.tumors = [];
    tumorSummary.listViewData = [];
    tumorSummary.tableViewData = [];

    // Show Primary on the first row/column...
    const tumorTypesArr = [
        'Primary',
        'Metastasis',
        'Benign',
        'Generic'
    ];

    // Sort this uniqueRelationsArr in a specific order
    // categories not in this order will be listed at the bottom
    // based on their original order
    const order = [
        'hasBodySite',
        'hasLaterality',
        'hasDiagnosis',
        'hasTreatment',
        // Group biomarkers - Breast cancer only
        'has_ER_Status',
        'has_PR_Status',
        'has_HER2_Status',
        'hasKi67Status',
        // Group tumor sizes
        'hasTumorSize',
        'hasRadiologicTumorSize',
        'hasPathologicTumorSize',
        'hasPathologicAggregateTumorSize',
        'hasNuclearGrade'
    ];


    // Build an arry of unique tumors (id and type)
    let tumors = [];
    for (let i = 0; i < tumorsArr.length; i++) {
        let tumorObj = {};
        tumorObj.id = tumorsArr[i].tumorId;
        tumorObj.type = tumorsArr[i].hasTumorType;

        tumors.push(tumorObj);
    }

    // Sort by tumor types
    let sortedTumors = sortByTumorType(tumors, tumorTypesArr);

    // Add to the final data structure
    tumorSummary.tumors = sortedTumors;

    // Build the data structure for list view
    let targetTumorsForListView = sortedTumors; // Make a copy

    let relationPrettyNameMap = new Map();

    targetTumorsForListView.forEach(function (targetTumor) {
        // Add new property
        targetTumor.data = [];

        tumorsArr.forEach(function (origTumor) {
            // Now for each tumor's each relation category, group the facts
            if (targetTumor.id === origTumor.tumorId) {
                let uniqueRelationsArr = [];


                origTumor.tumorFacts.forEach(function (tumorFact) {
                    // Skip the treatment facts because treatments are for cancer summary?
                    if (tumorFact.relation !== 'hasTreatment') {
                        if (uniqueRelationsArr.indexOf(tumorFact.relation) === -1) {
                            uniqueRelationsArr.push(tumorFact.relation);
                            // Also add to map
                            relationPrettyNameMap.set(tumorFact.relation, tumorFact.relationPrettyName);
                        }
                    }
                });

                // Sort the uniqueRelationsArr by the item's index in the order array
                let sortedFactRelationships = self.sortByProvidedOrder(uniqueRelationsArr, order);

                // Then add the data
                sortedFactRelationships.forEach(function (reln) {
                    let dataObj = {};
                    dataObj.category = titleCase(relationPrettyNameMap.get(reln));
                    dataObj.categoryClass = getCategoryClass(reln);
                    dataObj.facts = [];

                    origTumor.tumorFacts.forEach(function (tumorFact) {
                        if (tumorFact.relation === reln) {
                            dataObj.facts.push(tumorFact.tumorFactInfo);
                        }
                    });

                    // Add to data
                    targetTumor.data.push(dataObj);
                });
            }
        });
        targetTumor.data.sort((a, b) => {
            let sa = a.category;
            let sb = b.category;

            if (sa < sb) {
                return -1;
            }

            if (sa > sb) {
                return 1;
            }
            return 0;
        });
    });

    // List view data array
    tumorSummary.listViewData = targetTumorsForListView;

    // Build the data structure for table view
    let allTumorFactRelnArr = [];

    // Get a list of tumor fact relationships for each tumor
    tumorsArr.forEach(function (tumor) {
        let tumorFactRelnArr = getTumorFactRelnArr(tumor.tumorFacts);
        allTumorFactRelnArr.push(tumorFactRelnArr);
    });

    let mergedArr = [];
    allTumorFactRelnArr.forEach(function (reln) {
        // https://lodash.com/docs/4.17.4#union
        // Creates an array of unique values, in order, from all given arrays
        mergedArr = _.unionWith(mergedArr, reln, _.isEqual);
    });

    // Sort the fact relationships by the item's index in the order array
    let sortedAllFactRelationships = this.sortByProvidedOrder(mergedArr, order);

    // For each category, get collacted facts for each tumor
    sortedAllFactRelationships.forEach(function (reln) {
        let factsByCategoryObj = {};
        // Convert the 'hasXXX' relationship to category
        factsByCategoryObj.category = titleCase(relationPrettyNameMap.get(reln));
        factsByCategoryObj.categoryClass = getCategoryClass(reln);
        factsByCategoryObj.data = [];

        sortedTumors.forEach(function (targetTumor) {
            tumorsArr.forEach(function (origTumor) {
                if (targetTumor.id === origTumor.tumorId) {
                    let obj = {};
                    obj.tumorId = origTumor.tumorId;
                    obj.facts = [];

                    origTumor.tumorFacts.forEach(function (tumorFact) {
                        if (tumorFact.relation === reln) {
                            obj.facts.push(tumorFact.tumorFactInfo);
                        }
                    });

                    // Add to factsByCategoryObj.data
                    factsByCategoryObj.data.push(obj);
                }
            });
        });

        // Add to the table view data
        tumorSummary.tableViewData.push(factsByCategoryObj);
    });

    tumorSummary.tableViewData.sort((a, b) => {
        let sa = a.category;
        let sb = b.category;

        if (sa < sb) {
            return -1;
        }

        if (sa > sb) {
            return 1;
        }
        return 0;
    });
    // Finally all done
    return tumorSummary;
}


// Convert the index array to named array
const getTimelineData = (neo4jRawJson) => {
    let self = this;

    let preparedReports = {};
    // Properties
    preparedReports.patientInfo = neo4jRawJson.patientInfo;
    preparedReports.reportData = [];
    preparedReports.typeCounts = {};
    preparedReports.episodes = [];
    preparedReports.episodeCounts = {};

    // First sort by date
    let sortedReportsArr = this.sortReportsByDate(neo4jRawJson.reportData);

    let reportTypes = [];

    let episodes = [];
    let episodeDates = {};

    // Using lodash's `_.forEach()`
    _.forEach(sortedReportsArr, function (reportObj) {
        let report = {};

        report.id = reportObj.id;
        report.date = reportObj.date;
        report.name = reportObj.name;
        report.type = reportObj.type; // Is already formatted/normalized
        report.episode = self.capitalizeFirstLetter(reportObj.episode); // Capitalized

        // Add to reportData array
        preparedReports.reportData.push(report);

        // Create an array of report types without duplicates
        if (reportTypes.indexOf(report.type) === -1) {
            reportTypes.push(report.type);
        }

        // Add the type as key to typeCounts object
        // JavaScript objects cannot have duplicate keys
        if (report.type in preparedReports.typeCounts) {
            preparedReports.typeCounts[report.type]++;
        } else {
            preparedReports.typeCounts[report.type] = 1;
        }

        // Create an array of episode types without duplicates
        if (episodes.indexOf(report.episode) === -1) {
            // Capitalize the episode name
            episodes.push(report.episode);
        }

        // Also count the number of reports for each episode type
        if (report.episode in preparedReports.episodeCounts) {
            preparedReports.episodeCounts[report.episode]++;
        } else {
            preparedReports.episodeCounts[report.episode] = 1;
        }

        // Add dates to each episode dates named array
        if (typeof (episodeDates[report.episode]) === 'undefined') {
            // Use the episode name as key
            episodeDates[report.episode] = [];
        }

        episodeDates[report.episode].push(report.date);
    });

    // Sort the report types based on this specific order
    const orderOfReportTypes = [
        'Progress Note',
        'Radiology Report',
        'Surgical Pathology Report',
        'Discharge Summary',
        'Clinical Note'
    ];

    preparedReports.reportTypes = this.sortByProvidedOrder(reportTypes, orderOfReportTypes);

    // Sort the episodes based on this specific order, capitalized
    const orderOfEpisodes = [
        'Pre-diagnostic',
        'Diagnostic',
        'Medical Decision-making',
        'Treatment',
        'Follow-up',
        "Unknown"
    ];

    preparedReports.episodes = this.sortByProvidedOrder(episodes, orderOfEpisodes);

    preparedReports.episodeDates = episodeDates;

    // Group the report objects by report date, not time
    // This returns a named array, key is the date, value is an arry of reports with the same date
    let reportsGroupedByDateObj = _.groupBy(preparedReports.reportData, function (report) {
        return report.date;
    });

    // Then further group by report type on top of the grouped date
    let reportsGroupedByDateAndTypeObj = {};

    for (let property in reportsGroupedByDateObj) {
        if (reportsGroupedByDateObj.hasOwnProperty(property)) {
            let arr = reportsGroupedByDateObj[property];
            let reportsGroupedByTypeObj = _.groupBy(arr, function (report) {
                return report.type;
            });

            if (typeof reportsGroupedByDateAndTypeObj[property] === 'undefined') {
                reportsGroupedByDateAndTypeObj[property] = {};
            }

            reportsGroupedByDateAndTypeObj[property] = reportsGroupedByTypeObj;
        }
    }

    preparedReports.reportsGroupedByDateAndTypeObj = reportsGroupedByDateAndTypeObj;

    // Calculate the max number of vertically overlapped reports
    // this will be used to determine the height of each report type row in timeline
    // verticalCountsPerType keys is not ordered by the `orderOfReportTypes`
    let verticalCountsPerType = {};

    for (let property in reportsGroupedByDateAndTypeObj) {
        if (reportsGroupedByDateAndTypeObj.hasOwnProperty(property)) {
            for (let type in reportsGroupedByDateAndTypeObj[property]) {
                let arr = reportsGroupedByDateAndTypeObj[property][type];

                if (typeof verticalCountsPerType[type] === 'undefined') {
                    verticalCountsPerType[type] = [];
                }

                verticalCountsPerType[type].push(arr.length);
            }
        }
    }

    // Find the max vertical count of reports on the same date for each report type
    // maxVerticalCountsPerType keys is not ordered by the `orderOfReportTypes`
    let maxVerticalCountsPerType = {};

    for (let property in verticalCountsPerType) {
        if (verticalCountsPerType.hasOwnProperty(property)) {
            if (typeof maxVerticalCountsPerType[property] === 'undefined') {
                maxVerticalCountsPerType[property] = _.max(verticalCountsPerType[property]);
            }
        }
    }

    preparedReports.maxVerticalCountsPerType = maxVerticalCountsPerType;

    // Return everything
    return preparedReports;
}

const getTerms = (neo4jRawJson) => {

}

// One fact can have multiple matching texts
// And the same matching text can be found in multiple places in the same report
const getFact = (neo4jRawJson) => {
    let self = this;

    let factJson = {};

    factJson.sourceFact = neo4jRawJson.sourceFact;
    factJson.groupedTextProvenances = [];

    let docIds = [];
    if (neo4jRawJson.mentionedTerms != undefined) { //JDL JDL
        neo4jRawJson.mentionedTerms.forEach(function (textMention) {
            if (docIds.indexOf(textMention.reportId) === -1) {
                docIds.push(textMention.reportId);
            }
        });
    }

    // Named array object
    let groupedTextProvenances = {};

    docIds.forEach(function (id) {
        let textProvenanceObj = {};
        textProvenanceObj.docId = id;
        textProvenanceObj.terms = [];
        textProvenanceObj.texts = [];
        textProvenanceObj.textCounts = [];

        neo4jRawJson.mentionedTerms.forEach(function (textMention) {
            if (textMention.reportId === id) {
                let termObj = {};
                termObj.term = textMention.term;
                termObj.begin = textMention.begin;
                termObj.end = textMention.end;

                textProvenanceObj.terms.push(termObj);

                // This is used to generate the count per term
                textProvenanceObj.texts.push(textMention.term);
            }
        });

        if (typeof groupedTextProvenances[id] === "undefined") {
            groupedTextProvenances[id] = textProvenanceObj;
        }
    });

    // Additional process to aggregate text mentions with count for each group
    Object.keys(groupedTextProvenances).forEach(function (key) {
        let textCounts = [];
        let textsArr = groupedTextProvenances[key].texts;

        textsArr.forEach(function (text) {
            let countObj = {};
            countObj.text = text;
            countObj.count = _.countBy(textsArr)[text];

            textCounts.push(countObj);
        });

        // Remove duplicates and add to groupedTextProvenances[key]
        groupedTextProvenances[key].textCounts = _.uniqWith(textCounts, _.isEqual);
    });

    factJson.groupedTextProvenances = groupedTextProvenances;

    return factJson;
}

/////////////////////////////////////////////////////////////////////////////////////////
//
//                            API ONLY
//
////////////////////////////////////////////////////////////////////////////////////////

// Wrap the array into json
const getAllPatients = (neo4jRawArr) => {
    let json = {};
    json.allpatients = neo4jRawArr;

    return json;
}


/////////////////////////////////////////////////////////////////////////////////////////
//
//                            INTERNAL HELERS USED BY CHORT AND INDIVIDUAL PATIENT
//
////////////////////////////////////////////////////////////////////////////////////////

// ES6 Class doesn't support class variables, we use a static function instead
// for shared variables
const getOrderedCancerStages = () => {
    // All stages in a sorted order
    return [
        'Stage 0',
        // Stage I
        'Stage I',
        'Stage IA',
        'Stage IB',
        'Stage IC',
        // Stage II
        'Stage II',
        'Stage IIA',
        'Stage IIB',
        'Stage IIC',
        // Stage III
        'Stage III',
        'Stage IIIA',
        'Stage IIIB',
        'Stage IIIC',
        // Stage IV
        'Stage IV',
        'Stage IVA',
        'Stage IVB',
        'Stage IVC',
        // Stage Unknown
        'Stage Unknown'
    ];
}

const buildTNM = (collatedFacts, type, tnmClassifications) => {
    let tnmObj = {};

    // Two properties
    tnmObj.type = type;
    tnmObj.data = {};
    // Make sure to use T, N, M as keys so we don't
    // have to worry about the ordering of corresponding facts data
    tnmObj.data.T = [];
    tnmObj.data.N = [];
    tnmObj.data.M = [];

    // Build the TNM object of this type
    // collatedFacts contains all the cancer categories, we only need the TNM relationships of this type
    for (let i = 0; i < collatedFacts.length; i++) {
        //console.log(collatedFacts[i].category);
        if (tnmClassifications.indexOf(collatedFacts[i].category) !== -1) {
            let itemObj = {};
            // Extracted the last letter of the classification, "T", or "N", or "M"
            let classification = collatedFacts[i].category.toUpperCase().substr(-1);
            tnmObj.data[classification] = collatedFacts[i].facts;
        }
    }

    return tnmObj;
}

// Only get the first two words, e.g., "Stage IA"
const getShortStageName = (longStageName) => {
    return longStageName.split(/\s+/).slice(0, 2).join(' ');
}

// "stage_2a"
const getRomanNumeralStageName = (arabicStageName) => {
    return arabicStageName.replace("_", " ").replace("1", "I").replace("2", "II").replace("3", "III").replace("4", "IV")
}

const titleCase = (str) => {
    str = str.replace(/ $/, '');
    if (str != "ER" && str != "HER2" && str != "PR") {
        return str.toLowerCase().split(' ').map(function (word) {
            return word.replace(word[0], word[0].toUpperCase());
        }).join(' ');
    } else {
        return str;
    }

}

const getStageWithoutLetter = (stageWithLetter) => {
    return stageWithLetter.replace("IA", "I").replace("IB", "I").replace("IC", "I").replace("VA", "V").replace("VB", "V").replace("VC", "V");

}

// Used by episode
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// https://stackoverflow.com/questions/18859186/sorting-an-array-of-javascript-objects-a-specific-order-using-existing-function
const sortByProvidedOrder = (array, orderArr) => {
    let orderMap = new Map();

    orderArr.forEach(function (item) {
        // Remember the index of each item in order array
        orderMap.set(item, orderArr.indexOf(item));
    });

    // Sort the original array by the item's index in the orderArr
    // It's very possible that items are in array may not be in orderArr
    // so we assign index starting from orderArr.length for those items
    let i = orderArr.length;
    let sortedArray = array.sort(function (a, b) {
        if (!orderMap.has(a)) {
            orderMap.set(a, i++);
        }

        if (!orderMap.has(b)) {
            orderMap.set(b, i++);
        }

        return (orderMap.get(a) - orderMap.get(b));
    });

    return sortedArray;
}

// In tumor summary table, show Primary Neoplasm in the first data column...
const sortByTumorType = (array, orderArr) => {
    let orderMap = new Map();

    orderArr.forEach(function (item) {
        // Remember the index of each item in order array
        orderMap.set(item, orderArr.indexOf(item));
    });

    // Sort the original array by the item's index in the orderArr
    // It's very possible that items are in array may not be in orderArr
    // so we assign index starting from orderArr.length for those items
    let i = orderArr.length;
    let sortedArray = array.sort(function (a, b) {
        // Use item.type since we are ordering by tumor type
        // this is the only difference from sortByProvidedOrder()
        if (!orderMap.has(a.type)) {
            orderMap.set(a.type, i++);
        }

        if (!orderMap.has(b.type)) {
            orderMap.set(b.type, i++);
        }

        return (orderMap.get(a.type) - orderMap.get(b.type));
    });

    return sortedArray;
}


// For tumor fact box background rendering in CSS
const getCategoryClass = (categoryClass) => {
    // Manual filtering for now
    // const categoryClassesArr = [
    //     'hasBodySite',
    //     'hasLaterality',
    //     'hasDiagnosis',
    //     'hasTreatment',
    //     'has_ER_Status',
    //     'has_PR_Status',
    //     'has_HER2_Status',
    //     'hasKi67Status',
    //     'hasClockface',
    //     'hasTumorSize',
    //     'hasRadiologicTumorSize',
    //     'hasPathologicTumorSize',
    //     'hasPathologicAggregateTumorSize',
    //     'hasCancerCellLine',
    //     'hasHistologicType',
    //     'hasTumorExtent'
    // ];

    const categoryClassesArr = [
        'topography_major',
        'er_',
        'pr_',
        'her2',
        'laterality',
        'diagnosis',
        'topography_minor',
        'histology',
        'stage',
        'grade',
        'behavior',
        't',
        'n',
        'm',

        'ki67',
        'brca1',
        'brca2',
        'alk',
        'egfr',
        'braf',
        'ros1',
        'pdl1',
        'msi',
        'kras',
        'psa',
        'psa_el'
    ];

    if (categoryClassesArr.indexOf(categoryClass) === -1) {
        categoryClass = 'unspecified';

    }

    return categoryClass;
}

// Get an arry of tumor fact relationships without duplicates
const getTumorFactRelnArr = (tumorFacts) => {
    // Build an arry of unique tumorFactReln
    let uniqueTumorFactRelnArr = [];

    for (let i = 0; i < tumorFacts.length; i++) {
        // HACK - filter out `hasTumorType`, `hasTreatment`
        if (tumorFacts[i].relation !== 'hasTumorType' && tumorFacts[i].relation !== 'hasTreatment') {
            uniqueTumorFactRelnArr.push(tumorFacts[i].relation);
        }
    }

    return uniqueTumorFactRelnArr;
}

// Sort from newest date to oldest date
// Format the report type
const sortReportsByDate = (reportsArr) => {
    // Date format returned by neo4j is "07/19/2006 09:33 AM EDT"
    reportsArr.sort(function (a, b) {
        // Turn strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return (new Date(b.date) - new Date(a.date));
    });

    // Now we just put the data we need together
    let arr = [];
    for (let i = 0; i < reportsArr.length; i++) {
        let typeArr = reportsArr[i].type.toLowerCase().split('_');
        typeArr.forEach(function (v, i, a) {
            // Capitalize the first letter of each word
            a[i] = v.charAt(0).toUpperCase() + v.substr(1);
        });

        // Joins all elements of the typeArr into a string
        reportsArr[i].type = typeArr.join(' ');

        arr.push(reportsArr[i]);
    }

    return arr;
}


/**
 * Expose the DataProcessor class as a local module
 */


module.exports.getCohortData = getCohortData
module.exports.getBiomarkers = getBiomarkers
module.exports.getDiagnosis = getDiagnosis
module.exports.getTimelineData = getTimelineData
module.exports.sortReportsByDate = sortReportsByDate
module.exports.capitalizeFirstLetter = capitalizeFirstLetter
module.exports.sortByProvidedOrder = sortByProvidedOrder
module.exports.getCancerAndTumorSummary = getCancerAndTumorSummary
module.exports.getFact = getFact


