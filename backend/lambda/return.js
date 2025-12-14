const { getConnection, jsonResponse, parseJsonBody } = require("./db");

exports.handler = async (event) => {
  let conn;

  try {
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

    const body = parseJsonBody(event);
    if (body === null) {
      return jsonResponse(400, { success: false, message: "Invalid JSON in request body" });
    }

    const { user_id, book_id } = body;

    if (!user_id || !book_id) {
      return jsonResponse(400, {
        success: false,
        message: "user_id and book_id are required",
      });
    }

    conn = await getConnection();

    //Find the active borrowing record 
    const [activeRows] = await conn.execute(
      "SELECT borrow_id FROM borrowing WHERE user_id = ? AND book_id = ? AND return_time IS NULL LIMIT 1",
      [user_id, book_id]
    );

    if (activeRows.length === 0) {
      return jsonResponse(404, {
        success: false,
        message: "No active borrowing record found for this user and book",
      });
    }

    const borrow_id = activeRows[0].borrow_id;

    //Mark the borrowing record as returned
    await conn.execute(
      "UPDATE borrowing SET return_time = NOW() WHERE borrow_id = ?",
      [borrow_id]
    );

    //Mark book available again
    await conn.execute(
      "UPDATE book SET availability_status = 1 WHERE book_id = ?",
      [book_id]
    );

    return jsonResponse(200, {
      success: true,
      message: "Book returned successfully",
      borrow_id,
    });
  } catch (err) {
    console.error("return error:", err);
    return jsonResponse(500, { success: false, message: "Internal server error" });
  } finally {
    if (conn) {
      try {
        await conn.end();
      } catch (e) {
        console.error("Error closing connection:", e);
      }
    }
  }
};
