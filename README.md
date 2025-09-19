# cxi-project

A CXI (Customer Experience Index) project with Netlify functions for feedback management and API token access.

## Features

- **Feedback Management**: Save feedback data to GitHub repository via `/api/feedback` endpoint
- **API Token Access**: Fetch API tokens for external services via `/api/token` endpoint

## API Endpoints

### POST /api/feedback
Saves feedback data to the repository using GitHub API.

**Environment Variables Required:**
- `GITHUB_TOKEN` - Personal access token with repo access
- `REPO` - Repository in format `owner/repo` 
- `BRANCH` - Target branch (default: main)
- `FEEDBACK_PATH` - Path to feedback file (default: data/feedbacks.json)

### GET /api/token
Fetches API tokens for external services.

**Environment Variables Required:**
- `API_TOKEN_SECRET` - Secret key for authentication
- `GITHUB_TOKEN` - GitHub token (optional, for GitHub service)
- `ALLOWED_ORIGINS` - Comma-separated allowed origins (optional, default: *)

**Parameters:**
- `service` - Service type (`github`, `demo`)

**Authentication:**
Requires `Authorization: Bearer <token>` header where token matches `API_TOKEN_SECRET`.

## Development

```bash
npm install
npm run lint
```

## Deployment

Deploy to Netlify with the required environment variables configured.