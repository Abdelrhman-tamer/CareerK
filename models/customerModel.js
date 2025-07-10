const createCustomerTable = async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        description TEXT,
        contact_email VARCHAR(100),
        phone_number VARCHAR(20)
      );
    `;
    await pool.query(query);
    console.log('Customer table created');
  };
  
  module.exports = { createCustomerTable };