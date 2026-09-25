const express = require("express");
const router = express.Router();
const pool = require("../db");
const { query, getLastId } = require("../models/models");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");
const QRCode = require("qrcode");

// POST /api/enrollments
// cria matrícula e gera parcelas
router.post("/add", async (req, res) => {
  try {
    const { student_id, class_id, enrollment_date } = req.body;

    if (!student_id || !class_id) {
      return res.status(400).json({
        success: false,
        message: "student_id e class_id são obrigatórios",
      });
    }

    const [rows] = await query("CALL sp_add_enrollment(?, ?, ?)", [
      student_id,
      class_id,
      enrollment_date || null,
    ]);

    const response = rows?.[0]?.[0];

    return res.json({
      success: response?.success ?? true,
      message: response?.message || "Matrícula criada com sucesso",
      data: response || null,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: "internal_error",
    });
  }
});

router.post("/addTeacher", async (req, res) => {
  try {
    const { name, email, contact } = req.body;

    const existing = await query("SELECT * FROM instructors WHERE email = ? ", [
      email,
    ]);

    if (existing.length > 0) {
      res
        .status(401)
        .json({ message: "Já existe um instrutor cadastrado com este email!" });
    } else {
      const result = await query(
        "INSERT INTO instructors(name, email, contact) VALUES(?, ?, ?)",
        [name, email, contact],
      );

      const insertId = result?.insertId;

      if (insertId) {
        res.status(200).json({ message: "Instrutor adicionado!" });
      } else {
        res.status(501).json({ message: "Erro ao adicionar instrutor" });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

router.post("/teachers", async (req, res) => {
  try {
    const { minId, limit = 20, offset = 0, name, email } = req.body;

    const filters = [];
    const params = [];

    if (minId) {
      filters.push("i.id >= ?");
      params.push(Number(minId));
    }

    if (name) {
      filters.push("LOWER(i.name) LIKE ?");
      params.push(`%${name.toLowerCase()}%`);
    }

    if (email) {
      filters.push("LOWER(i.email) LIKE ?");
      params.push(`%${email.toLowerCase()}%`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    // QUERY segura para MariaDB
    const sql = `
      SELECT 
        i.id,
        i.name,
        i.email,
        i.contact,
        COUNT(DISTINCT cl.id) AS total_classes,
        CONCAT('[', GROUP_CONCAT(DISTINCT JSON_OBJECT('name', c.title)), ']') AS courses
      FROM instructors i
      LEFT JOIN classes cl ON cl.instructor_id = i.id
      LEFT JOIN courses c ON c.id = cl.course_id
      ${whereClause}
      GROUP BY i.id, i.name, i.email, i.contact
      ORDER BY i.id ASC
      LIMIT ?
      OFFSET ?
    `;

    params.push(Number(limit));
    params.push(Number(offset));

    const result = await query(sql, params);

    // parse seguro do JSON retornado pelo MariaDB
    const data = result.map((row) => {
      let courses = [];
      try {
        courses = row.courses ? JSON.parse(row.courses) : [];
      } catch (err) {
        courses = [];
      }

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        contact: row.contact,
        total_classes: row.total_classes,
        status: row.total_classes > 0 ? "active" : "inactive",
        courses: courses.map((c) => c.name).join(", "),
      };
    });

    return res.status(200).json({
      data,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        returned: data.length,
      },
    });
  } catch (error) {
    console.error("GET /teachers error:", error);
    return res.status(500).json({ error: "internal_error" });
  }
});

router.get("/classes", async (req, res) => {
  try {
    const sql = `
      SELECT 
        cl.id,
        cl.name as code,
        c.title AS course,
        i.name AS instructor,
        cl.schedule,
        cl.start_date,
        cl.end_date,
        IFNULL(e.enrolled, 0) AS enrolled,
        cl.capacity,
        c.price,
        c.payment_parcelas,
        cl.status
      FROM classes cl
      LEFT JOIN courses c ON c.id = cl.course_id
      LEFT JOIN instructors i ON i.id = cl.instructor_id
      LEFT JOIN (
        SELECT class_id, COUNT(*) AS enrolled
        FROM enrollments
        GROUP BY class_id
      ) e ON e.class_id = cl.id
      LIMIT 100;
    `;

    const result = await query(sql, []);

    if (result.length > 0) {
      const data = [];
      result.map((r) => {
        data.push({
          ...r,
          status: r?.status ? r.status : "upcoming",
        });
      });
      res.status(200).json(data);
    } else {
      res.status(404).json([]);
    }
  } catch (error) {
    console.error("GET /teachers error:", error);
    return res.status(500).json({ error: "internal_error" });
  }
});

router.post("/addClass", async (req, res) => {
  try {
    const {
      course_id,
      instructor_id,
      capacity,
      start_date,
      end_date,
      name,
      schedule,
    } = req.body;

    if (
      (!course_id &&
        !instructor_id &&
        !capacity &&
        !start_date &&
        !end_date &&
        !name,
      !schedule)
    ) {
      res.status(401).json({ message: "Preencha todos os campos!" });
    } else {
      const lastId = await getLastId("classes", "id");

      const existis = await query("SELECT * FROM classes WHERE course_id = ?", [
        name,
      ]);
      let code = "";

      if (existis) {
        code = name + "-" + Number(lastId + 1);
      } else {
        code = name + "-" + 1;
      }

      const result = await pool.query(
        "INSERT INTO classes (course_id, name, start_date, end_date, capacity, instructor_id, schedule) VALUES(?, ?, ?, ?, ?, ?, ?)",
        [
          course_id,
          code,
          start_date,
          end_date,
          capacity,
          instructor_id,
          schedule,
        ],
      );

      if (result) {
        res.status(200).json({ message: "Turma adicionada com sucesso!" });
      } else {
        res.status(501).json({ message: "Erro ao adicionar turma!" });
      }
    }
  } catch (error) {
    console.error("GET /teachers error:", error);
    return res.status(500).json({ error: "internal_error" });
  }
});

router.get("/studentEnrollment/:id", async (req, res) => {
  try {
    const studentId = Number(req.params.id);

    // =========================================
    // VALIDATION
    // =========================================
    if (!studentId || isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: "ID do estudante inválido",
      });
    }

    // =========================================
    // QUERY
    // =========================================
    const sql = `
      SELECT 
        e.id,
        c.code,
        c.title AS course,
        cl.name AS class_name,
        e.enrollment_date as created_at,
        e.status
      FROM enrollments e
      INNER JOIN classes cl ON cl.id = e.class_id
      INNER JOIN courses c ON c.id = cl.course_id
      WHERE e.student_id = ?
      ORDER BY e.id DESC
    `;

    const result = await query(sql, [studentId]);

    // =========================================
    // RESPONSE
    // =========================================
    return res.status(200).json({
      success: true,
      data: result || [],
    });
  } catch (error) {
    console.error("GET /studentEnrollment error:", error);

    return res.status(500).json({
      success: false,
      error: "internal_error",
    });
  }
});

// API
router.delete("/delete-student-enrollment/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID da inscrição é obrigatório!",
      });
    }

    const sqlDelete = `DELETE FROM enrollments WHERE id = ?`;
    const result = await query(sqlDelete, [id]);

    if (result.affectedRows > 0) {
      return res.status(200).json({
        success: true,
        message: "Inscrição deletada com sucesso!",
      });
    }

    return res.status(404).json({
      success: false,
      message: "Inscrição não encontrada!",
    });
  } catch (error) {
    console.error("DELETE /delete-student-enrollment error:", error);

    return res.status(500).json({
      success: false,
      error: "internal_error",
    });
  }
});

