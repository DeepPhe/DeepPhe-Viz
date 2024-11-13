// mentionUtils.js
export const getMentionsGivenMentionIds = (doc, mentionIds) => {
    return doc.mentions.filter((m) => mentionIds.includes(m.id));
};

export const getMentionsForConcept = (doc, concepts, conceptId) => {
    if (conceptId === "") return [];
    if (conceptId !== undefined) {
        const idx = concepts.findIndex((c) => c.id === conceptId);
        if (idx === -1) return [];
        return concepts[idx].mentionIds.filter((mentionId) =>
            doc.mentions.some((m) => m.id === mentionId)
        );
    }
    return [];
};
