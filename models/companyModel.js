const createCompanyTable = async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        description TEXT,
        country VARCHAR(50),
        city VARCHAR(50),
        address TEXT,
        website TEXT,
        industry VARCHAR(50),
        contact_name VARCHAR(50),
        contact_email VARCHAR(100),
        phone_number VARCHAR(20),
        social_links TEXT[]
      );
    `;
    await pool.query(query);
    console.log('Company table created');
  };
  
  module.exports = { createCompanyTable };