/**
 * 🔐 Utils de autenticação com crypto (scrypt + JWT)
 */

const crypto = require("crypto");
const util = require("util");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("../src/db")
const {query} = require("./models/models")
dotenv.config();

const scrypt = util.promisify(crypto.scrypt);

const JWT_SECRET = process.env.JWT_SECRET || "CHAVE_SUPER_SECRETA_DEV";
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "7d";
const TOKEN_FILE = path.join(__dirname, "../token.json");

/* ----------- HASH DA SENHA ----------- */
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return { salt, hash: derived.toString("hex") };
}

async function verifyPassword(password, salt, hash) {
  const derived = await scrypt(password, salt, 64);
  return derived.toString("hex") === hash;
}

/* ----------- TOKEN JWT ----------- */
function signToken(payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  saveTokenToFile(token);
  return token;
}

async function verifyToken(token) {
  try {
    // 2️⃣ Verifica se o token ainda está ativo no banco
    const [session] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM login_sessions WHERE session_id = ? LIMIT 1",
        [token],
        (error, results) => (error ? reject(error) : resolve(results))
      );
    });
    

    if (!session) {
      return null;
    }

    // 3️⃣ Verifica se expirou
    const now = moment().tz("Africa/Luanda");
    const expiresAt = moment(session.expires_at).tz("Africa/Luanda");
    if (now.isAfter(expiresAt)) {
      return null;
    }

    const tokenI = session["session_id"];

    if(tokenI === token){
      return tokenI;
    }

    return false;
    // return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/* ----------- GESTÃO LOCAL DO TOKEN ----------- */
function saveTokenToFile(token) {
  fs.writeFileSync(
    TOKEN_FILE,
    JSON.stringify({ token, savedAt: new Date().toISOString() }, null, 2)
  );
  console.log("✅ Token salvo em:", TOKEN_FILE);
}

function readTokenFromFile() {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  const data = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
  return data.token || null;
}

function deleteTokenFile() {
  if (fs.existsSync(TOKEN_FILE)) {
    fs.unlinkSync(TOKEN_FILE);
    console.log("🧹 Token removido.");
  }
}

/* ----------- EXPORTS ----------- */
module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  readTokenFromFile,
  deleteTokenFile,
  saveTokenToFile
};
