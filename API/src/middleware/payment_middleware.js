const { query } = require("../models/models");

async function generateInvoiceNumber(type = "FT") {
  const year = new Date().getFullYear();

  const [series] = await query(
    `
    SELECT * FROM invoice_series
    WHERE type = ? AND year = ? ORDER BY id DESC
    LIMIT 1
  `,
    [type, year],
  );

  const nextNumber = parseInt(series?.last_number || 0) + 1;

  await query(
    `
      INSERT INTO invoice_series (type, prefix, year, last_number)
      VALUES (?, ?, ?, ?)
    `,
    [type, type, year, nextNumber],
  );

  return {
    last_number: nextNumber,
    type,
    year,
    serie: `${type}-${year}/${String(nextNumber).padStart(4, "0")}`,
  };
}

const getLasInvoiceID = async () => {
  const [id] = await query(
    `
    SELECT id FROM invoices LIMIT 1
  `,
    [],
  );

  return Number(id || 1);
};

module.exports = { generateInvoiceNumber, getLasInvoiceID };
