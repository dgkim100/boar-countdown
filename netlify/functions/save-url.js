const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { url } = JSON.parse(event.body);
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.REPO_NAME;
  const path = process.env.TARGET_FILE;

  const api = `https://api.github.com/repos/${repo}/contents/${path}`;

  const getRes = await fetch(api, {
    headers: { Authorization: `token ${token}` },
  });

  const getData = await getRes.json();
  const sha = getData.sha;
  let urls = [];

  try {
    const decoded = Buffer.from(getData.content, "base64").toString("utf-8");
    urls = JSON.parse(decoded);
  } catch {
    urls = [];
  }

  if (!urls.includes(url)) {
    urls.push(url);
  }

  const updatedContent = Buffer.from(JSON.stringify(urls, null, 2)).toString("base64");

  await fetch(api, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Add image URL: ${url}`,
      content: updatedContent,
      sha: sha,
    }),
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "success", url }),
  };
};
