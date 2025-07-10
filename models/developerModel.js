const { pool } = require('../config/db');

const createDeveloperTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS developers (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      gender VARCHAR(10),
      date_of_birth DATE,
      phone_number VARCHAR(20),
      country VARCHAR(50),
      city VARCHAR(50),
      address TEXT,
      bio TEXT,
      skills TEXT[],
      track VARCHAR(50),
      track_level VARCHAR(50),
      previous_job VARCHAR(50),
      job_type VARCHAR(50),
      experience_years INT,
      expected_salary INT,
      cv_url TEXT,
      courses TEXT[]
    );
  `;
  await pool.query(query);
  console.log('Developer table created');
};

module.exports = { createDeveloperTable };
