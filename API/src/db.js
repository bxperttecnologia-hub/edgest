require("dotenv").config();
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

connection.connect((error) => {
  if (error) {
    console.error("Erro ao conectar ao banco de dados:", error.message);
    process.exit(1);
  }

  console.log(
    `Conectado ao banco de dados MySQL. ID da conexão: ${connection.threadId}`,
  );
});

module.exports = connection;
