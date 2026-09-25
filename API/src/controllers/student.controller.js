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

const addStudents = async (req, res) => {
  try {
    const {
      name,
      email,
      nationality,
      birth_date,
      identity_type,
      identity_number,
      identity_valid_data,
      address,
      contact,
    } = req.body;

    const photoFile = req.files?.photo?.[0] || null;
    const documentFile = req.files?.document?.[0] || null;

    // =========================================
    // VALIDATION
    // =========================================
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios ausentes",
      });
    }

    // =========================================
    // DUPLICATE CHECK
    // =========================================
    /*   const existing = await query(
       "SELECT id FROM students WHERE email = ? LIMIT 1",
       [email],
     );

     if (existing.length > 0) {
       return res.status(409).json({
         success: false,
         message: "Já existe estudante com este email",
       });
     }
       */

    // =========================================
    // STUDENT NUMBER
    // =========================================
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0");

    const lastStudent = await query(
      "SELECT student_number FROM students ORDER BY id DESC LIMIT 1",
    );

    let seq = 1;

    if (lastStudent?.length && lastStudent[0]?.student_number) {
      const last = String(lastStudent[0].student_number);
      const lastYear = parseInt(last.slice(3, 7));
      const lastSeq = parseInt(last.slice(0, 3));

      seq = lastYear === year ? lastSeq + 1 : 1;
    }

    const student_number = parseInt(
      `${String(seq).padStart(3, "0")}${year}${month}`,
    );

    // =========================================
    // FILE PATHS
    // =========================================
    const photoPath = photoFile ? `/uploads/${photoFile.filename}` : null;
    const documentPath = documentFile
      ? `/uploads/${documentFile.filename}`
      : null;

    // =========================================
    // INSERT STUDENT
    // =========================================
    const result = await query(
      `INSERT INTO students (
        student_number,
        name,
        email,
        nationality,
        birth_date,
        identity_type,
        identity_number,
        identity_valid_data,
        address,
        contact,
        photo,
        document
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        student_number,
        name,
        email,
        nationality,
        birth_date,
        identity_type,
        identity_number,
        identity_valid_data,
        address,
        contact,
        photoPath,
        documentPath,
      ],
    );

    const studentId = result.insertId;

    // =========================================
    // USER LOGIN
    // =========================================
    const firstName = name.split(" ")[0]?.toLowerCase() || "user";
    const password = `${firstName}_${String(studentId).padStart(4, "0")}`;

    await insertUser(name, email, password, "student");

    // =========================================
    // DOCUMENT TYPE
    // =========================================
    const getDocumentTypeId = (type) => {
      if (type === "BI") return 1;
      if (type === "Passaporte") return 4;
      return 11;
    };

    const documentTypeId = getDocumentTypeId(identity_type);

    // =========================================
    // UPSERT DOCUMENT (DOCUMENTO)
    // =========================================
    if (documentFile) {
      await query(`CALL sp_upsert_student_document(?,?,?,?,?,?,?,?,?,?)`, [
        studentId,
        null,
        req.user?.id || null,
        documentTypeId,
        year,
        documentFile.filename,
        documentFile.mimetype,
        documentFile.size,
        documentPath,
        "ACTIVE",
      ]);
    }

    // =========================================
    // UPSERT DOCUMENT (FOTO)
    // =========================================
    if (photoFile) {
      await query(`CALL sp_upsert_student_document(?,?,?,?,?,?,?,?,?,?)`, [
        studentId,
        null,
        req.user?.id || null,
        11,
        year,
        photoFile.filename,
        photoFile.mimetype,
        photoFile.size,
        photoPath,
        "ACTIVE",
      ]);
    }

    // =========================================
    // RESPONSE
    // =========================================
    const student = await query("SELECT * FROM students WHERE id = ?", [
      studentId,
    ]);

    return res.status(201).json({
      success: true,
      message: "Estudante criado com sucesso!",
      student: student[0],
      credentials: { email, password },
    });
  } catch (err) {
    console.error("addStudents error:", err);

    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
};

const getStudents = async (req, res) => {
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

    let where = " WHERE 1=1 ";
    const queryParams = [];

    // 🔎 FILTER NAME
    if (name) {
      where += " AND s.name LIKE ? ";
      queryParams.push(`%${name}%`);
    }

    // 🔎 FILTER STATUS (ENROLLMENT)
    if (status) {
      where += " AND e.status = ? ";
      queryParams.push(status);
    }

    // 🔎 EXCLUDE LOADED IDS (SAFE)
    if (Array.isArray(loadedIds) && loadedIds.length > 0) {
      const safeIds = loadedIds.filter((id) => Number.isInteger(Number(id)));

      if (safeIds.length > 0) {
        where += ` AND s.id NOT IN (${safeIds.map(() => "?").join(",")}) `;
        queryParams.push(...safeIds);
      }
    }

    // 🔀 ORDER
    let orderBy = " ORDER BY s.id DESC ";

    switch (sort) {
      case "oldest":
        orderBy = " ORDER BY s.id ASC ";
        break;
      case "name_asc":
        orderBy = " ORDER BY s.name ASC ";
        break;
      case "name_desc":
        orderBy = " ORDER BY s.name DESC ";
        break;
    }

    // ======================================================
    // MAIN QUERY
    // ======================================================
    const sql = `
      SELECT 
        s.id,
        s.student_number,
        s.name,
        s.email,
        s.birth_date,
        s.address,
        s.nationality,
        s.identity_type,
        s.identity_number,
        s.identity_valid_data,
        s.contact,
        s.photo,
        s.document,
        c.title AS course,
        e.status AS enrollment_status
      FROM students s
      LEFT JOIN enrollments e ON e.student_id = s.id
      LEFT JOIN classes cl ON cl.id = e.class_id
      LEFT JOIN courses c ON c.id = cl.course_id
      ${where}
      ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const rows = await query(sql, [...queryParams, parsedLimit, offset]);

    // ======================================================
    // GROUP STUDENTS
    // ======================================================
    const grouped = {};

    rows.forEach((row) => {
      if (!grouped[row.id]) {
        grouped[row.id] = {
          id: row.id,
          student_number: row.student_number,
          name: row.name,
          email: row.email,
          birth_date: row.birth_date,
          address: row.address,
          nationality: row.nationality,
          identity_type: row.identity_type,
          identity_number: row.identity_number,
          identity_valid_data: row.identity_valid_data,
          contact: row.contact,
          photo: row.photo,
          document: row.document,
          courses: [],
        };
      }

      if (row.course) {
        grouped[row.id].courses.push({
          title: row.course,
          status: row.enrollment_status || "active",
        });
      }
    });

    const students = Object.values(grouped);

    // ======================================================
    // COUNT (CONSISTENTE COM JOIN)
    // ======================================================
    const countSql = `
      SELECT COUNT(DISTINCT s.id) AS total
      FROM students s
      LEFT JOIN enrollments e ON e.student_id = s.id
      LEFT JOIN classes cl ON cl.id = e.class_id
      LEFT JOIN courses c ON c.id = cl.course_id
      ${where}
    `;

    const countResult = await query(countSql, queryParams);
    const total = countResult?.[0]?.total || 0;

    return res.status(200).json({
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit),
      students,
    });
  } catch (err) {
    console.error("Erro ao listar estudantes:", err);
    return res.status(500).json({ error: "internal_error" });
  }
};

