const { query, db, momment, fs, leadingZero } = require("../models/models");

const getCourses = async (req, res) => {
  try {
    const rows = await query(
      "SELECT c.id, c.code, c.title, c.description, c.duration_hours as duration, c.level, c.price, c.payment_parcelas, c.created_at, c.active FROM courses as c ORDER BY created_at DESC"
    );

    if(rows.length > 0){
      let data = [];

      rows.map(r => {
        let total = db.query("SELECT COUNT(e.id) as total FROM enrollments e JOIN classes c ON c.id = e.class_id WHERE c.course_id = ?", [
          r.id
        ])

        data.push({
          ...r,
          total_students: total[0] || 0
        })
      });

      res.status(200).json(data);
    }else{
      res.status(401).json([]);
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
};

const insertCourses = async (req, res) => {
  try {
    const {
      title,
      description,
      duration_hours,
      level,
      price,
      payment_parcelas,
      language = "pt",
      active,
    } = req.body;

    let code;
    const lastCourse = await query("Select id FROM courses ORDER BY created_at DESC LIMIT 1");

    if(lastCourse.length > 0){
      const lastCode = parseInt(lastCourse[0]?.id) + 1 || 1;
      code = `#${leadingZero(lastCode)}${new Date().getFullYear()}`
    }

    const result = await db.query(
      "INSERT INTO courses (code, title, description, duration_hours, level, price, payment_parcelas, language, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        code,
        title,
        description,
        duration_hours,
        level,
        price,
        payment_parcelas ? parseInt(payment_parcelas, 10) : 1,
        language,
        active ? 1 : 0,
      ]
    );

    const course = await query("SELECT * FROM courses WHERE id = ?", [
      result.insertId,
    ]);

    res.status(200).json({message: "Curso adicionado com sucesso!", data: course[0]});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
};

module.exports = { getCourses, insertCourses };
