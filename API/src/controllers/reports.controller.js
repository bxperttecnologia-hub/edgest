const { query } = require("../models/models.js");

const {
  financialReports,
  academicReports,
  enrollmentReports,
  operationalReports,
} = require("../middleware/reports_middleware.js");

async function getDashboardData() {
  try {
    // 1. Estudantes ativos
    const [students] = await query(`
      SELECT COUNT(*) as total 
      FROM students 
      WHERE status = 'active'
    `);

    // 2. Cursos ativos
    const [courses] = await query(`
      SELECT COUNT(*) as total 
      FROM courses 
      WHERE active = 1
    `);

    // 3. Receita mensal (pagamentos pagos)
    const [revenue] = await query(`
      SELECT SUM(amount) as total
      FROM payments
      WHERE status = 'paid'
      AND MONTH(created_at) = MONTH(CURRENT_DATE())
    `);

    // 4. Pagamentos pendentes
    const [pending] = await query(`
      SELECT COUNT(*) as total
      FROM payments
      WHERE status = 'pending'
    `);

    // 5. Pagamentos vencendo esta semana
    const [dueSoon] = await query(`
      SELECT COUNT(*) as total
      FROM payments
      WHERE status = 'pending'
      AND due_date BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY)
    `);

    // 6. Últimas atividades (pagamentos recentes)
    const activities = await query(`
      SELECT 
        p.status,
        s.name as student,
        p.amount,
        p.created_at
      FROM payments p
      JOIN students s ON s.id = p.student_id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    // 7. Próximas aulas
    const classes = await query(`
      SELECT 
        c.title as course,
        cl.schedule,
        cl.name as class_name
      FROM classes cl
      JOIN courses c ON c.id = cl.course_id
      WHERE cl.start_date >= CURRENT_DATE()
      ORDER BY cl.start_date ASC
      LIMIT 5
    `);

    return {
      students: students.total || 0,
      courses: courses.total || 0,
      revenue: revenue.total || 0,
      pendingPayments: pending.total || 0,
      dueSoon: dueSoon.total || 0,
      activities,
      classes,
    };
  } catch (err) {
    console.error(err);
    throw new Error("dashboard_error");
  }
}

// Financeiro
const getFinancialReports = async (req, res) => {
  try {
    const data = await financialReports();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "financial_error" });
  }
};

// Académico
const getAcademicReports = async (req, res) => {
  try {
    const data = await academicReports();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "academic_error" });
  }
};

// Matrículas
const getEnrollmentReports = async (req, res) => {
  try {
    const data = await enrollmentReports();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "enrollment_error" });
  }
};

// Operacional
const getOperationalReports = async (req, res) => {
  try {
    const data = await operationalReports();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "operational_error" });
  }
};

// EXPORT GENÉRICO
const exportReport = async (req, res) => {
  try {
    const { type } = req.params;

    let data;

    switch (type) {
      case "financial":
        data = await financialReports();
        break;
      case "academic":
        data = await academicReports();
        break;
      case "enrollment":
        data = await enrollmentReports();
        break;
      case "operational":
        data = await operationalReports();
        break;
      default:
        return res.status(400).json({ error: "invalid_type" });
    }

    return res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "export_error" });
  }
};

module.exports = {
  getDashboardData,
  getFinancialReports,
  getAcademicReports,
  getEnrollmentReports,
  getOperationalReports,
  exportReport,
};
