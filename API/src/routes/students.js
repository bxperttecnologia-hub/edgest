const express = require("express");
const router = express.Router();
const { query, db } = require("../models/models");
const {
  addStudents,
  getStudents,
  updateStudent,
  deleteStudent,
  getStudentErrollments,
  generateContract,
} = require("../controllers/student.controller");
const upload = require("../middleware/upload");

// POST /api/students  (criar estudante e associar a user_id opcional)
router.post(
  "/add",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  addStudents,
);
router.post("/get", getStudents);
router.get("/generateContract/:id", generateContract);
router.post("/enrollments/:id", getStudentErrollments);
router.put(
  "/update/:id",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  updateStudent,
);

router.delete("/delete/:id", deleteStudent);

module.exports = router;
