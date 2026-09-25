const express = require("express");
const router = express.Router();
const {
  getDashboardData,
  getFinancialReports,
  getAcademicReports,
  getEnrollmentReports,
  getOperationalReports,
  exportReport,
} = require("../controllers/reports.controller.js");

// Dashboard
router.get("/", async (req, res) => {
  try {
    const data = await getDashboardData();

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      error: "internal_error",
    });
  }
});

// Financeiro
router.get("/financial", getFinancialReports);

// Académico
router.get("/academic", getAcademicReports);

// Matrículas
router.get("/enrollment", getEnrollmentReports);

// Operacional
router.get("/operational", getOperationalReports);

// Export genérico
router.get("/export/:type", exportReport);

module.exports = router;
