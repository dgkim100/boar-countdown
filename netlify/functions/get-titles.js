const fetch = require("node-fetch");

exports.handler = async () => {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.REPO_NAME;
  const path = "data/titles.json";

  const api = `https://api.github.com/repos/${repo}/contents/${path}`;

  try {
    const res = await fetch(api, {
      headers: { Authorization: `token ${token}` },
    });
    const data = await res.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return {
      statusCode: 200,
      body: content,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "GitHub fetch failed", details: err.message }),
    };
  }
};
