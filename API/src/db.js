/* db pool placeholder */
require("dotenv").config();
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
})

connection.connect((error) => {
    if(error){
        console.log("Erro ao conectar com o banco de dados!")
    }

    console.log("Conetado ao banco de dados MYSQL ID: ", connection.threadId);
})

module.exports = connection;