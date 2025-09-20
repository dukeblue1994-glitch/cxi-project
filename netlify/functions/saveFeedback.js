use strict;
// Netlify Function: saveFeedback
// Accepts POST JSON payload and appends it to a JSON file in the repository using GitHub API.
// Requires environment variables at deploy time:
//   GITHUB_TOKEN - a personal access token with repo access (for private repos: repo scope)
//   REPO         - owner/repo (e.g. "nickanderson/cxis_today")
//   BRANCH       - branch to commit to (default: main)
//   FEEDBACK_PATH- path to feedback file in repo (default: data/feedbacks.json)

// Prefer global fetch (Node 18+); otherwise provide a tiny https fallback
let doFetch;
try {
  if (typeof fetch === 'function') {
    doFetch = (url, opts) => fetch(url, opts);
  }
} catch (e) {
  // ignore
}
if (!doFetch) {
  const https = require('https');
  const { URL } = require('url');
  doFetch = (urlStr, opts = {}) => new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqOpts = { method: opts.method || 'GET', headers: opts.headers || {} };
    const req = https.request(url, reqOpts, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: async () => JSON.parse(data || '{}'),
          text: async () => data
        });
      });
    });
    req.on('error', reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

exports.handler = async function(event, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }), headers };
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.REPO || process.env.GITHUB_REPO;
  const branch = process.env.BRANCH || 'main';
  const path = process.env.FEEDBACK_PATH || 'data/feedbacks.json';

  if (!token || !repo) {
    return { statusCode: 501, body: JSON.stringify({ error: 'Missing GITHUB_TOKEN or REPO environment variables' }), headers };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }), headers };
  }

  // add a server-side timestamp
  payload.serverTime = new Date().toISOString();

  const apiBase = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`;
  const ghHeaders = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'cxi-netlify-fn' };

  try {
    // 1) read existing file (if any)
    let sha;
    let existing = [];
    const readRes = await doFetch(`${apiBase}?ref=${branch}`, { headers: ghHeaders });
    if (readRes.status === 200) {
      const body = await readRes.json();
      sha = body.sha;
      const content = body.content || '';
      const encoding = body.encoding || 'base64';
      const decoded = Buffer.from(content, encoding).toString('utf8');
      try { existing = JSON.parse(decoded); if (!Array.isArray(existing)) existing = []; } catch (e) { existing = []; }
    } else if (readRes.status !== 404) {
      const text = await readRes.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'Failed to read existing feedback file', detail: text }), headers };
    }

    existing.push(payload);

    const newContent = Buffer.from(JSON.stringify(existing, null, 2), 'utf8').toString('base64');

    const commitBody = { message: `Add feedback (${new Date().toISOString()})`, content: newContent, branch };
    if (sha) commitBody.sha = sha;

    const putRes = await doFetch(apiBase, { method: 'PUT', headers: Object.assign({ 'Content-Type': 'application/json' }, ghHeaders), body: JSON.stringify(commitBody) });
    if (!putRes.ok) {
      const text = await putRes.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'Failed to write feedback file', detail: text }), headers };
    }
    const putJson = await putRes.json();
    return { statusCode: 200, body: JSON.stringify({ ok: true, commit: putJson.commit && putJson.commit.sha }), headers };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }), headers };
  }
};