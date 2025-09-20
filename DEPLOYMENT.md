# Netlify Deployment Configuration for CXI Project

## Overview
This document outlines the configuration needed to deploy the CXI Project to Netlify with the custom domain `cxis.today`.

## Required Environment Variables

The following environment variables must be configured in your Netlify dashboard or GitHub repository secrets for proper deployment:

### GitHub Secrets (for GitHub Actions deployment)
Set these in your GitHub repository under Settings > Secrets and Variables > Actions:

- **`NETLIFY_AUTH_TOKEN`**: Your Netlify personal access token
  - Generate this in Netlify Dashboard > User Settings > Applications > Personal Access Tokens
  - Scope: Full access to deploy sites

- **`NETLIFY_SITE_ID`**: Your Netlify site ID
  - Found in Netlify Dashboard > Site Settings > General > Site Information
  - Format: UUID string (e.g., `12345678-1234-5678-9012-123456789abc`)

### Netlify Environment Variables (for Netlify Functions)
Set these in Netlify Dashboard > Site Settings > Environment Variables:

- **`GITHUB_TOKEN`**: GitHub personal access token for storing feedback data
  - Generate in GitHub Settings > Developer Settings > Personal Access Tokens
  - Required scopes: `repo` (for private repos) or `public_repo` (for public repos)

- **`REPO`**: GitHub repository in format `owner/repository-name`
  - Example: `dukeblue1994-glitch/cxi-project`

- **`BRANCH`**: Git branch to commit feedback data to
  - Default: `main`
  - Can be set to any branch where you want to store feedback data

- **`FEEDBACK_PATH`**: Path to the feedback data file in the repository
  - Default: `data/feedbacks.json`
  - This file will be created automatically if it doesn't exist

## Configuration Files

### netlify.toml
The `netlify.toml` file in the repository root configures:
- Build settings (publish directory: root)
- Function deployment location
- API redirects (`/api/feedback` → `/.netlify/functions/saveFeedback`)
- CORS headers for cross-origin requests

### GitHub Actions Workflow
The `.github/workflows/deploy-netlify.yml` file:
- Triggers on pushes to the `main` branch
- Installs dependencies and Netlify CLI
- Deploys the site using Netlify CLI with environment variables

## Custom Domain Setup

### 1. DNS Configuration
Configure your DNS provider (where `cxis.today` is registered) with the following records:

**For Root Domain (cxis.today):**
```
Type: A
Name: @
Value: 75.2.60.5
```

**For WWW Subdomain (optional):**
```
Type: CNAME
Name: www
Value: cxis.today
```

### 2. Netlify Dashboard Configuration
1. Go to Netlify Dashboard > Site Settings > Domain Management
2. Click "Add custom domain"
3. Enter `cxis.today`
4. Follow the verification process
5. Enable HTTPS (automatic with Let's Encrypt)

### 3. Domain Verification
Netlify may require domain verification. Options include:
- DNS TXT record verification
- Email verification (if you have admin access to the domain)

## Deployment Process

### Automatic Deployment (Recommended)
1. Push changes to the `main` branch
2. GitHub Actions will automatically build and deploy to Netlify
3. Netlify will serve the site on `cxis.today` (once configured)

### Manual Deployment (Alternative)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod --dir=. --site=YOUR_SITE_ID
```

## Testing the Configuration

### Local Testing
```bash
# Start local development server
python3 -m http.server 8000

# Or use Netlify Dev for function testing
netlify dev
```

### Production Testing
1. Check that the site loads at `https://cxis.today`
2. Test feedback submission functionality
3. Verify that feedback is stored in the GitHub repository
4. Check Netlify function logs for any errors

## Troubleshooting

### Common Issues

**Site not loading on custom domain:**
- Verify DNS propagation (can take up to 48 hours)
- Check domain configuration in Netlify dashboard
- Ensure SSL certificate is issued

**Feedback not saving:**
- Check `GITHUB_TOKEN` has correct permissions
- Verify `REPO` and `BRANCH` environment variables
- Check Netlify function logs for error details

**Build failures:**
- Verify all environment variables are set correctly
- Check GitHub Actions logs for specific error messages
- Ensure `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` are valid

### Support Resources
- Netlify Documentation: https://docs.netlify.com/
- Netlify Community: https://community.netlify.com/
- GitHub Actions Documentation: https://docs.github.com/en/actions

## Security Considerations
- Never commit sensitive tokens to the repository
- Use GitHub Secrets for CI/CD environment variables
- Use Netlify Environment Variables for runtime configuration
- Regularly rotate access tokens
- Monitor repository access logs