const getStudentErrollments = async (req, res) => {
  try {
    const { id } = req.params;
    const sqlSelect =
      "SELECT cl.id, c.code, c.title FROM enrollments as e JOIN classes as cl ON cl.id = e.class_id JOIN courses as c ON c.id = cl.course_id JOIN students as s ON s.id = e.student_id";

    const result = await query(sqlSelect, [id]);

    if (result) {
      // console.log(result)
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Nenhum dados encontrado!" });
    }
  } catch (error) {
    console.error("Erro ao pegar classes: ", err);
    return res.status(500).json({ error: "internal_error" });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      nationality,
      birth_date,
      identity_type,
      identity_number,
      identity_valid_data,
      address,
      contact,
      alternative_email,
      alternative_phone,
    } = req.body;

    // ======================================================
    // FILES
    // ======================================================
    const photoFile = req.files?.photo?.[0] || null;
    const documentFile = req.files?.document?.[0] || null;

    // ======================================================
    // VALIDATE ID
    // ======================================================
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID do estudante é obrigatório.",
      });
    }

    // ======================================================
    // GET CURRENT STUDENT
    // ======================================================
    const existing = await query(
      "SELECT * FROM students WHERE id = ? LIMIT 1",
      [id],
    );

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: "Estudante não encontrado.",
      });
    }

    const currentStudent = existing[0];

    // ======================================================
    // DUPLICATE CHECK
    // ======================================================
    // const duplicate = await query(
    //   `
    //     SELECT id
    //     FROM students
    //     WHERE (email = ? OR identity_number = ?)
    //     AND id != ?
    //     LIMIT 1
    //   `,
    //   [email, identity_number, id],
    // );

    // if (duplicate.length > 0) {
    //   return res.status(409).json({
    //     success: false,
    //     message: "Já existe outro estudante com este email ou documento.",
    //   });
    // }

    // ======================================================
    // KEEP OLD FILES IF NOT UPDATED
    // ======================================================
    const photoPath = photoFile
      ? `http://127.0.0.1:3001/uploads/${photoFile.filename}`
      : currentStudent.photo;

    const documentPath = documentFile
      ? `http://127.0.0.1:3001/uploads/${documentFile.filename}`
      : currentStudent.document;

    // ======================================================
    // BUILD UPDATE OBJECT
    // ======================================================
    const updatedFields = {
      name,
      email,
      nationality,
      birth_date,
      identity_type,
      identity_number,
      identity_valid_data,
      address,
      contact,
      alternative_email,
      alternative_phone,
      photo: photoPath,
      document: documentPath,
    };

    // REMOVE UNDEFINED
    Object.keys(updatedFields).forEach((key) => {
      if (updatedFields[key] === undefined) {
        delete updatedFields[key];
      }
    });

    // ======================================================
    // UPDATE STUDENT
    // ======================================================
    await query("UPDATE students SET ? WHERE id = ?", [updatedFields, id]);

    // ======================================================
    // UPSERT DOCUMENT (IMPORTANTE)
    // ======================================================

    if (documentFile) {
      const documentTypeId = getDocumentTypeId(identity_type);

      await query(`CALL sp_upsert_student_document(?,?,?,?,?,?,?,?,?)`, [
        id,
        req.user?.id || null,
        "1",
        new Date().getFullYear(),
        documentFile.filename,
        documentFile.mimetype,
        documentFile.size,
        documentPath,
        "ACTIVE",
      ]);
    }

    if (photoFile) {
      await query(`CALL sp_upsert_student_document(?,?,?,?,?,?,?,?,?)`, [
        id,
        req.user?.id || null,
        "11",
        new Date().getFullYear(),
        photoFile.filename,
        photoFile.mimetype,
        photoFile.size,
        photoPath,
        "ACTIVE",
      ]);
    }

    // ======================================================
    // RESPONSE UPDATED STUDENT
    // ======================================================
    const updatedStudent = await query(
      "SELECT * FROM students WHERE id = ? LIMIT 1",
      [id],
    );

    return res.status(200).json({
      success: true,
      message: "Estudante atualizado com sucesso!",
      student: updatedStudent[0],
    });
  } catch (err) {
    console.error("Erro ao atualizar estudante:", err);

    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor.",
      error: err.message,
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.status(400).json({ error: "ID do estudante é obrigatório." });

    // 🔹 Verifica se o estudante existe
    const rows = await query("SELECT * FROM students WHERE id = ?", [id]);
    if (!rows.length)
      return res.status(404).json({ error: "Estudante não encontrado." });

    const data = rows[0];

    // 🔹 Remove estudante (e opcionalmente o usuário vinculado)

    // Se quiser remover o usuário vinculado (caso exista)
    await db.query("CALL sp_delete_student_full(?, ?)", [
      data?.id,
      data?.email,
    ]);

    res.json({
      message: "Estudante removido com sucesso!",
      deletedId: id,
    });
  } catch (err) {
    console.error("Erro ao excluir estudante:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

const generateContract = async (req, res) => {
  try {
    const studentId = parseInt(req.params.id, 10);

    if (isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: "ID inválido",
      });
    }

    // ======================================================
    // UTILIZADOR LOGADO
    // ======================================================

    const uploadedBy = req.user?.id || null;

    // ======================================================
    // BUSCAR DADOS
    // ======================================================

    const q = `
      SELECT
        s.id,
        s.student_number,
        s.identity_number,
        s.contact,
        s.address,

        u.name,
        u.email,

        c.id as course_id,
        c.title as course

      FROM students s

      LEFT JOIN system_users u
        ON u.email = s.email

      LEFT JOIN enrollments e
        ON e.student_id = s.id

      LEFT JOIN classes cl
        ON cl.id = e.class_id

      LEFT JOIN courses c
        ON c.id = cl.course_id

      WHERE s.id = ?
    `;

    const rows = await query(q, [studentId]);

    const student = rows?.[0];

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Estudante não encontrado",
      });
    }

    // ======================================================
    // PASTA RAIZ
    // ======================================================

    const contractsRoot = path.join(process.cwd(), "contracts");

    if (!fs.existsSync(contractsRoot)) {
      fs.mkdirSync(contractsRoot, {
        recursive: true,
      });
    }

    // ======================================================
    // PASTA ANO
    // ======================================================

    const year = new Date().getFullYear();

    const yearDir = path.join(contractsRoot, String(year));

    if (!fs.existsSync(yearDir)) {
      fs.mkdirSync(yearDir, {
        recursive: true,
      });
    }

    // ======================================================
    // PASTA ESTUDANTE
    // ======================================================

    const studentDir = path.join(
      yearDir,
      String(student.student_number || student.id),
    );

    if (!fs.existsSync(studentDir)) {
      fs.mkdirSync(studentDir, {
        recursive: true,
      });
    }

    // ======================================================
    // NOME UNICO
    // ======================================================

    const timestamp = Date.now();

    const filename = `CONTRATO_${timestamp}.pdf`;

    const filePath = path.join(studentDir, filename);

    // ======================================================
    // REMOVER EXISTENTE
    // ======================================================

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // ======================================================
    // PDF
    // ======================================================

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
      autoFirstPage: true,
    });

    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // ======================================================
    // CONFIG
    // ======================================================

    const gray = "#666666";
    const dark = "#111111";
    const line = "#D0D0D0";

    // ======================================================
    // LOGO
    // ======================================================

    const logoPath = path.join(process.cwd(), "src/public/Logo.png");

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, {
        width: 70,
      });
    }

    // ======================================================
    // TITULO
    // ======================================================

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fillColor(dark)
      .text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE FORMAÇÃO", 50, 130, {
        align: "center",
      });

    // ======================================================
    // LINHA
    // ======================================================

    doc
      .moveTo(50, 165)
      .lineTo(545, 165)
      .strokeColor(line)
      .lineWidth(1)
      .stroke();

    // ======================================================
    // PARTES
    // ======================================================

    let y = 190;

    doc.font("Helvetica").fontSize(11).fillColor(dark).text("ENTRE:", 50, y);

    y += 30;

    // ======================================================
    // CENTRO
    // ======================================================

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .text("1. CENTRO DE FORMAÇÃO", 50, y);

    y += 25;

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(gray)
      .text("Nome: OLHAR INFINITO, LDA", 50, y);

    y += 18;

    doc.text("NIF: 519078624", 50, y);

    y += 18;

    doc.text("Endereço: Luanda - Angola", 50, y);

    y += 35;

    // ======================================================
    // FORMANDO
    // ======================================================

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(dark)
      .text("2. FORMANDO(A)", 50, y);

    y += 25;

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(gray)
      .text(`Nome Completo: ${student.name || "-"}`, 50, y);

    y += 18;

    doc.text(`NIF: ${student.identity_number || "999999999"}`, 50, y);

    y += 18;

    doc.text(`Telefone: ${student.contact || "-"}`, 50, y);

    y += 18;

    doc.text(`Curso: ${student.course || "-"}`, 50, y);

    y += 18;

    doc.text(`Endereço: ${student.address || "-"}`, 50, y);

    y += 35;

    // ======================================================
    // INTRODUÇÃO
    // ======================================================

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(dark)
      .text(
        "As partes acima identificadas celebram o presente Contrato de Prestação de Serviços de Formação, que se regerá pelas cláusulas seguintes:",
        50,
        y,
        {
          width: 500,
          align: "justify",
          lineGap: 5,
        },
      );

    y += 60;

    // ======================================================
    // CLAUSULAS
    // ======================================================

    const addClause = (title, body) => {
      const titleHeight = 24;

      const bodyHeight = doc.heightOfString(body, {
        width: 500,
        align: "justify",
        lineGap: 5,
      });

      const neededHeight = titleHeight + bodyHeight + 40;

      // NOVA PAGINA

      if (y + neededHeight > 740) {
        doc.addPage();

        y = 60;
      }

      // TITULO

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .fillColor(dark)
        .text(title, 50, y, {
          width: 500,
        });

      y += 24;

      // CORPO

      doc.font("Helvetica").fontSize(10).fillColor("#333").text(body, 50, y, {
        width: 500,
        align: "justify",
        lineGap: 5,
      });

      y += bodyHeight + 30;
    };

    // ======================================================
    // CLAUSULAS
    // ======================================================

    addClause(
      "CLÁUSULA 1 — OBRIGAÇÕES DO CENTRO DE FORMAÇÃO",
      `
O CENTRO DE FORMAÇÃO compromete-se a:

a) Ministrar a formação conforme o programa apresentado;
b) Disponibilizar formadores qualificados;
c) Fornecer material didático essencial ao curso;
d) Garantir condições adequadas de ensino;
e) Emitir certificado de conclusão ao FORMANDO que cumprir os requisitos do curso.
`,
    );

    addClause(
      "CLÁUSULA 2 — OBRIGAÇÕES DO FORMANDO",
      `
O FORMANDO compromete-se a:

a) Frequentar regularmente as aulas;
b) Cumprir os horários estabelecidos;
c) Efetuar os pagamentos acordados;
d) Respeitar os regulamentos internos do CENTRO DE FORMAÇÃO;
e) Preservar os equipamentos e património da instituição.
`,
    );

    addClause(
      "CLÁUSULA 3 — DESISTÊNCIA E REEMBOLSO",
      `
a) Em caso de desistência pelo FORMANDO, os valores já pagos não serão reembolsados, salvo acordo escrito entre as partes.

b) Caso o CENTRO DE FORMAÇÃO cancele definitivamente o curso sem substituição equivalente, os valores pagos relativos às aulas não ministradas deverão ser reembolsados.
`,
    );

    addClause(
      "CLÁUSULA 4 — FREQUÊNCIA E APROVEITAMENTO",
      `
O FORMANDO deverá cumprir a frequência mínima exigida da carga horária total e satisfazer os critérios de avaliação estabelecidos para obtenção do certificado.
`,
    );

    addClause(
      "CLÁUSULA 5 — DISCIPLINA",
      `
O FORMANDO deverá manter comportamento adequado durante toda a formação.
`,
    );

    addClause(
      "CLÁUSULA 6 — PROTEÇÃO DE DADOS",
      `
Os dados pessoais do FORMANDO serão utilizados exclusivamente para fins administrativos, pedagógicos e legais relacionados com a formação.
`,
    );

    addClause(
      "CLÁUSULA 7 — PROPRIEDADE INTELECTUAL",
      `
Os materiais didáticos fornecidos pertencem ao CENTRO DE FORMAÇÃO.
`,
    );

    addClause(
      "CLÁUSULA 8 — RESCISÃO",
      `
O presente contrato poderá ser rescindido:

a) Por mútuo acordo entre as partes;
b) Pelo incumprimento das obrigações contratuais;
c) Por conduta grave do FORMANDO;
d) Pela impossibilidade de continuidade do curso.
`,
    );

    addClause(
      "CLÁUSULA 9 — DISPOSIÇÕES FINAIS",
      `
a) O presente contrato entra em vigor na data da sua assinatura;

b) Qualquer alteração deverá ser feita por escrito;

c) As partes declaram ter lido e compreendido todas as cláusulas.
`,
    );

    // ======================================================
    // ASSINATURAS
    // ======================================================

    y += 70;

    if (y > 690) {
      doc.addPage();

      y = 120;
    }

    doc.moveTo(80, y).lineTo(240, y).strokeColor("#999").lineWidth(1).stroke();

    doc.moveTo(340, y).lineTo(500, y).strokeColor("#999").lineWidth(1).stroke();

    y += 10;

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(dark)
      .text("O CENTRO DE FORMAÇÃO", 95, y);

    doc.text("O FORMANDO", 385, y);

    // ======================================================
    // FOOTER
    // ======================================================

    const pages = doc.bufferedPageRange();

    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#888")
        .text(`Página ${i + 1} de ${pages.count}`, 50, 790, {
          align: "center",
        });

      doc.text("Documento processado electronicamente", 50, 775, {
        align: "center",
      });
    }

    // ======================================================
    // FINALIZAR PDF
    // ======================================================

    doc.end();

    // ======================================================
    // ESPERAR STREAM
    // ======================================================

    await new Promise((resolve, reject) => {
      stream.on("close", resolve);
      stream.on("error", reject);
    });

    // ======================================================
    // URL PUBLICA
    // ======================================================

    const baseUrl = process.env.APP_URL || "http://127.0.0.1:3001";

    const relativePath = path.relative(
      path.join(process.cwd(), "contracts"),
      filePath,
    );

    const publicUrl = `${baseUrl}/contracts/${relativePath.replace(
      /\\/g,
      "/",
    )}`;

    // ======================================================
    // TAMANHO
    // ======================================================

    const stats = fs.statSync(filePath);

    // ======================================================
    // DOCUMENT TYPE
    // ======================================================

    // ID do tipo "Contrato"
    // ajuste conforme tua tabela

    const contractDocumentTypeId = 13;

    // ======================================================
    // SALVAR DOCUMENTO
    // ======================================================

    await query(
      `
        INSERT INTO documents (
          student_id,
          course_id,
          uploaded_by,
          document_type_id,
          academic_year,
          file_name,
          file_type,
          file_size,
          file_url,
          status
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          uploaded_by = VALUES(uploaded_by),
          course_id = VALUES(course_id),
          academic_year = VALUES(academic_year),
          file_name = VALUES(file_name),
          file_type = VALUES(file_type),
          file_size = VALUES(file_size),
          file_url = VALUES(file_url),
          status = VALUES(status),
          updated_at = NOW()
      `,
      [
        student.id,
        student.course_id,
        uploadedBy,
        contractDocumentTypeId,
        year,
        filename,
        "application/pdf",
        stats.size,
        publicUrl,
        "ACTIVE",
      ],
    );

    // ======================================================
    // RESPOSTA
    // ======================================================

    return res.json({
      success: true,
      contractUrl: publicUrl,
      fileName: filename,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Erro ao gerar contrato",
      error: err.message,
    });
  }
};

module.exports = {
  addStudents,
  getStudents,
  updateStudent,
  deleteStudent,
  getStudentErrollments,
  generateContract,
};
