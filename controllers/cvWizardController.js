// controllers/cvWizardController.js

const { v4: uuidv4 } = require("uuid");
const sessionModel = require("../models/cvSessionModel");
const { sendAnswersToAI } = require("../services/aiModelService");

const QUESTION_FLOW = [
  { section: "Personal Info", questions: ["name", "email", "phone", "linkedin", "portfolio", "address"] },
  { section: "Experience", questions: ["position", "company", "dates", "achievements"] },
  { section: "Education", questions: ["degree", "institution", "start_date", "end_date", "gpa"] },
  { section: "Skillsets", questions: [] },
  { section: "Projects", questions: ["title", "description", "technologies", "results"] },
  { section: "Certifications", questions: ["name", "issuer", "date"] },
  { section: "Additional", questions: ["title", "description"] },
];

const createNewSession = async (req, res) => {
  try {
    const sessionToken = uuidv4();
    const session = await sessionModel.createSession(sessionToken);
    res.json({ sessionToken, nextQuestion: QUESTION_FLOW[0] });
  } catch (error) {
    res.status(500).json({ error: "Failed to start session." });
  }
};

const answerQuestion = async (req, res) => {
  const { sessionToken, section, answers } = req.body;

  try {
    const session = await sessionModel.getSessionByToken(sessionToken);
    if (!session) return res.status(404).json({ error: "Session not found." });

    const updatedAnswers = session.answers || {};
    updatedAnswers[section] = answers;

    const currentStep = session.current_step + 1;

    if (currentStep >= QUESTION_FLOW.length) {
      await sessionModel.updateSessionStepAndAnswers(sessionToken, currentStep, updatedAnswers);
      await sessionModel.markSessionComplete(sessionToken);
      const aiResponse = await sendAnswersToAI(updatedAnswers);
      return res.json({ message: "CV Generated", cv: aiResponse });
    } else {
      const updatedSession = await sessionModel.updateSessionStepAndAnswers(sessionToken, currentStep, updatedAnswers);
      return res.json({
        message: "Next question",
        nextQuestion: QUESTION_FLOW[currentStep],
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

module.exports = {
  createNewSession,
  answerQuestion,
};
