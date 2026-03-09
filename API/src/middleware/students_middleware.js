const { hashPassword, verifyPassword, signToken } = require("../auth");
const { db, query, crypto, moment, fs } = require("../models/models");

const getLastIDs = async () => {
  const result = await query("SELECT id, student_number FROM students ");

  console.log(result)
//   return result;
};

module.exports = { getLastIDs };
