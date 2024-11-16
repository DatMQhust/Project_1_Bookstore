// db.js
const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',      // Your MySQL host
  user: 'root',   // Your MySQL username
  password: 'maidat1211@.com', // Your MySQL password
  database: 'bookreview'  // The name of your database
});

// Export a promise-based pool
const promisePool = pool.promise();

module.exports = promisePool;
