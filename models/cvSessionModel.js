// models/cvSessionModel.js

const db = require("../config/db");

const createSession = async (sessionToken) => {
  const query = `
    INSERT INTO cv_sessions (session_token)
    VALUES ($1)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [sessionToken]);
  return rows[0];
};

const getSessionByToken = async (sessionToken) => {
  const query = `
    SELECT * FROM cv_sessions
    WHERE session_token = $1;
  `;
  const { rows } = await db.query(query, [sessionToken]);
  return rows[0];
};

const updateSessionStepAndAnswers = async (sessionToken, currentStep, updatedAnswers) => {
  const query = `
    UPDATE cv_sessions
    SET current_step = $2,
        answers = $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE session_token = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [sessionToken, currentStep, updatedAnswers]);
  return rows[0];
};

const markSessionComplete = async (sessionToken) => {
  const query = `
    UPDATE cv_sessions
    SET is_completed = true,
        updated_at = CURRENT_TIMESTAMP
    WHERE session_token = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [sessionToken]);
  return rows[0];
};

module.exports = {
  createSession,
  getSessionByToken,
  updateSessionStepAndAnswers,
  markSessionComplete,
};
