const { query } = require("../models/models");

/**
 * Insere uma notificação para o usuário no banco
 * @param {number} user_id - ID do usuário
 * @param {string} email - Email do usuário
 * @param {string} subject - Assunto da notificação
 * @param {string} message - Mensagem da notificação
 * @param {string} [error_message] - Mensagem de erro opcional
 */
const insertNotify = async (user_id, email, subject, message, error_message = " ") => {
  try {
    const result = await query(
      `INSERT INTO notifications(user_id, email, subject, message, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, email, subject, message, "unreaded", error_message]
    );

    return result;
  } catch (err) {
    console.error('Erro ao enviar notificação para', email, err && err.message);
    throw err;
  }
};

module.exports = insertNotify;