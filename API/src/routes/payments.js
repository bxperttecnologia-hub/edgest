const express = require("express");
const router = express.Router();
const pool = require("../db");
const {
  leadingZero,
  formatCurrency,
  statusColor,
  query,
  numeroPorExtenso,
  db,
} = require("../models/models");
const {
  getLasInvoiceID,
  generateInvoiceNumber,
} = require("../middleware/payment_middleware");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const XLSX = require("xlsx");
const QRCode = require("qrcode");

// GET /api/payments?status=overdue
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;

    // =========================================
    // BASE QUERY (ENROLLMENTS SEM PAYMENTS)
    // =========================================
    let q = `
      SELECT
        p.id as payment_id,
        e.id AS enrollment_id,
        p.status,
        e.created_at,

        s.id AS student_id,
        s.name AS student_name,
        s.student_number,

        c.title AS course_name,
        c.price AS course_price,

        cl.id AS class_id,

        i.id AS invoice_id,
        i.invoice_number,
        i.reference

      FROM enrollments e

      JOIN students s 
        ON s.id = e.student_id

      JOIN classes cl 
        ON cl.id = e.class_id

      JOIN courses c 
        ON c.id = cl.course_id

      JOIN invoices i
        ON i.enrollment_id = e.id

      JOIN payments p 
        ON p.enrollment_id = e.id
    `;

    const params = [];

    // =========================================
    // FILTER STATUS (ENROLLMENT, NÃO PAYMENT)
    // =========================================
    if (status) {
      q += ` AND e.status = ? `;
      params.push(status);
    }

    // =========================================
    // ORDER (ENROLLMENT DATE)
    // =========================================
    q += ` ORDER BY e.created_at DESC `;

    // =========================================
    // EXECUTE
    // =========================================
    const rows = await query(q, params);

    // =========================================
    // FORMAT RESPONSE
    // =========================================
    const formatted = rows.map((row) => ({
      id: row.payment_id,

      enrollmentId: row.enrollment_id,
      status: row.status || "pending",

      studentId: row.student_id,
      studentName: row.student_name,
      studentNumber: row.student_number || "—",

      course: row.course_name,
      amount: row.course_price,

      invoiceId: row.invoice_id,
      invoiceNumber: row.invoice_number,
      reference: row.reference,

      createdAt: row.created_at,
    }));

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: "internal_error",
    });
  }
});

// GET /api/payments?status=overdue
router.get("/enrollments", async (req, res) => {
  try {
    const { status } = req.query;

    // =========================================
    // BASE QUERY (ENROLLMENTS SEM PAYMENTS)
    // =========================================
    let q = `
      SELECT 
        e.id AS enrollment_id,
        e.status,
        e.created_at,

        s.id AS student_id,
        s.name AS student_name,
        s.student_number,

        c.title AS course_name,
        c.price AS course_price,

        cl.id AS class_id,

        i.id AS invoice_id,
        i.invoice_number

      FROM enrollments e

      INNER JOIN students s 
        ON s.id = e.student_id

      INNER JOIN classes cl 
        ON cl.id = e.class_id

      INNER JOIN courses c 
        ON c.id = cl.course_id

      LEFT JOIN invoices i
        ON i.enrollment_id = e.id

      WHERE NOT EXISTS (
        SELECT 1 
        FROM payments p 
        WHERE p.enrollment_id = e.id
      )
    `;

    const params = [];

    // =========================================
    // FILTER STATUS (ENROLLMENT, NÃO PAYMENT)
    // =========================================
    if (status) {
      q += ` AND e.status = ? `;
      params.push(status);
    }

    // =========================================
    // ORDER (ENROLLMENT DATE)
    // =========================================
    q += ` ORDER BY e.created_at DESC `;

    // =========================================
    // EXECUTE
    // =========================================
    const rows = await query(q, params);

    // =========================================
    // FORMAT RESPONSE
    // =========================================
    const formatted = rows.map((row) => ({
      id: row.enrollment_id,

      // paymentId: row.payment_id,
      enrollmentId: row.enrollment_id,
      status: "pending",

      studentId: row.student_id,
      studentName: row.student_name,
      studentNumber: row.student_number || "—",

      course: row.course_name,
      amount: row.course_price,

      invoiceId: row.invoice_id,
      invoiceNumber: row.invoice_number,

      createdAt: row.created_at,
    }));

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: "internal_error",
    });
  }
});

