const express = require("express");
const router = express.Router();
const { query, db } = require("../models/models");
const { getAllDocuments } = require("../controllers/documents.controller");

router.post("/", getAllDocuments);
// router.delete("/delete/:id", deleteStudent);

module.exports = router;
