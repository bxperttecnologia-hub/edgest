const db = require("../db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const util = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

  const leadingZero = (num, size = 3) => {
    const s = String(num ?? "");
    return s.padStart(size, "0");
  };

const moment = require("moment-timezone");

const now = new Date();
// Obtendo a data e hora no fuso horário de Luanda
const formatter = new Intl.DateTimeFormat("pt-PT", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "Africa/Luanda",
}).formatToParts(now);

const query = util.promisify(db.query).bind(db);
const parts = Object.fromEntries(
  formatter.map(({ type, value }) => [type, value])
);

const currentDate = `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
function isDate(value) {
  return (
    Object.prototype.toString.call(value) === "[object Date]" ||
    (!isNaN(Date.parse(value)) &&
      typeof value === "string" &&
      value.includes("-"))
  );
}

const isExcelDate = (val) => {
  return typeof val === "number" && val > 20000 && val < 60000; // intervalo aproximado para anos entre 1950 e 2100
};

const excelDateToString = (serial) => {
  const excelEpoch = new Date(1899, 11, 30); // Excel começa em 1900-01-01, mas precisa compensar bug do ano bissexto
  const date = new Date(excelEpoch.getTime() + serial * 86400000); // 86400000 ms em 1 dia
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

const formatDateForInput = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function getLastId(table, field) {
  return new Promise((resolve, reject) => {
    const sqlSelect = `SELECT ${
      field || "id"
    } as lastId FROM ${table} ORDER BY id DESC LIMIT 1`;
    db.query(sqlSelect, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const lastId = result[0]?.lastId || 0;
        resolve(lastId);
      }
    });
  });
}

function formatCurrency(value) {
  if (value == null) return "0,00 Kz";
  return (
    Number(value).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " Kz"
  );
}

// === Helpers ===
const statusColor = (status) => {
  switch (status.toLowerCase()) {
    case "pendente":
      return "#f59e0b"; // amarelo
    case "processando":
      return "#3b82f6"; // azul
    case "enviado":
      return "#6366f1"; // indigo
    case "entregue":
      return "#10b981"; // verde
    case "cancelado":
      return "#ef4444"; // vermelho
    default:
      return "#6b7280"; // cinza
  }
};

module.exports = {
  db,
  bcrypt,
  nodemailer,
  crypto,
  moment,
  formatter,
  query,
  currentDate,
  isDate,
  isExcelDate,
  excelDateToString,
  formatDateForInput,
  getLastId,
  leadingZero,
  util,
  jwt,
  statusColor,
  formatCurrency
};
