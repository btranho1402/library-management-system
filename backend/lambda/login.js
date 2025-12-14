const { getConnection, jsonResponse, parseJsonBody } = require("./db");

exports.handler = async (event) => {
  let conn;
  try {
    const body = parseJsonBody(event);
    if (body === null) return jsonResponse(400, { success: false, message: "Invalid JSON" });

    const { username, password } = body;
    if (!username || !password) {
      return jsonResponse(400, { success: false, message: "username and password are required" });
    }

    conn = await getConnection();
    const [rows] = await conn.execute(
      "SELECT user_id, user_name, is_admin FROM users WHERE user_name = ? AND password_hash = ?",
      [username, password]
    );

    if (rows.length === 0) {
      return jsonResponse(401, { success: false, message: "Invalid username or password" });
    }

    return jsonResponse(200, { success: true, user: rows[0] });
  } catch (err) {
    console.error("login error:", err);
    return jsonResponse(500, { success: false, message: "Internal server error" });
  } finally {
    if (conn) await conn.end();
  }
};
