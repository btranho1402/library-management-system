const mysql = require("mysql2/promise");

async function getConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

function jsonResponse(statusCode, bodyObj) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(bodyObj),
  };
}

function parseJsonBody(event) {
  if (!event || !event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return null; 
  }
}

module.exports = { getConnection, jsonResponse, parseJsonBody };
