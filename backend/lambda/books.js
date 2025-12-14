const { getConnection, jsonResponse } = require("./db");

exports.handler = async () => {
  let conn;
  try {
    conn = await getConnection();
    const [rows] = await conn.execute(
      `SELECT book_id, title, author, description, price, cover_image_file, type_id, availability_status
       FROM book`
    );

    return jsonResponse(200, { success: true, data: rows });
  } catch (err) {
    console.error("books error:", err);
    return jsonResponse(500, { success: false, message: "Internal server error" });
  } finally {
    if (conn) await conn.end();
  }
};
