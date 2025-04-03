const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const { title: newTitle } = JSON.parse(event.body);

  if (!newTitle || typeof newTitle !== "string") {
    return { statusCode: 400, body: "Invalid title." };
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.REPO_NAME;
  const path = process.env.TARGET_TITLE_FILE;
  const [owner, repoName] = repo.split("/");

  const octokit = new Octokit({ auth: token });
  const { data: fileData } = await octokit.repos.getContent({ owner, repo: repoName, path });
  const content = Buffer.from(fileData.content, "base64").toString("utf-8");
  let titles = JSON.parse(content);

  if (!titles.includes(newTitle)) {
    titles.unshift(newTitle); // 무제한 저장
  }

  const updated = Buffer.from(JSON.stringify(titles, null, 2)).toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo: repoName,
    path,
    message: "Add title",
    content: updated,
    sha: fileData.sha,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
