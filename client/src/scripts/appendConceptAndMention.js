const fs = require('fs');
const path = require('path');

function appendMentionsToTSV(conceptsPerDocument, filePath = '../../public/unsummarized_output.tsv') {
    // Read the existing file content (if it exists)
    let existingData = '';
    if (fs.existsSync(path.resolve(__dirname, filePath))) {
        existingData = fs.readFileSync(path.resolve(__dirname, filePath), 'utf8');
    }

    // Split the existing data into rows and columns
    let rows = existingData.split('\n').filter(row => row.trim() !== '');
    const headers = rows[0]?.split('\t').map(header => header.trim()) || []; // Trim headers to avoid leading/trailing spaces
    let noteNameIndex = headers.indexOf('note_name');
    let mentionIdIndex = headers.indexOf('mention_id');

    // If headers don't exist or are incorrect, add them
    if (noteNameIndex === -1 || mentionIdIndex === -1) {
        if (headers.length === 0) {
            // If the file is empty, add headers
            rows.unshift('note_name\tmention_id');
            noteNameIndex = 0;
            mentionIdIndex = 1;
        } else {
            // If the headers exist but are incorrect, don't add them again
            console.warn('Warning: Missing "note_name" or "mention_id" columns.');
        }
    }

    // Iterate through each document and add the mention data
    Object.entries(conceptsPerDocument).forEach(([noteId, concepts]) => {
        let found = false;

        // Search for an existing row with the same noteId
        for (let i = 1; i < rows.length; i++) {
            let row = rows[i].split('\t').map(cell => cell.trim());
            if (row[noteNameIndex] === noteId) {
                // If noteId is found, append mentionId in the correct column
                concepts.forEach((concept) => {
                    (concept.mentionIds || []).forEach((mentionId) => {
                        row[mentionIdIndex] += `\t${mentionId}`;  // Append mentionId in the same row
                    });
                });
                rows[i] = row.join('\t');
                found = true;
                break;
            }
        }

        // If noteId was not found, create a new row for it
        if (!found) {
            let newRow = `${noteId}`;  // Start with note_name (the noteId)
            concepts.forEach((concept) => {
                (concept.mentionIds || []).forEach((mentionId) => {
                    newRow += `\t${mentionId}`;  // Add mentionId under mention_id
                });
            });
            rows.push(newRow); // Append the new row
        }
    });

    // Join the rows into a single string and write back to the file
    const data = rows.join('\n') + '\n';
    fs.writeFileSync(path.resolve(__dirname, filePath), data);

    console.log(`Appended mention data to ${filePath}`);
}

// Sample data you can test with
const sampleConcepts = {
    "main_fake_patient1_doc2_SP_724055880": [
        { mentionIds: ["fake_patient1_04032024_225414_C_39", "fake_patient1_04032024_225414_C_40"] },
        { mentionIds: ["fake_patient1_04032024_225414_C_41"] }
    ],
    "main_fake_patient1_doc3_NOTE_-598580601": [
        { mentionIds: ["fake_patient1_04032024_225414_C_139"] }
    ]
};

// Call the function with sample data (you can change this to your real data)
appendMentionsToTSV(sampleConcepts);
