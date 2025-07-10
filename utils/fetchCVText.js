const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

/**
 * Utility to extract text from uploaded and generated CVs
 * Supports: raw text, .pdf, .txt
 */
async function fetchCVText({
    generatedCvText,
    uploadedCvText,
    generatedCvPath,
    uploadedCvPath,
}) {
    const parts = [];

    // 1. Add raw text fields (if available)
    if (uploadedCvText) {
        console.log("📄 Using raw uploaded CV text");
        parts.push(uploadedCvText);
    }
    if (generatedCvText) {
        console.log("📄 Using raw generated CV text");
        parts.push(generatedCvText);
    }

    // 2. Try file-based reading if needed
    async function extractFromPath(label, filePath) {
        if (!filePath) return;

        const fullPath = path.join(__dirname, "..", "uploads", "cvs", filePath);
        if (!fs.existsSync(fullPath)) {
            console.warn(`⚠️ ${label} CV file not found: ${fullPath}`);
            return;
        }

        const ext = path.extname(fullPath).toLowerCase();
        try {
            if (ext === ".pdf") {
                const fileBuffer = await fs.promises.readFile(fullPath);
                const parsed = await pdfParse(fileBuffer);
                console.log(`✅ Parsed PDF from ${label} CV`);
                if (parsed.text?.trim()) parts.push(parsed.text.trim());
            } else if (ext === ".txt") {
                const text = await fs.promises.readFile(fullPath, "utf-8");
                console.log(`✅ Parsed TXT from ${label} CV`);
                if (text?.trim()) parts.push(text.trim());
            } else {
                console.warn(`⚠️ Unsupported file format: ${ext}`);
            }
        } catch (err) {
            console.error(`❌ Failed to read ${label} CV file: ${err.message}`);
        }
    }

    // 3. File-based fallback
    if (!uploadedCvText && uploadedCvPath) {
        await extractFromPath("uploaded", uploadedCvPath);
    }
    if (!generatedCvText && generatedCvPath) {
        await extractFromPath("generated", generatedCvPath);
    }

    // 4. Combine or return null
    return parts.length > 0 ? parts.join("\n\n") : null;
}

module.exports = fetchCVText;

// const fs = require('fs');
// const path = require('path');
// const pdfParse = require('pdf-parse');

// /**
//  * Utility to extract text from uploaded or generated CV files
//  * Supports: raw text, .pdf, .txt (fallback)
//  */
// async function fetchCVText(developer) {
//   // 🟢 1. Use direct text if provided
//   if (developer.generatedCvText) return developer.generatedCvText;
//   if (developer.uploadedCvText) return developer.uploadedCvText;

//   // 🟢 2. Choose path to use
//   const filePath = developer.generatedCvPath || developer.uploadedCvPath;
//   if (!filePath) return null;

//   // 🟢 3. Build full file path
//   const fullPath = path.join(__dirname, '..', 'uploads', 'cvs', filePath);

//   // 🟢 4. Check file existence
//   if (!fs.existsSync(fullPath)) {
//     console.warn(`CV file not found: ${fullPath}`);
//     return null;
//   }

//   // 🟢 5. Detect file extension
//   const ext = path.extname(fullPath).toLowerCase();

//   try {
//     if (ext === '.pdf') {
//       // ✅ PDF — use pdf-parse
//       const fileBuffer = await fs.promises.readFile(fullPath);
//       const parsed = await pdfParse(fileBuffer);
//       console.log("📄 Extracted CV text:", parsed)
//       return parsed.text;
//     } else if (ext === '.txt') {
//       // ✅ Plain text
//       return await fs.promises.readFile(fullPath, 'utf-8');
//     } else {
//       console.warn(`Unsupported file format: ${ext}`);
//       return null;
//     }
//   } catch (err) {
//     console.error(`Failed to read CV: ${err.message}`);
//     return null;
//   }
// }

// module.exports = fetchCVText;
