const { getConnection, jsonResponse, parseJsonBody } = require("./db");

exports.handler = async (event) => {
  let conn;

  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: "",
    };
  }

  try {
    const body = parseJsonBody(event);
    if (body === null) return jsonResponse(400, { success: false, message: "Invalid JSON" });

    const { user_id, title, author, description, price, type_id } = body;

    if (!user_id || !title || !author || price === undefined || !type_id) {
      return jsonResponse(400, {
        success: false,
        message: "user_id, title, author, price, type_id are required",
      });
    }

    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) {
      return jsonResponse(400, { success: false, message: "price must be a number >= 0" });
    }

    conn = await getConnection();

    // Admin check
    const [adminRows] = await conn.execute(
      "SELECT is_admin FROM users WHERE user_id = ?",
      [user_id]
    );

    if (adminRows.length === 0) {
      return jsonResponse(404, { success: false, message: "User not found" });
    }
    if (Number(adminRows[0].is_admin) !== 1) {
      return jsonResponse(403, { success: false, message: "Admins only" });
    }

    // Insert book (matches your schema!)
    const [result] = await conn.execute(
      `INSERT INTO book (title, author, description, price, type_id, availability_status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, author, description || null, p, Number(type_id), 1]
    );

    return jsonResponse(200, {
      success: true,
      message: "Book added",
      book_id: result.insertId,
    });
  } catch (err) {
    console.error("add_book error:", err);
    return jsonResponse(500, { success: false, message: "Internal server error" });
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
};
