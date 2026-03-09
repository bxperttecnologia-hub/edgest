const express = require('express');
const router = express.Router();
const { getCourses, insertCourses } = require('../controllers/courses.controller');

// GET /api/courses
router.get('/all', getCourses);

// POST /api/courses
router.post('/addCourse', insertCourses);

module.exports = router;
