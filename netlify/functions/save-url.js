const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const { url: newUrl } = JSON.parse(event.body);

  if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(newUrl)) {
    return { statusCode: 400, body: "Invalid image URL." };
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.REPO_NAME;
  const path = process.env.TARGET_FILE;
  const [owner, repoName] = repo.split("/");

  const octokit = new Octokit({ auth: token });
  const { data: fileData } = await octokit.repos.getContent({ owner, repo: repoName, path });
  const content = Buffer.from(fileData.content, "base64").toString("utf-8");
  let urls = JSON.parse(content);

  if (!urls.includes(newUrl)) {
    urls.unshift(newUrl); // 새 URL을 맨 앞에 추가 (제한 없음)
  }

  const updated = Buffer.from(JSON.stringify(urls, null, 2)).toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo: repoName,
    path,
    message: "Add image URL",
    content: updated,
    sha: fileData.sha,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
