"use strict";
// Netlify Function: fetchApiToken
// Provides API tokens for authenticated clients to access external services.
// Requires environment variables at deploy time:
//   API_TOKEN_SECRET - a secret key for token validation/generation
//   GITHUB_TOKEN     - GitHub personal access token (optional, for GitHub API access)
//   ALLOWED_ORIGINS  - comma-separated list of allowed origins (optional, defaults to *)

// Prefer global fetch (Node 18+); otherwise provide a tiny https fallback
let doFetch;
try {
  if (typeof fetch === "function") {
    doFetch = (url, opts) => fetch(url, opts);
  }
} catch (e) {
  // ignore
}
if (!doFetch) {
  const https = require("https");
  const { URL } = require("url");
  doFetch = (urlStr, opts = {}) => new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const reqOpts = { method: opts.method || "GET", headers: opts.headers || {} };
    const req = https.request(url, reqOpts, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          json: async () => JSON.parse(data || "{}"),
          text: async () => data
        });
      });
    });
    req.on("error", reject);
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

// Simple token validation (in production, use proper JWT or OAuth)
function validateRequest(event) {
  const authHeader = event.headers.authorization;
  const apiSecret = process.env.API_TOKEN_SECRET;
  
  if (!apiSecret) {
    return { valid: false, error: "API_TOKEN_SECRET not configured" };
  }
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { valid: false, error: "Missing or invalid authorization header" };
  }
  
  const token = authHeader.substring(7);
  // Simple validation - in production use proper JWT verification
  if (token !== apiSecret) {
    return { valid: false, error: "Invalid token" };
  }
  
  return { valid: true };
}

// Generate or fetch tokens based on service type
async function getTokenForService(service) {
  switch (service) {
  case "github": {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error("GitHub token not configured");
    }
    // Validate the token by making a test API call
    try {
      const testRes = await doFetch("https://api.github.com/user", {
        headers: { 
          Authorization: `Bearer ${githubToken}`,
          "User-Agent": "cxi-netlify-fn"
        }
      });
      if (!testRes.ok) {
        throw new Error("GitHub token validation failed");
      }
    } catch (err) {
      throw new Error(`GitHub token validation error: ${err.message}`);
    }
    return {
      service: "github",
      token: githubToken,
      type: "bearer",
      expiresAt: null // Personal access tokens don't expire unless revoked
    };
  }
  case "demo":
    // Demo/test token for development
    return {
      service: "demo",
      token: "demo-token-" + Date.now(),
      type: "bearer",
      expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
    };
      
  default:
    throw new Error(`Unsupported service: ${service}`);
  }
}

exports.handler = async function(event) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(",") : ["*"];
  
  const origin = event.headers.origin || "";
  const corsOrigin = allowedOrigins.includes("*") || allowedOrigins.includes(origin) ? 
    origin || "*" : "null";
  
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== "GET" && event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: "Method not allowed" }), 
      headers 
    };
  }

  // Validate the request
  const validation = validateRequest(event);
  if (!validation.valid) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: validation.error }),
      headers
    };
  }

  // Get service from query params or body
  let service = "github"; // default
  if (event.httpMethod === "GET") {
    service = event.queryStringParameters?.service || "github";
  } else if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body || "{}");
      service = body.service || "github";
    } catch (e) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" }),
        headers
      };
    }
  }

  try {
    const tokenInfo = await getTokenForService(service);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        data: tokenInfo,
        timestamp: new Date().toISOString()
      }),
      headers
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Failed to fetch token",
        message: err.message 
      }),
      headers
    };
  }
};