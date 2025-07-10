const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const transformCVData = (rawData) => {
    return {
        personal_info: {
            name: rawData.personal_info?.name || "",
            email: rawData.personal_info?.email || "",
            phone: rawData.personal_info?.phone || "",
            address: rawData.personal_info?.address || "",
            linkedin: rawData.personal_info?.linkedin || "",
            portfolio: rawData.personal_info?.portfolio || "",
            summary: rawData.personal_info?.summary || "",
        },
        education: (rawData.education || []).map((edu) => ({
            institution: edu.institution || "",
            location: edu.location || "",
            degree: edu.degree || "",
            field: edu.field || "",
            start_date: edu.start_date || "",
            end_date: edu.end_date || "",
            gpa: edu.gpa || "",
        })),
        experience: (rawData.experience || []).map((exp) => ({
            position: exp.position || "",
            company: exp.company || "",
            dates: exp.dates || "",
            achievements: exp.achievements || [],
        })),
        skillsets: rawData.skillsets || [],
        projects: (rawData.projects || []).map((proj) => ({
            title: proj.title || "",
            description: proj.description || "",
            technologies: proj.technologies || [],
            results: proj.results || [],
        })),
        certifications: (rawData.certifications || []).map((cert) => ({
            name: cert.name || "",
            issuer: cert.issuer || "",
            date: cert.date || "",
        })),
        additional: (rawData.additional || []).map((extra) => ({
            title: extra.title || "",
            description: extra.description || "",
        })),
    };
};

exports.generatePDF = async (rawData) => {
    const transformedData = transformCVData(rawData);

    try {
        const response = await axios.post(
            "http://localhost:8000/generate",
            transformedData,
            {
                responseType: "arraybuffer",
                timeout: 100000,
            }
        );

        const outputDir = path.join(__dirname, "../../uploads/cvs/");
        const fileName = `cv-${uuidv4()}.pdf`;
        const filePath = path.join(outputDir, fileName);

        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(filePath, Buffer.from(response.data));

        return `uploads/cvs/${fileName}`;
    } catch (error) {
        if (error.response?.status === 422) {
            const errorBody = Buffer.from(error.response.data).toString(
                "utf-8"
            );
            let validationError;
            try {
                validationError = JSON.parse(errorBody);
            } catch {
                validationError = errorBody;
            }
            console.error("Validation failed:", validationError);
            throw new Error(
                `Validation failed: ${
                    validationError.detail?.map((d) => d.msg).join(", ") ||
                    "Unknown error"
                }`
            );
        } else {
            console.error("Unexpected error generating PDF:", error);
            throw new Error("Failed to generate CV PDF");
        }
    }
};

// const axios = require('axios');
// const fs = require('fs').promises;
// const path = require('path');
// const { v4: uuidv4 } = require('uuid');

// const transformCVData = (cvData) => {
//   return {
//     personal_info: {
//       name: cvData.personal_info?.name || '',
//       email: cvData.personal_info?.email || '',
//       phone: cvData.personal_info?.phone || '',
//       address: cvData.personal_info?.address || '',
//       linkedin: cvData.personal_info?.linkedin || '',
//       portfolio: cvData.personal_info?.portfolio || '',
//       summary: cvData.personal_info?.summary || '',
//     },
//     education: (cvData.education || []).map(edu => ({
//       institution: edu.institution || '',
//       location: edu.location || '',
//       degree: edu.degree || '',
//       field: edu.field || '',
//       start_date: edu.start_date || '',
//       end_date: edu.end_date || '',
//       gpa: edu.gpa || ''
//     })),
//     experience: (cvData.experience || []).map(exp => ({
//       position: exp.position || '',
//       company: exp.company || '',
//       dates: exp.dates || '',
//       achievements: exp.achievements || []
//     })),
//     skillsets: cvData.skillsets || [],
//     projects: (cvData.projects || []).map(proj => ({
//       title: proj.title || '',
//       description: proj.description || '',
//       technologies: proj.technologies || [],
//       results: proj.results || []
//     })),
//     certifications: (cvData.certifications || []).map(cert => ({
//       name: cert.name || '',
//       issuer: cert.issuer || '',
//       date: cert.date || ''
//     })),
//     additional: (cvData.additional || []).map(extra => ({
//       title: extra.title || '',
//       description: extra.description || ''
//     }))
//   };
// };

// exports.generatePDF = async (cvData) => {
//   const transformedData = transformCVData(cvData);
//   console.log('Sending CV Data to server:', JSON.stringify(cvData, null, 2));

//   try {
//     // API request
//     const response = await axios.post('http://localhost:8000/generate', transformedData, {
//       responseType: 'arraybuffer',
//       timeout: 30000, // 30-second timeout
//     });

//     // Prepare file path
//     const outputDir = path.join(__dirname, '../../uploads/cvs/');
//     const fileName = `cv-${uuidv4()}.pdf`;
//     const filePath = path.join(outputDir, fileName);

//     // Ensure directory exists
//     try {
//       await fs.mkdir(outputDir, { recursive: true });
//     } catch (dirError) {
//       console.error(`Directory creation failed: ${outputDir}`, dirError);
//       throw new Error('Failed to create output directory');
//     }

//     // Save file
//     await fs.writeFile(filePath, Buffer.from(response.data));

//     return `uploads/cvs/${fileName}`; // just relative path
//     // return `http://localhost:3000/uploads/cvs/${fileName}`;

//   } catch (error) {
//     if (error.response && error.response.status === 422) {
//       // Convert buffer to string and parse JSON
//       const errorBody = Buffer.from(error.response.data).toString('utf-8');
//       let validationError;
//       try {
//         validationError = JSON.parse(errorBody);
//       } catch (e) {
//         validationError = errorBody;
//       }

//       console.error('422 Validation Error Details:', validationError);
//       throw new Error(`Validation failed: ${validationError.detail?.map(d => d.msg).join(', ') || 'Unknown validation error'}`);
//     } else {
//       console.error('Error generating PDF:', error);
//     }
//     throw error;
//   }
// };

// exports.processChatInput = async (sessionId, message) => {
//     const currentData = await require('./cvService').getSessionData(sessionId);
//     console.log('📤 Current CV Data:', JSON.stringify(currentData, null, 2));
//     const response = await axios.post('http://localhost:8000/chat-to-cv', {
//         session_id: sessionId,
//         message,
//     });

//     const { reply, structured_fields } = response.data;
//     console.log('📥 Received structured_fields:', JSON.stringify(structured_fields, null, 2));

//     const listSections = ['experience', 'education', 'skillsets', 'projects', 'certifications', 'additional'];
//     const objectSections = ['personal_info'];

//     for (const [sectionName, data] of Object.entries(structured_fields)) {
//         if (listSections.includes(sectionName)) {
//           const currentList = currentData[sectionName] || [];
//           const newEntries = Array.isArray(data) ? data : [data];

//           let updatedList;
//           if (sectionName === 'skillsets') {
//             updatedList = [...new Set([...currentList, ...newEntries])];
//           } else {
//             updatedList = [...currentList, ...newEntries];
//           }

//           await require('./cvService').updateSection(sessionId, sectionName, updatedList);
//         } else if (objectSections.includes(sectionName)) {
//             const currentObject = currentData[sectionName] || {};
//             const updatedObject = { ...currentObject, ...data };
//             await require('./cvService').updateSection(sessionId, sectionName, updatedObject);
//         } else if (stringSections.includes(sectionName)) {
//             await require('./cvService').updateSection(sessionId, sectionName, data);
//         }
//     }

//     return { reply, updatedFields: structured_fields };
// };
