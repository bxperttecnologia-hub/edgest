const express = require('express');
const router = express.Router();
const {query, db} = require('../models/models');
const { addStudents, getStudents, updateStudent, deleteStudent, getStudentErrollments } = require('../controllers/student.controller');

// POST /api/students  (criar estudante e associar a user_id opcional)
router.post('/add', addStudents);
router.post("/get", getStudents);
router.post("/enrollments/:id", getStudentErrollments);
router.put("/update/:id", updateStudent);
router.delete("/delete/:id", deleteStudent);


module.exports = router;
