const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

dotenv.config();

// ============================
// TRATAMENTO GLOBAL DE ERROS
// ============================

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

// ============================
// CARREGAR BANCO
// ============================

require("./db");

// ============================
// IMPORTS
// ============================

const { runCheck } = require("./jobs/overdueChecker");

const reportsRoutes = require("./routes/reports");
const authRoutes = require("./routes/auth");
const coursesRoutes = require("./routes/courses");
const documentsRoutes = require("./routes/documents");
const studentsRoutes = require("./routes/students");
const enrollmentsRoutes = require("./routes/enrollments");
const paymentsRoutes = require("./routes/payments");
const notificationsRoutes = require("./routes/notifications");

// ============================
// PRIVATE KEY
// ============================

let privateKey = null;

try {
  privateKey = fs.readFileSync("./privatekey.pem", "utf8");
} catch (err) {
  console.error("Erro ao carregar privatekey.pem:", err.message);
}

function signData(data) {
  if (!privateKey) {
    throw new Error("Private key não carregada");
  }

  const sign = crypto.createSign("SHA256");
  sign.update(JSON.stringify(data));
  sign.end();

  return sign.sign(privateKey, "base64");
}

// ============================
// APP
// ============================

const app = express();

// ============================
// CORS
// ============================

const allowedOrigins = [
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "http://192.168.100.160:8080",
  "http://192.168.100.30:8080",
  "http://192.168.10.9:8080",
  "http://192.168.10.1:8080",
  "https://3cf9-154-71-135-3.ngrok-free.app",
  "https://c27b-154-71-215-65.ngrok-free.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);

// ============================
// BODY PARSER
// ============================

app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// ============================
// STATIC FILES
// ============================

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/invoices", express.static(path.join(process.cwd(), "invoices")));
app.use("/contracts", express.static(path.join(process.cwd(), "contracts")));
app.use(
  "/certificates",
  express.static(path.join(process.cwd(), "certificates")),
);

// ============================
// HEALTH CHECK
// ============================

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Centro de Gestao API",
    uptime: process.uptime(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

// ============================
// ROUTES
// ============================

app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/documents", documentsRoutes);

// ============================
// CHECK PAYMENT
// ============================

app.get("/checkPayment", async (req, res) => {
  try {
    await runCheck();

    return res.json({
      success: true,
      message: "Verificação concluída",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================
// CALLBACK
// ============================

app.post("/api/facturacaoeletronica/callback", (req, res) => {
  try {
    const { data, signature } = req.body || {};

    if (!data || !signature) {
      return res.status(400).json({
        message: "Payload inválido",
      });
    }

    console.log("Callback recebido");

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================
// START SERVER
// ============================

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Executa job após iniciar servidor
  setTimeout(async () => {
    try {
      await runCheck();
    } catch (err) {
      console.error("Erro ao executar runCheck:", err.message);
    }
  }, 5000);
});

server.on("error", (err) => {
  console.error("Server Error:", err);
});
