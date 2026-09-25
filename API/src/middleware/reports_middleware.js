const { query } = require("../models/models");

// FINANCEIRO
const financialReports = async () => {
  const revenue = await query(`
    SELECT 
      DATE_FORMAT(created_at, '%Y-%m') as month,
      SUM(amount) as total
    FROM payments
    WHERE status = 'paid'
    GROUP BY month
    ORDER BY month DESC
  `);

  const overdue = await query(`
    SELECT COUNT(*) as total
    FROM payments
    WHERE status = 'pending' OR status = 'overdue'
  `);

  return { revenue, overdue };
};

// ACADÉMICO
const academicReports = async () => {
  const students = await query(`
    SELECT 
      status,
      COUNT(*) as total
    FROM students
    GROUP BY status
  `);

  courses = await query(`
    SELECT 
      c.title,
      COUNT(e.id) as enrollments
    FROM courses c
    LEFT JOIN classes cl ON cl.course_id = c.id
    LEFT JOIN enrollments e ON e.class_id = cl.id
    GROUP BY c.id
    ORDER BY enrollments DESC
  `);

  return { students, courses };
};

// MATRÍCULAS
const enrollmentReports = async () => {
  const byMonth = await query(`
    SELECT 
      MONTH(created_at) as month,
      COUNT(*) as total
    FROM enrollments
    GROUP BY month
    ORDER BY month
  `);

  const conversion = await query(`
    SELECT 
      COUNT(*) as total_students
    FROM students
  `);

  return { byMonth, conversion };
};

// OPERACIONAL
const operationalReports = async () => {
  const classes = await query(`
    SELECT 
      c.name,
      c.capacity,
      COUNT(e.id) as occupied
    FROM classes c
    LEFT JOIN enrollments e ON e.class_id = c.id
    GROUP BY c.id
  `);

  const instructors = await query(`
    SELECT 
      i.name,
      COUNT(c.id) as total_classes
    FROM instructors i
    LEFT JOIN classes c ON c.instructor_id = i.id
    GROUP BY i.id
  `);

  return { classes, instructors };
};

module.exports = {
  financialReports,
  academicReports,
  enrollmentReports,
  operationalReports,
};
