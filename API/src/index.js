const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path")
dotenv.config();
require("./db");
require("./middleware/students_middleware").getLastIDs();

const authRoutes = require("./routes/auth");
const coursesRoutes = require("./routes/courses");
const studentsRoutes = require("./routes/students");
const enrollmentsRoutes = require("./routes/enrollments");
const paymentsRoutes = require("./routes/payments");
const notificationsRoutes = require("./routes/notifications");
const authMiddleware = require("./middleware/auth_middleware");
const {runCheck} = require("./jobs/overdueChecker");

// start jobs
require("./jobs/overdueChecker").runCheck();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const allowedOrigins = [
  "http://127.0.0.1:8080",
  "http://localhost:8080",
  "http://192.168.100.160:8080",
  "http://192.168.10.9:8080",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requisições sem origin (Postman, mobile apps, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Não permitido pelo CORS"));
      }
    },
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/invoices", express.static(path.join(process.cwd(), "invoices")));
app.get("/", (req, res) =>
  res.json({ ok: true, service: "Centro de Gestao API" })
);
app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/enrollments", enrollmentsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.get("/checkPayment", async (req, res) => {
  await runCheck();
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
