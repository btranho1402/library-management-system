const { getConnection } = require("./db");

exports.handler = async (event) => {
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

    const body = event.body ? JSON.parse(event.body) : {};
    const user_id = body.user_id;
    const book_id = body.book_id;

    if (!user_id || !book_id) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ success: false, message: "Missing user_id or book_id" }),
      };
    }

    const conn = await getConnection();

    //Check book availability
    const [books] = await conn.execute(
      "SELECT availability_status FROM book WHERE book_id = ?",
      [book_id]
    );

    if (books.length === 0) {
      await conn.end();
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ success: false, message: "Book not found" }),
      };
    }

    if (books[0].availability_status !== 1) {
      await conn.end();
      return {
        statusCode: 409,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ success: false, message: "Book is not available" }),
      };
    }

    //Insert borrowing record 
    await conn.execute(
      "INSERT INTO borrowing (user_id, book_id, borrow_time) VALUES (?, ?, NOW())",
      [user_id, book_id]
    );

    //Mark book as borrowed
    await conn.execute(
      "UPDATE book SET availability_status = 0 WHERE book_id = ?",
      [book_id]
    );

    await conn.end();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: true, message: "Borrowed successfully" }),
    };
  } catch (err) {
    console.error("borrow error:", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ success: false, message: "Internal server error" }),
    };
  }
};
