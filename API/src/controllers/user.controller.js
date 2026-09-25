const { hashPassword, verifyPassword, signToken, saveTokenToFile, verifyToken } = require("../auth");
const authMiddleware = require("../middleware/auth_middleware")
const { db, query, crypto, moment, fs } = require("../models/models");
const insertUser = require("../middleware/users_middleware").insertUser;

const login = async (req, res) => {
  try {
    const { email, password, keepSession } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email e password obrigatórios!" });

    // 1️⃣ Buscar o usuário
    const rows = await query(
      "SELECT id, password_salt, password_hash, role FROM system_users WHERE email = ?",
      [email]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Este email não está cadastrado!" });

    const user = rows[0];

    // 2️⃣ Verificar a senha
    const ok = await verifyPassword(password, user.password_salt, user.password_hash);
    if (!ok) return res.status(400).json({ message: "Password incorreta" });

    const detailedUser = { id: user.id, email, role: user.role };

    // 3️⃣ Gerar token JWT
    const sessionToken = signToken(detailedUser); // usa JWT_SECRET
    saveTokenToFile(sessionToken); // grava token localmente

    // 4️⃣ Registrar sessão no banco
    const currentDate = moment().tz("Africa/Luanda").format("YYYY-MM-DD HH:mm:ss");
    const expiresAt = moment().tz("Africa/Luanda").add(2, "hours").format("YYYY-MM-DD HH:mm:ss");

    await new Promise((resolve, reject) => {
      db.query(
        `
        INSERT INTO login_sessions
        (session_id, user_id, ip_address, user_agent, userType, created_at, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          sessionToken,
          detailedUser.id,
          req.socket?.remoteAddress || "0.0.0.0",
          req.headers["user-agent"] || "Desconhecido",
          detailedUser.role,
          currentDate,
          expiresAt,
        ],
        (error) => (error ? reject(error) : resolve())
      );
    });

    // 5️⃣ Enviar resposta ao cliente
    if (!keepSession) {
      // Cookie de sessão (expira em 2h)
      res.cookie("sessionToken", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 2 * 60 * 60 * 1000, // 2 horas
      });
    }

    res.status(200).json({
      message: "Login realizado com sucesso!",
      user: detailedUser,
      token: sessionToken,
      keepSession: !!keepSession,
    });
  } catch (err) {
    console.error("❌ Erro no login:", err);
    res.status(500).json({ error: "internal_error" });
  }
};


const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "email e senha obrigatorios!" });
    }

    const rows = await query("SELECT * FROM system_users WHERE email = ?", [email]);

    // console.log(rows[0]);

    if (rows.length > 0)
      return res.status(400).json({ error: "Email já registrado!" });

    const result = await insertUser(name, email, password, role);
    const userId = result.insertId;
    const token = signToken({ id: userId, email, role: role || "student" });
    res.json({ id: userId, token, message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
};

const verifyLoginToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];


    if (!token) {
      return res.status(401).json({ message: "Token ausente." });
    }

    // 2️⃣ Verifica se o token ainda está ativo no banco
    const [session] = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM login_sessions WHERE session_id = ? LIMIT 1",
        [token],
        (error, results) => (error ? reject(error) : resolve(results))
      );
    });


    if (!session) {
      return res.status(401).json({ message: "Sessão não encontrada." });
    }

    // 3️⃣ Verifica se expirou
    const now = moment().tz("Africa/Luanda");
    const expiresAt = moment(session.expires_at).tz("Africa/Luanda");
    if (now.isAfter(expiresAt)) {
      return res.status(401).json({ message: "Sessão expirada." });
    }

    // ✅ Tudo certo → adiciona dados do usuário ao request
    req.user = token;
    res.status(201).json({ valid: parseInt(session["is_active"]) })
    // next(); // passa o controle para a próxima função da rota
  } catch (err) {
    console.error("❌ Erro ao verificar token:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao validar token." });
  }
};

const getuserInfo = async (req, res) => {
  try {
    const { email } = req.body;


    const result = await query("SELECT * FROM system_users WHERE email = ? LIMIT 1", [email]);

    if (result.length > 0) {
      res.status(200).json(result)
    } else {
      res.status(404).json({ message: "Usuario Nao encontrado!" })
    }

  } catch (err) {
    console.error("❌ Erro ao verificar token:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao validar token." });
  }
}


const getUsers = async (req, res) => {
  try {

    const result = await query("SELECT id, name, email, photo, role, active as status, created_at FROM system_users LIMIT 100", []);

    if (result.length > 0) {
      res.status(200).json(result)
    } else {
      res.status(404).json({ message: "Usuario Nao encontrado!" })
    }

  } catch (err) {
    console.error("❌ Erro ao verificar token:", err);
    return res
      .status(500)
      .json({ error: "Erro interno ao validar token." });
  }
}

const deleteUser = async (req, res) => {
  try {

    const { id } = req.params;

    const result = await query("DELETE FROM system_users WHERE id = ?", [id]);

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Usuário deletado com sucesso!"
      })
    } else {
      res.status(500).json({
        message: "Erro au deletar Usuário!"
      })
    }

  } catch (error) {
    console.error("Erro ao apagar usuario!")
    return res
      .status(500)
      .json({ error: "Erro interno ao validar token." });
  }
}

const updateUserStatus = async (req, res) => {
  try {

    const { id, status } = req.body;

    const result = await query("UPDATE system_users SET status = ? WHERE id = ?", [status, id]);

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "Status atualizado com sucesso!"
      })
    } else {
      res.status(500).json({
        message: "Erro au atualizar status!"
      })
    }

  } catch (error) {
    console.error("Erro ao atualizar status do usuario!")
    return res
      .status(500)
      .json({ error: "Erro interno ao validar token." });
  }
}


module.exports = { login, register, verifyLoginToken, getuserInfo, getUsers, deleteUser, updateUserStatus };
