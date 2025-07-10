// data/cvWizardQuestions.js

module.exports = [
    {
      section: "Personal Info",
      key: "personal_info",
      questions: [
        { field: "name", label: "Full Name" },
        { field: "email", label: "Email" },
        { field: "phone", label: "Phone Number" },
        { field: "linkedin", label: "LinkedIn URL" },
        { field: "portfolio", label: "Portfolio URL" },
        { field: "address", label: "Address" },
      ],
    },
    {
      section: "Experience",
      key: "experience",
      isRepeatable: true,
      questions: [
        { field: "position", label: "Job Title" },
        { field: "company", label: "Company Name" },
        { field: "dates", label: "Employment Dates" },
        { field: "achievements", label: "Key Achievements" },
      ],
    },
    {
      section: "Education",
      key: "education",
      isRepeatable: true,
      questions: [
        { field: "degree", label: "Degree Name" },
        { field: "institution", label: "Institution" },
        { field: "start_date", label: "Start Date" },
        { field: "end_date", label: "End Date" },
        { field: "gpa", label: "GPA (optional)" },
      ],
    },
    {
      section: "Skillsets",
      key: "skills",
      questions: [
        { field: "skills", label: "List your key skills (comma separated)" },
      ],
    },
    {
      section: "Projects",
      key: "projects",
      isRepeatable: true,
      questions: [
        { field: "title", label: "Project Title" },
        { field: "description", label: "Project Description" },
        { field: "technologies", label: "Technologies Used" },
        { field: "results", label: "Outcomes or Results" },
      ],
    },
    {
      section: "Certifications",
      key: "certifications",
      isRepeatable: true,
      questions: [
        { field: "name", label: "Certification Name" },
        { field: "issuer", label: "Issued By" },
        { field: "date", label: "Issued Date" },
      ],
    },
    {
      section: "Additional",
      key: "additional",
      isRepeatable: true,
      questions: [
        { field: "title", label: "Title" },
        { field: "description", label: "Description" },
      ],
    },
  ];
  