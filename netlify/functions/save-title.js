const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { title } = JSON.parse(event.body);
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.REPO_NAME;
  const path = "data/titles.json"; // 제목 저장 경로

  const api = `https://api.github.com/repos/${repo}/contents/${path}`;

  const getRes = await fetch(api, {
    headers: { Authorization: `token ${token}` },
  });

  const getData = await getRes.json();
  const sha = getData.sha;
  let titles = [];

  try {
    const decoded = Buffer.from(getData.content, "base64").toString("utf-8");
    titles = JSON.parse(decoded);
  } catch {
    titles = [];
  }

  if (!titles.includes(title)) {
    titles.push(title);
  }

  const updatedContent = Buffer.from(JSON.stringify(titles, null, 2)).toString("base64");

  await fetch(api, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Add title: ${title}`,
      content: updatedContent,
      sha: sha,
    }),
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ status: "success", title }),
  };
};
