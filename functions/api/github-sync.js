// Cloudflare Pages Function: /api/github-sync
// Manages reading from and committing to the GitHub repository data/database.json directly from Cloudflare Edge

const GITHUB_REPO_OWNER = 'Hellotamal';
const GITHUB_REPO_NAME = 'maxeco';
const GITHUB_FILE_PATH = 'data/database.json';
const GITHUB_BRANCH = 'main';

export async function onRequestGet(context) {
  const token = context.env.GITHUB_TOKEN || context.request.headers.get('x-github-token');

  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;
    const headers = {
      'User-Agent': 'Cloudflare-Pages-MaxEco-ERP',
      'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      // Fallback to raw fetch if unauthenticated
      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/${GITHUB_BRANCH}/${GITHUB_FILE_PATH}`;
      const rawRes = await fetch(rawUrl);
      if (rawRes.ok) {
        const rawJson = await rawRes.json();
        return new Response(JSON.stringify({ success: true, source: 'raw', data: rawJson }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: false, error: `GitHub API error: ${response.statusText}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const fileData = await response.json();
    const content = atob(fileData.content.replace(/\s/g, ''));
    const parsedData = JSON.parse(content);

    return new Response(JSON.stringify({
      success: true,
      source: 'api',
      sha: fileData.sha,
      data: parsedData
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  const token = context.env.GITHUB_TOKEN || context.request.headers.get('x-github-token');

  if (!token) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Missing GitHub Token. Please set GITHUB_TOKEN in Cloudflare Pages Environment Variables or provide in request header.'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json();
    const payloadData = body.data || body;
    let sha = body.sha;

    // If SHA was not provided, fetch current file SHA first
    const getUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;
    const getRes = await fetch(getUrl, {
      headers: {
        'User-Agent': 'Cloudflare-Pages-MaxEco-ERP',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`
      }
    });

    if (getRes.ok) {
      const getMeta = await getRes.json();
      sha = getMeta.sha;
    }

    const formattedJson = JSON.stringify(payloadData, null, 2);
    const base64Content = btoa(unescape(encodeURIComponent(formattedJson)));

    const commitMessage = body.commitMessage || `chore(data): sync ERP database records [${new Date().toISOString()}]`;

    const putUrl = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/contents/${GITHUB_FILE_PATH}`;
    const putRes = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'User-Agent': 'Cloudflare-Pages-MaxEco-ERP',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        branch: GITHUB_BRANCH,
        sha: sha
      })
    });

    if (!putRes.ok) {
      const errDetail = await putRes.text();
      return new Response(JSON.stringify({ success: false, error: `GitHub commit rejected: ${errDetail}` }), {
        status: putRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const commitResult = await putRes.json();
    return new Response(JSON.stringify({
      success: true,
      commitSha: commitResult.commit?.sha,
      updatedSha: commitResult.content?.sha,
      message: 'Successfully committed ERP database records to GitHub repository'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
