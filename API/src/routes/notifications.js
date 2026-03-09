const express = require('express');
const router = express.Router();
const { query } = require('../models/models');

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const sql = "SELECT * FROM notifications ORDER BY id DESC"; // ordenar por mais recente
    const result = await query(sql);

    if (result && result.length > 0) {
      res.status(200).json(result); // retorna todas as notificações
    } else {
      res.status(200).json([]); // retorna array vazio se não houver
    }
  } catch (error) {
    console.error("Erro ao buscar notifications:", error);
    res.status(500).json({ error: "internal_error" });
  }
});

module.exports = router;