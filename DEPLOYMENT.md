# Deployment Guide

This document provides instructions for deploying the CXI Project to Netlify with a custom domain.

## Netlify Deployment Setup

### 1. Automatic GitHub Integration

The repository is configured for automatic deployment to Netlify:

- **Build Configuration**: Defined in `netlify.toml`
- **GitHub Actions**: Automated deployment via `.github/workflows/deploy-netlify.yml`
- **Functions**: Serverless functions in `netlify/functions/`

### 2. Required Environment Variables

Set these environment variables in your Netlify dashboard:

```env
GITHUB_TOKEN=your_github_personal_access_token
REPO=dukeblue1994-glitch/cxi-project
BRANCH=main
FEEDBACK_PATH=data/feedbacks.json
```

### 3. Required GitHub Secrets

For GitHub Actions deployment, configure these secrets in your repository:

```env
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_SITE_ID=your_netlify_site_id
```

## Custom Domain Configuration (cxis.today)

### 1. Netlify Domain Settings

1. Go to your Netlify site dashboard
2. Navigate to **Site settings > Domain management**
3. Click **Add custom domain**
4. Enter `cxis.today`
5. Netlify will provide DNS configuration instructions

### 2. DNS Configuration

Configure your domain DNS settings to point to Netlify:

#### For Apex Domain (cxis.today):
```
Type: A
Name: @
Value: 75.2.60.5
```

#### For WWW Subdomain (www.cxis.today):
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

#### Alternative: Using Netlify DNS
If you want to use Netlify's DNS servers:
1. In Netlify, go to **Domain settings**
2. Click **Set up Netlify DNS**
3. Update your domain registrar to use Netlify's name servers

### 3. SSL Certificate

Netlify automatically provisions SSL certificates for custom domains:
- Certificate is automatically generated via Let's Encrypt
- HTTPS redirect is enabled by default
- Certificate auto-renewal is handled by Netlify

## Verification Steps

### 1. Test Deployment
- ✅ Repository builds without errors
- ✅ Netlify function deploys successfully
- ✅ Static files are served correctly
- ✅ API endpoints work (`/api/feedback`)

### 2. Test Domain Configuration
- ✅ `cxis.today` resolves to Netlify
- ✅ `www.cxis.today` redirects properly
- ✅ HTTPS certificate is valid
- ✅ All functionality works on custom domain

### 3. Test Application Features
- ✅ Feedback form submission works
- ✅ Data persistence via GitHub API functions
- ✅ Scoring calculations display correctly
- ✅ CSV export functionality works

## Troubleshooting

### Common Issues

1. **DNS Propagation**: DNS changes can take up to 48 hours to fully propagate
2. **SSL Certificate**: If HTTPS doesn't work immediately, wait a few minutes for certificate provisioning
3. **Function Errors**: Check Netlify function logs for environment variable issues
4. **GitHub API**: Ensure GitHub token has proper repository permissions

### Monitoring

- **Netlify Dashboard**: Monitor deployments and function logs
- **GitHub Actions**: Check workflow runs for deployment status
- **Domain Health**: Use DNS lookup tools to verify domain configuration

## Environment-Specific Settings

### Development
```bash
npm install
npm run lint
python3 -m http.server 8000  # Test locally
```

### Production
- All deployment handled automatically via GitHub Actions
- Environment variables managed in Netlify dashboard
- Domain and SSL managed in Netlify domain settings

## Support

For issues with:
- **Repository**: Open an issue on GitHub
- **Netlify Deployment**: Check Netlify documentation
- **Domain Configuration**: Contact your domain registrar or use Netlify DNS