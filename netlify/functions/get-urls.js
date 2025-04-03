const fs = require("fs");
const path = require("path");

exports.handler = async () => {
  try {
    const filePath = path.join(__dirname, "../../data/urls.json");
    const data = fs.readFileSync(filePath, "utf-8");
    return {
      statusCode: 200,
      body: data,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "파일 읽기 실패", details: err.message }),
    };
  }
};