router.post("/generateCertificate/:id", async (req, res) => {
  try {
    // ======================================================
    // VALIDAR ID
    // ======================================================

    const enrollmentId = parseInt(req.params.id, 10);

    if (isNaN(enrollmentId)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    // ======================================================
    // BUSCAR DADOS
    // ======================================================

    const q = `
      SELECT
        e.id AS enrollment_id,
        e.final_grade,
        e.enrollment_date as start_date,
        e.end_date,
        c.duration_hours as total_hours,

        s.id AS student_id,
        s.student_number,
        s.identity_number,
        s.address,

        s.name AS student_name,

        c.id AS course_id,
        c.title AS course_name,

        cl.name AS class_name

      FROM enrollments e

      INNER JOIN students s
        ON s.id = e.student_id

      INNER JOIN classes cl
        ON cl.id = e.class_id

      INNER JOIN courses c
        ON c.id = cl.course_id

      WHERE e.id = ?
    `;

    const rows = await query(q, [enrollmentId]);

    const data = rows?.[0];

    if (!data) {
      return res.status(404).json({
        message: "Inscrição não encontrada",
      });
    }

    // ======================================================
    // PASTA
    // ======================================================

    const certificatesDir = path.join(process.cwd(), "certificates");

    if (!fs.existsSync(certificatesDir)) {
      fs.mkdirSync(certificatesDir, {
        recursive: true,
      });
    }

    // ======================================================
    // NOME FICHEIRO
    // ======================================================

    const certificateNumber = `CERT-${new Date().getFullYear()}-${String(
      data.enrollment_id,
    ).padStart(6, "0")}`;

    const filename = `${certificateNumber}.pdf`;

    const filePath = path.join(certificatesDir, filename);

    // ======================================================
    // PDF
    // ======================================================

    const doc = new PDFDocument({
      layout: "landscape",
      size: "A4",
      margin: 0,
    });

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ======================================================
    // CONFIG
    // ======================================================

    const pageWidth = 841.89;
    const pageHeight = 595.28;

    const blue = "#2D83C5";
    const dark = "#333333";

    // ======================================================
    // BACKGROUND
    // ======================================================

    doc.rect(0, 0, pageWidth, pageHeight).fill("#FFFFFF");

    // ======================================================
    // MOLDURA
    // ======================================================

    doc
      .lineWidth(4)
      .strokeColor(blue)
      .rect(30, 30, pageWidth - 60, pageHeight - 60)
      .stroke();

    doc
      .lineWidth(1)
      .strokeColor(blue)
      .rect(38, 38, pageWidth - 76, pageHeight - 76)
      .stroke();

    // ======================================================
    // LOGO
    // ======================================================

    const logoPath = path.join(process.cwd(), "src/public/Logo.png");

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 60, 70, {
        width: 90,
      });
    }

    // ======================================================
    // TITULO INSTITUIÇÃO
    // ======================================================

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .fillColor(dark)
      .text("CENTRO DE FORMAÇÃO PROFISSIONAL", 0, 85, {
        align: "center",
      });

    doc.font("Helvetica-Bold").fontSize(20).text("OLHAR INFINITO", 0, 120, {
      align: "center",
    });

    // ======================================================
    // CERTIFICADO
    // ======================================================

    doc
      .font("Times-Bold")
      .fontSize(42)
      .fillColor(blue)
      .text("CERTIFICADO", 0, 175, {
        align: "center",
      });

    // ======================================================
    // TEXTO
    // ======================================================

    const textY = 270;

    doc.font("Times-Roman").fontSize(18).fillColor("#444444");

    doc.text(
      "O Centro de Formação Profissional Olhar Infinito certifica que",
      90,
      textY,
      {
        width: 660,
        align: "center",
      },
    );

    // ======================================================
    // NOME ALUNO
    // ======================================================

    doc
      .moveDown(0.8)
      .font("Times-Bold")
      .fontSize(24)
      .fillColor(blue)
      .text(data.student_name.toUpperCase(), {
        align: "center",
      });

    // ======================================================
    // BI
    // ======================================================

    doc
      .moveDown(0.6)
      .font("Times-Roman")
      .fontSize(17)
      .fillColor("#444444")
      .text(`Portador(a) do B.I nº ${data.identity_number || "-"}`, {
        align: "center",
      });

    // ======================================================
    // CURSO
    // ======================================================

    doc
      .moveDown(1)
      .font("Times-Roman")
      .fontSize(18)
      .text(`Concluiu com aproveitamento o curso de`, {
        align: "center",
      });

    doc
      .moveDown(0.3)
      .font("Times-Bold")
      .fontSize(24)
      .fillColor(blue)
      .text(data.course_name.toUpperCase(), {
        align: "center",
      });

    // ======================================================
    // DETALHES
    // ======================================================

    const startDate = new Date(data.start_date).toLocaleDateString("pt-PT");

    const endDate = new Date(data.end_date).toLocaleDateString("pt-PT");

    doc
      .moveDown(1)
      .font("Times-Roman")
      .fontSize(17)
      .fillColor("#444444")
      .text(
        `Realizado no período de ${startDate} à ${endDate}, com carga horária de ${data.total_hours || 0} horas, tendo obtido a classificação de ${data.final_grade || 0} valores.`,
        100,
        doc.y,
        {
          width: 640,
          align: "center",
          lineGap: 6,
        },
      );

    // ======================================================
    // DATA
    // ======================================================

    const today = new Date().toLocaleDateString("pt-PT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    doc
      .font("Times-Bold")
      .fontSize(16)
      .fillColor("#444444")
      .text(`Luanda, ${today}`, 0, 455, {
        align: "center",
      });

    // ======================================================
    // ASSINATURA
    // ======================================================

    doc
      .moveTo(310, 520)
      .lineTo(530, 520)
      .strokeColor("#777")
      .lineWidth(1)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#444")
      .text("A Direcção do Centro", 0, 528, {
        align: "center",
      });

    // ======================================================
    // SELO / MARCA D'ÁGUA
    // ======================================================

    doc
      .opacity(0.08)
      .font("Helvetica-Bold")
      .fontSize(90)
      .fillColor(blue)
      .rotate(-25, {
        origin: [420, 320],
      })
      .text("OLHAR INFINITO", 180, 260);

    doc.opacity(1);

    // ======================================================
    // QR CODE
    // ======================================================

    const qrData = `
      Certificado: ${certificateNumber}
      Nome: ${data.student_name}
      Curso: ${data.course_name}
    `;

    const qrImage = await QRCode.toDataURL(qrData);

    doc.image(qrImage, 680, 430, {
      fit: [90, 90],
    });

    // ======================================================
    // RODAPÉ
    // ======================================================

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#666")
      .text(`Certificado Nº ${certificateNumber}`, 50, 560);

    // ======================================================
    // FINALIZAR
    // ======================================================

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    // ======================================================
    // URL
    // ======================================================

    const baseUrl = process.env.APP_URL || "http://127.0.0.1:3001";

    const publicUrl = `${baseUrl}/certificates/${filename}`;

    // ======================================================
    // TAMANHO
    // ======================================================

    const stats = fs.statSync(filePath);

    // ======================================================
    // DOCUMENT TYPE
    // ======================================================

    const certificateDocumentTypeId = 15;

    // ======================================================
    // USER
    // ======================================================

    const uploadedBy = req.user?.id || null;

    // ======================================================
    // ANO
    // ======================================================

    const academicYear = new Date().getFullYear();

    // ======================================================
    // SALVAR DOCUMENTO
    // ======================================================

    await query(`CALL sp_upsert_student_document(?,?,?,?,?,?,?,?,?,?)`, [
      data.student_id,
      data.course_id,
      uploadedBy,
      certificateDocumentTypeId,
      academicYear,
      filename,
      "application/pdf",
      stats.size,
      publicUrl,
      "ACTIVE",
    ]);

    // ======================================================
    // RESPOSTA
    // ======================================================

    return res.json({
      success: true,
      certificateUrl: publicUrl,
      fileName: filename,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Erro ao gerar certificado",
    });
  }
});

module.exports = router;
