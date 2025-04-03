// netlify/functions/upload-image.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { base64, filename } = JSON.parse(event.body);
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.REPO_NAME;
  const folder = "images";
  const path = `${folder}/${Date.now()}-${filename}`;

  const api = `https://api.github.com/repos/${repo}/contents/${path}`;

  const buffer = Buffer.from(base64, 'base64');
  const content = buffer.toString('base64');

  try {
    const res = await fetch(api, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Add uploaded image: ${filename}`,
        content
      })
    });

    if (!res.ok) {
      const text = await res.text();
      return { statusCode: 500, body: text };
    }

    const rawUrl = `https://raw.githubusercontent.com/${repo}/main/${path}`;
    return {
      statusCode: 200,
      body: JSON.stringify({ url: rawUrl })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Upload failed", details: err.message })
    };
  }
};
