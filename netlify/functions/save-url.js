const fs = require("fs");
const path = require("path");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { url } = JSON.parse(event.body);
  const filePath = path.join(__dirname, "../../data/urls.json");

  try {
    const existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    if (!existing.includes(url)) {
      existing.push(url);
      fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: "success", url }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "저장 실패", details: err.message }),
    };
  }
};
