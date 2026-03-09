/* overdue checker */
const cron = require('node-cron');
const { query } = require('../models/models');
const { sendEmail } = require('../utils/mailer');
const insertNotify = require('../utils/notifications');

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-PT');
}

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

async function runCheck() {
  console.log('🔁 Executando verificação de pagamentos...');

  // Buscar pagamentos pendentes ou em atraso
  const payments = await query(`
    SELECT 
      p.id,
      p.enrollment_id,
      p.student_id,
      p.parcela_numero,
      p.amount,
      p.status,
      p.due_date,
      s.id AS sid,
      s.student_number,
      u.email AS student_email,
      u.name AS student_name,
      c.title AS course_title
    FROM payments p
    LEFT JOIN students s ON p.student_id = s.id
    LEFT JOIN users u ON s.email = u.email
    LEFT JOIN enrollments e ON p.enrollment_id = e.id
    LEFT JOIN classes cl ON e.class_id = cl.id
    LEFT JOIN courses c ON cl.course_id = c.id
    WHERE p.status IN ('pending', 'overdue')
  `);

  const today = normalizeDate(new Date());

  for (const p of payments) {
    if (!p.student_email || !p.due_date) {
      console.warn('⚠️ Pagamento inválido ou sem email:', p.id);
      continue;
    }

    const dueDate = normalizeDate(new Date(p.due_date));
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    let subject = null;

    // Marcar como overdue se atrasado
    if (diffDays < 0 && p.status !== 'overdue') {
      try {
        await query('UPDATE payments SET status = ? WHERE id = ?', ['overdue', p.id]);
        p.status = 'overdue'; // Atualiza localmente para envio de email
      } catch (err) {
        console.error('Erro ao marcar como overdue:', err.message);
        continue; // pula envio de email se falhou atualização
      }
    }

    // Definir assunto de email
    if (diffDays === 7) {
      subject = '📅 Lembrete: sua parcela vence em 7 dias';
    } else if (diffDays === 0) {
      subject = '⚠️ Lembrete: sua parcela vence hoje';
    } else if (diffDays < 0) {
      subject = '❌ Aviso: pagamento em atraso';
    }

    if (!subject) continue; // sem email para outros casos

    const html = `
      <p><strong>${p.student_name || 'Estudante'}</strong>,</p>
      <p>
        A parcela nº <b>${p.parcela_numero}</b> do curso 
        <b>${p.course_title || ''}</b> 
        ${diffDays < 0
        ? `venceu em <b>${formatDate(p.due_date)}</b>`
        : `vence em <b>${formatDate(p.due_date)}</b>`}.
      </p>
      <p>Valor: <b>${Number(p.amount).toLocaleString('pt-PT')} AOA</b>.</p>
    `;

    try {
      await insertNotify(p.sid, p.student_email, subject, html);
      await sendEmail(p.student_email, subject, html);
      console.log(`📧 Email enviado para ${p.student_email} | Parcela ${p.parcela_numero}`);
    } catch (err) {
      console.error('Erro ao enviar email:', p.student_email, err.message);
    }
  }

  console.log('✅ Verificação concluída.');
}

// Executa todos os dias às 09:00
cron.schedule('0 9 * * *', () => {
  runCheck().catch(err =>
    console.error('Erro no overdueChecker:', err)
  );
});

module.exports = { runCheck };
