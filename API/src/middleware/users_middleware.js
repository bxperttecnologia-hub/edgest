const { hashPassword, verifyPassword, signToken } = require("../auth");
const {db, query, crypto, moment, fs} = require("../models/models");


const insertUser = async (name, email, password, role) => {

    const { salt, hash } = await hashPassword(password);
    const result = await db.query(
      "INSERT INTO system_users (name, email, password_hash, password_salt, role) VALUES (?,?,?,?,?)",
      [name, email, hash, salt, role || "student"]
    );

    return result;
}

const getUserData = async (email) => {
  const result = await query("SELECT * FROM system_users")
}

// const getLastID = async () => {
//   const result = await query("SELECT id")
// }

module.exports = {insertUser}