const { hashPassword, verifyPassword, signToken } = require("../auth");
const { getLastIDs } = require("../middleware/students_middleware");
const { insertUser } = require("../middleware/users_middleware");
const {
  db,
  query,
  crypto,
  moment,
  leadingZero,
  formatDateForInput,
  getDocumentTypeId,
} = require("../models/models");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const getAllDocuments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 40,
      name = "",
      sort = "recent",
      status = "",
      loadedIds = [],
    } = req.body;

    const parsedLimit = Math.max(parseInt(limit) || 40, 1);
    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    let where = "WHERE 1=1";
    const queryParams = [];

    if (name) {
      where += " AND s.name LIKE ?";
      queryParams.push(`%${name}%`);
    }

    if (status) {
      where += " AND d.status = ?";
      queryParams.push(status);
    }

    if (Array.isArray(loadedIds) && loadedIds.length > 0) {
      const safeIds = loadedIds.filter((id) => Number.isInteger(Number(id)));

      if (safeIds.length > 0) {
        where += ` AND s.id NOT IN (${safeIds.map(() => "?").join(",")})`;
        queryParams.push(...safeIds);
      }
    }

    let orderBy = "ORDER BY s.id DESC";

    switch (sort) {
      case "oldest":
        orderBy = "ORDER BY s.id ASC";
        break;
      case "name_asc":
        orderBy = "ORDER BY s.name ASC";
        break;
      case "name_desc":
        orderBy = "ORDER BY s.name DESC";
        break;
    }

    const sql = `
      SELECT 
        d.document_id,
        s.id AS student_id,
        s.name AS student_name,
        dt.category as type,
        d.file_name,
        d.file_size,
        d.file_url,
        d.file_type,
        d.uploaded_at,
        c.title AS course,
        d.status
      FROM documents AS d
      JOIN students AS s ON s.id = d.student_id
      JOIN document_types AS dt ON dt.id = d.document_type_id
      LEFT JOIN courses AS c ON c.id = d.course_id
      ${where}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const rows = await query(sql, [...queryParams, parsedLimit, offset]);

    // ================================
    // FORMATAÇÃO NO PADRÃO MOCK
    // ================================
    const formatted = rows.map((doc) => ({
      id: String(doc.document_id),
      name: doc.file_name,
      type: doc.type,
      student: doc.student_name,
      course: doc.course,
      uploadDate: new Date(doc.uploaded_at).toISOString().split("T")[0],
      size: doc.file_size,
      file: doc.file_url,
      file_type: doc.file_type.split("/")[1],
      status: doc.status || "validated",
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.log("Erro ao buscar documentos:", error);

    return res.status(500).json({
      success: false,
      message: "Erro ao buscar documentos",
      error: error.message,
    });
  }
};

module.exports = { getAllDocuments };
