import {PatientDocument} from "./PatientDocument";

export class JsonPatientDocument extends PatientDocument {
    #mentionIdsInDocument = []
    constructor(currDocId, patientObject) {
        super();
        this.patientDocument = patientObject.documents[currDocId];
        this.#mentionIdsInDocument = this.patientDocument?.mentions?.map((m) => m.id) || [];
    }

    getMentionIdsInDocument = () => {
        return this.#mentionIdsInDocument
    }

    getConceptsInDocument = (concepts) => {
        return concepts.filter((concept) =>
            concept.mentionIds?.some((m) => this.#mentionIdsInDocument.includes(m))
        );
    }

    getDocumentText() {
        return this.patientDocument.text;
    }
}