router.post("/pay", async (req, res) => {
  try {
    const {
      enrollment_id,
      student_id,
      amount,
      status,
      payment_date,
      method,
      transaction_reference,
    } = req.body;

    // =========================================
    // VALIDATION
    // =========================================
    if (!enrollment_id) {
      return res.status(400).json({
        success: false,
        message: "ID do pagamento inválido",
      });
    }

    await db.beginTransaction();

    // =========================================
    // BUSCAR PAGAMENTO
    // =========================================
    const [rows] = await query(
      `
      SELECT 
        p.id,
        p.enrollment_id,
        p.student_id,
        p.amount,
        p.status,
        c.title AS course_name
      FROM payments p
      JOIN enrollments e ON e.id = p.enrollment_id
      JOIN classes cl ON cl.id = e.class_id
      JOIN courses c ON c.id = cl.course_id
      WHERE p.enrollment_id = ? AND p.student_id = ?
      LIMIT 1
      `,
      [enrollment_id, student_id],
    );

    const payment = rows?.[0];

    if (payment) {
      await db.rollback();
      return res.status(404).json({
        success: false,
        message: "Já existe esta linha!",
      });
    }

    // =========================================
    // JÁ PAGO
    // =========================================
    if (payment?.status === "paid") {
      await db.rollback();
      return res.status(400).json({
        success: false,
        message: "Já foi paga",
      });
    }

    // =========================================
    // GERAR FACTURA
    // =========================================
    const { last_number, type, serie } = await generateInvoiceNumber();

    const tax = payment?.amount * 0.14 || amount * 0.14;
    const total = payment?.amount + tax || amount + tax;

    // =========================================
    // CRIAR FACTURA PRIMEIRO
    // =========================================
    await query(
      `
      INSERT INTO invoices (
        invoice_number,
        reference,
        type,
        student_id,
        enrollment_id,
        total_net,
        tax_total,
        discount_total,
        total_gross,
        status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        last_number,
        serie,
        type,
        payment?.student_id || student_id,
        payment?.enrollment_id || enrollment_id,
        payment?.amount || amount,
        tax,
        0,
        total,
        "paid",
      ],
    );

    const invoiceId = last_number;

    // =========================================
    // UPDATE PAYMENT
    // =========================================
    const insert = await query(
      `
        INSERT INTO payments(enrollment_id, student_id, amount, currency, method, status, transaction_reference, invoice_id, due_date, paid_at)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
      [
        enrollment_id,
        student_id,
        amount,
        "AOA",
        method || "offline",
        status,
        transaction_reference || null,
        invoiceId,
        payment_date || new Date(),
        payment_date || new Date(),
      ],
    );

    // =========================================
    // BUSCAR PAGAMENTO
    // =========================================

    const [rowsPayment] = await query(
      `
      SELECT
        p.id,
        p.enrollment_id,
        p.student_id,
        p.amount,
        p.status,
        c.title AS course_name
      FROM payments p
      JOIN enrollments e ON e.id = p.enrollment_id
      JOIN classes cl ON cl.id = e.class_id
      JOIN courses c ON c.id = cl.course_id
      WHERE p.id = ?
      LIMIT 1
      `,
      [insert.insertId],
    );

    const newPayments = rowsPayment?.[0];

    // =========================================
    // CRIAR ITEM DA FACTURA
    // =========================================
    await query(
      `
      INSERT INTO invoice_items (
        invoice_id,
        product_type,
        description,
        quantity,
        unit_price,
        tax_rate,
        tax_amount,
        total
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        invoiceId,
        "course",
        `Pagamento do curso de ${newPayments?.course_name}`,
        1,
        newPayments?.amount,
        14,
        tax,
        total,
      ],
    );

    await db.commit();
    const paymentId = insert.insertId;

    return res.json({
      success: true,
      message: "Pagamento processado com sucesso",
      paymentId,
      invoiceId,
    });
  } catch (err) {
    await db.rollback();

    console.error(err);

    return res.status(500).json({
      success: false,
      error: "internal_error",
    });
  } finally {
    // db.r.release();
  }
});

router.post("/generateInvoice/:id", async (req, res) => {
  try {
    const firstAndLastName = (name) => {
      if (!name) return null;

      let splited = name.trim().split(" ");
      let fistName = splited[0];
      let lastName = splited[splited.length - 1];

      return `${fistName} ${lastName}`;
    };

    const paymentId = parseInt(req.params.id, 10);

    if (isNaN(paymentId)) {
      return res.status(400).json({
        message: "ID inválido",
      });
    }

    // ======================================================
    // BUSCAR DADOS
    // ======================================================

    const q = `
      SELECT 
        i.invoice_number as id,
        p.amount,
        p.status,
        p.method,
        p.due_date,

        s.id as student_id,
        s.student_number,
        s.contact as phone,
        s.identity_number as nif,
        s.address,

        u.name as student_name,
        u.email,

        c.id as course_id,
        c.title as course,
        cl.name as class_code

      FROM payments p

      LEFT JOIN students s 
        ON p.student_id = s.id

      LEFT JOIN system_users u 
        ON s.email = u.email

      LEFT JOIN enrollments e 
        ON e.student_id = s.id

      LEFT JOIN classes cl 
        ON cl.id = e.class_id

      LEFT JOIN courses c 
        ON c.id = cl.course_id

      JOIN invoices i 
        ON i.student_id = s.id

      WHERE p.id = ?
    `;

    const rows = await query(q, [paymentId]);

    const payment = rows?.[0];

    if (!payment) {
      return res.status(404).json({
        message: "Pagamento não encontrado",
      });
    }

    // ======================================================
    // PASTA
    // ======================================================

    const invoicesDir = path.join(process.cwd(), "invoices");

    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, {
        recursive: true,
      });
    }

    const invoiceNumber = `FT ${new Date().getFullYear()}/${leadingZero(
      payment.id,
      6,
    )}`;

    const filename = `${invoiceNumber.replace(/\//g, "_")}.pdf`;

    const filePath = path.join(invoicesDir, filename);

    // ======================================================
    // PDF
    // ======================================================

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
    });

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ======================================================
    // CONFIGURAÇÕES
    // ======================================================

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    const left = 45;
    const right = 550;

    const gray = "#707070";
    const dark = "#222";
    const line = "#8C8C8C";

    // ======================================================
    // BACKGROUND
    // ======================================================

    doc.rect(0, 0, pageWidth, pageHeight).fill("#FFFFFF");

    // ======================================================
    // LOGO
    // ======================================================

    const logoPath = path.join(process.cwd(), "src/public/Logo.png");

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, left, 35, {
        width: 70,
      });
    }

    // ======================================================
    // EMPRESA
    // ======================================================

    const companyY = 120;

    doc
      .font("Helvetica-Bold")
      .fontSize(17)
      .fillColor("#000")
      .text("OLHAR INFINITO, LDA", left, companyY);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(gray)
      .text("Rua Principal, Luanda - Angola", left, companyY + 20);

    doc.text("Tel: +244 921 000 000", left, companyY + 34);

    doc.text("E-mail: financeiro@olharinfinito.ao", left, companyY + 48);

    doc.text("Contribuinte: 519078624", left, companyY + 62);

    // ======================================================
    // QR CODE
    // ======================================================

    const qrData = `
      Factura: ${invoiceNumber}
      Cliente: ${firstAndLastName(payment.student_name)}
      Total: ${payment.amount}
      NIF: 519078624
    `;

    const qrImage = await QRCode.toDataURL(qrData);

    doc.image(qrImage, 450, 50, {
      fit: [70, 70],
    });

    // ======================================================
    // CLIENTE
    // ======================================================

    const clientX = 457;
    const clientY = 120;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#000")
      .text("Exmo Sr.", clientX, clientY);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(gray)
      .text(
        firstAndLastName(payment.student_name) || "-",
        clientX,
        clientY + 14,
        {
          width: 140,
        },
      );

    doc.text(`NIF: ${payment.nif || "999999999"}`, clientX, clientY + 28);

    doc.text(payment.phone || "-", clientX, clientY + 42);

    // ======================================================
    // FACTURA
    // ======================================================

    let currentY = 220;

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(gray)
      .text("Original", left, currentY);

    currentY += 18;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#000")
      .text(`Factura n.º ${invoiceNumber}`, left, currentY);

    currentY += 25;

    // ======================================================
    // LINHA
    // ======================================================

    doc
      .moveTo(left, currentY)
      .lineTo(right, currentY)
      .strokeColor(line)
      .lineWidth(1.5)
      .stroke();

    currentY += 10;

    // ======================================================
    // DETALHES
    // ======================================================

    const col1 = left;
    const col2 = 145;
    const col3 = 365;
    const col4 = 455;

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(gray)
      .text("Cliente:", col1, currentY);

    doc
      .font("Helvetica-Bold")
      .fillColor("#444")
      .text(firstAndLastName(payment.student_name) || "-", col2, currentY);

    doc
      .font("Helvetica")
      .fillColor(gray)
      .text("Data de emissão:", col3, currentY);

    doc.text(new Date().toLocaleDateString("pt-PT"), col4, currentY);

    currentY += 18;

    doc.text("Contribuinte:", col1, currentY);

    doc.text(payment.nif || "999999999", col2, currentY);

    doc.text("Vencimento:", col3, currentY);

    doc.text(
      new Date(payment.due_date).toLocaleDateString("pt-PT"),
      col4,
      currentY,
    );

    currentY += 18;

    doc.text("Endereço:", col1, currentY);

    doc.text(payment.address || "Luanda - Angola", col2, currentY, {
      width: 180,
    });

    doc.text("Observações:", col3, currentY);

    doc.text("-", col4, currentY);

    currentY += 15;

    // ======================================================
    // TABELA
    // ======================================================

    doc
      .moveTo(left, currentY)
      .lineTo(right, currentY)
      .strokeColor(line)
      .lineWidth(1)
      .stroke();

    currentY += 10;

    // HEADER

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#555");

    doc.text("Código", 50, currentY);

    doc.text("Descrição", 135, currentY);

    doc.text("Preço Uni.", 320, currentY);

    doc.text("Qtd.", 395, currentY);

    doc.text("Taxa/IVA", 435, currentY);

    doc.text("Total", 515, currentY);

    currentY += 10;

    doc
      .moveTo(left, currentY)
      .lineTo(right, currentY)
      .strokeColor("#D2D2D2")
      .lineWidth(0.8)
      .stroke();

    currentY += 16;

    // ======================================================
    // ITEM
    // ======================================================

    const ivaRate = 0.14;

    const subtotal = Number(payment.amount);

    const iva = subtotal * ivaRate;

    const total = subtotal + iva;

    doc.font("Helvetica").fontSize(8.5).fillColor("#666");

    doc.text(`${payment.class_code}`, 50, currentY);

    doc.text(`Pagamento do curso - ${payment.course}`, 135, currentY, {
      width: 190,
    });

    doc.text(formatCurrency(subtotal), 310, currentY);

    doc.text("1", 400, currentY);

    doc.text("14%", 440, currentY);

    doc.text(formatCurrency(total), 475, currentY, {
      width: 60,
      align: "right",
    });

    currentY += 40;

    // ======================================================
    // DIVISÃO
    // ======================================================

    doc
      .moveTo(left, currentY)
      .lineTo(right, currentY)
      .strokeColor(line)
      .lineWidth(1.5)
      .stroke();

    currentY += 8;

    // ======================================================
    // TITULOS
    // ======================================================

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("#555")
      .text("Dados fiscais e bancários", left, currentY);

    doc.text("Sumário", 365, currentY);

    currentY += 16;

    // ======================================================
    // LINHAS
    // ======================================================

    doc
      .moveTo(left, currentY)
      .lineTo(340, currentY)
      .strokeColor("#C4C4C4")
      .lineWidth(0.8)
      .stroke();

    doc
      .moveTo(365, currentY)
      .lineTo(right, currentY)
      .strokeColor("#C4C4C4")
      .lineWidth(0.8)
      .stroke();

    currentY += 10;

    // ======================================================
    // ESQUERDA
    // ======================================================

    const leftStartY = currentY;

    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(gray)
      .text("Regime de IVA:", left, leftStartY);

    doc.text("Regime Geral", 145, leftStartY);

    doc.text("Bens e serviços:", left, leftStartY + 20);

    doc.text(
      "Os bens e serviços foram colocados à disposição\ndo adquirente na data do documento.",
      145,
      leftStartY + 20,
      {
        width: 180,
      },
    );

    doc.text("Dados bancários:", left, leftStartY + 62);

    doc.text("AO06 0006 0000 1234 5678 9012 3", 145, leftStartY + 62);

    // ======================================================
    // DIREITA
    // ======================================================

    const sy = leftStartY;

    doc.text("Total líquido:", 365, sy - 2);

    doc.text(formatCurrency(subtotal), 490, sy - 2, {
      width: 60,
      align: "right",
    });

    doc.text("Desconto:", 365, sy + 14);

    doc.text("0,00 Kz", 490, sy + 14, {
      width: 60,
      align: "right",
    });

    doc.text("Sem Imposto/IVA c.Desc.:", 365, sy + 28);

    doc.text(formatCurrency(subtotal), 490, sy + 28, {
      width: 60,
      align: "right",
    });

    doc.text("Imposto/IVA:", 365, sy + 42);

    doc.text(formatCurrency(iva), 490, sy + 42, {
      width: 60,
      align: "right",
    });

    doc.text("Retenção:", 365, sy + 56);

    doc.text("0,00 Kz", 490, sy + 56, {
      width: 60,
      align: "right",
    });

    // ======================================================
    // TOTAL FINAL
    // ======================================================

    doc
      .moveTo(365, sy + 72)
      .lineTo(545, sy + 72)
      .strokeColor("#555")
      .lineWidth(1)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#000")
      .text("Total:", 365, sy + 82);

    doc.text(formatCurrency(total), 450, sy + 82, {
      width: 100,
      align: "right",
    });

    doc
      .moveTo(365, sy + 100)
      .lineTo(545, sy + 100)
      .strokeColor("#555")
      .lineWidth(2)
      .stroke();

    // ======================================================
    // FOOTER
    // ======================================================

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#000")
      .text(
        "Factura processada pelo software certificado pela AGT | Nº XXXXXXXXXXX",
        255,
        815,
      );

    doc.text("1/2", 555, 815);

    // ======================================================
    // FINALIZAR
    // ======================================================

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    // ======================================================
    // URL PUBLICA
    // ======================================================

    const baseUrl = process.env.APP_URL || "http://127.0.0.1:3001";

    const publicUrl = `${baseUrl}/invoices/${filename}`;

    // ======================================================
    // TAMANHO DO FICHEIRO
    // ======================================================

    const stats = fs.statSync(filePath);

    // ======================================================
    // DOCUMENT TYPE ID
    // ======================================================

    // ajuste conforme tua tabela
    // exemplo:
    // 1 = Factura
    // 2 = Contrato

    const invoiceDocumentTypeId = 14;

    // ======================================================
    // UTILIZADOR LOGADO
    // ======================================================

    const uploadedBy = req.user?.id || null;

    // ======================================================
    // ANO ACADEMICO
    // ======================================================

    const academicYear = new Date().getFullYear();

    // ======================================================
    // SALVAR DOCUMENTO
    // ======================================================

    await query(`CALL sp_upsert_student_document(?,?,?,?,?,?,?,?,?,?)`, [
      payment.student_id || null,
      payment.course_id || null,
      uploadedBy,
      invoiceDocumentTypeId,
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
      invoiceUrl: publicUrl,
      fileName: filename,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Erro ao gerar factura",
    });
  }
});

