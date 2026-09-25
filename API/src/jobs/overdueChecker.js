/* overdue checker */
const cron = require("node-cron");
const { query } = require("../models/models");
const { sendEmail } = require("../utils/mailer");
const insertNotify = require("../utils/notifications");

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("pt-PT");
}

function normalizeDate(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

async function runCheck() {
  console.log("🔁 Executando verificação de pagamentos...");

  try {
    // =========================================
    // BUSCAR PAGAMENTOS
    // =========================================
    const payments = await query(`
      SELECT 
        p.id,
        p.enrollment_id,
        p.student_id,
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
      LEFT JOIN system_users u ON s.email = u.email
      LEFT JOIN enrollments e ON p.enrollment_id = e.id
      LEFT JOIN classes cl ON e.class_id = cl.id
      LEFT JOIN courses c ON cl.course_id = c.id
      WHERE p.status IN ('pending', 'overdue')
    `);

    if (!payments || payments.length === 0) {
      console.log("ℹ️ Nenhum pagamento pendente encontrado.");
      return;
    }

    // =========================================
    // DATA HOJE (sem horas)
    // =========================================
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const p of payments) {
      try {
        if (!p.student_email || !p.due_date) {
          console.warn("⚠️ Pagamento inválido:", p.id);
          continue;
        }

        const dueDate = new Date(p.due_date);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        let subject = null;

        // =========================================
        // ATUALIZAR OVERDUE
        // =========================================
        if (diffDays < 0 && p.status !== "overdue") {
          await query("UPDATE payments SET status = ? WHERE id = ?", [
            "overdue",
            p.id,
          ]);

          p.status = "overdue";
        }

        // =========================================
        // DEFINIR EMAILS
        // =========================================
        if (diffDays === 7) {
          subject = "📅 Lembrete: sua parcela vence em 7 dias";
        } else if (diffDays === 0) {
          subject = "⚠️ Lembrete: sua parcela vence hoje";
        } else if (diffDays < 0) {
          subject = "❌ Aviso: pagamento em atraso";
        }

        if (!subject) continue;

        // =========================================
        // VALIDAÇÃO DE VALOR
        // =========================================
        const amount = Number(p.amount || 0);

        const html = `
          <p><strong>${p.student_name || "Estudante"}</strong>,</p>

          <p>
            A parcela nº <b>${p.parcela_numero}</b> do curso 
            <b>${p.course_title || ""}</b>
            ${
              diffDays < 0
                ? `venceu em <b>${p.due_date}</b>`
                : `vence em <b>${p.due_date}</b>`
            }.
          </p>

          <p>
            Valor: <b>${amount.toLocaleString("pt-PT")} AOA</b>.
          </p>
        `;

        // =========================================
        // NOTIFICAÇÃO + EMAIL
        // =========================================
        await insertNotify(p.sid, p.student_email, subject, html);
        await sendEmail(p.student_email, subject, html);

        console.log(
          `📧 Email enviado -> ${p.student_email} | Parcela ${p.parcela_numero}`,
        );
      } catch (err) {
        console.error(
          "❌ Erro no processamento da parcela:",
          p.id,
          err.message,
        );
      }
    }

    console.log("✅ Verificação concluída.");
  } catch (err) {
    console.error("❌ Erro geral no runCheck:", err.message);
  }
}

// Executa todos os dias às 09:00
cron.schedule("0 9 * * *", () => {
  runCheck().catch((err) => console.error("Erro no overdueChecker:", err));
});

module.exports = { runCheck };