router.get("/export", async (req, res) => {
  try {
    const date = new Date();

    const currentDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;

    // =========================================
    // BUSCAR DADOS
    // =========================================
    const payments = await query(`
      SELECT 
        p.id as payment_id,
        s.name as cliente,
        c.title as course,
        p.amount,
        p.status,
        p.due_date,
        p.paid_at
      FROM payments p
      JOIN students s ON s.id = p.student_id
      LEFT JOIN enrollments e ON e.id = p.enrollment_id
      JOIN classes cl ON cl.id = e.class_id
      JOIN courses c ON c.id = cl.course_id
      ORDER BY p.id DESC
    `);

    if (!payments || payments.length === 0) {
      return res.status(404).json({
        message: "Nenhum dado encontrado",
      });
    }

    // =========================================
    // FORMATAR DADOS (STATUS + VALORES)
    // =========================================
    const formatted = payments.map((p) => {
      let statusLabel = p.status;
      let statusColor = "";

      if (p.status === "paid") {
        statusLabel = "Pago";
        statusColor = "🟢 Pago";
      }

      if (p.status === "pending") {
        statusLabel = "Pendente";
        statusColor = "🟡 Pendente";
      }

      if (p.status === "overdue") {
        statusLabel = "Atrasado";
        statusColor = "🔴 Atrasado";
      }

      return {
        ID: p.payment_id,
        Cliente: p.cliente,
        Curso: p.course,

        "Valor (Kz)": Number(p.amount).toLocaleString("pt-AO", {
          style: "currency",
          currency: "AOA",
        }),

        Status: statusColor,

        "Data Vencimento": p.due_date
          ? new Date(p.due_date).toLocaleDateString("pt-PT")
          : "-",

        "Data Pagamento": p.paid_at
          ? new Date(p.paid_at).toLocaleDateString("pt-PT")
          : "-",
      };
    });

    // =========================================
    // CRIAR EXCEL
    // =========================================
    const worksheet = XLSX.utils.json_to_sheet(formatted);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatorio");

    // =========================================
    // BUFFER
    // =========================================
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // =========================================
    // HEADERS DOWNLOAD
    // =========================================
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=relatorio_${currentDate}.xlsx`,
    );

    return res.send(buffer);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Erro ao gerar relatorio financeiro!",
    });
  }
});

module.exports = router;
