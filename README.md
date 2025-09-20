# CXI Project

A Customer Experience Index (CXI) feedback collection and analysis system built with JavaScript and Node.js. This application allows users to provide structured feedback across multiple aspects and calculates meaningful metrics to help organizations understand and improve their customer experience.

## Overview

The CXI Project is a comprehensive feedback collection platform that:

- 📊 **Collects structured feedback** across key aspects like Communication, Scheduling, Clarity, Respect, Conduct, and Feedback
- 📈 **Calculates metrics** including Net Satisfaction Score (NSS) and richness indices
- 💾 **Persists data** via GitHub API integration for seamless storage
- 🌐 **Deploys easily** on Netlify with serverless functions
- ✅ **Validates input** with comprehensive word count and content requirements
- 🎯 **Provides insights** through automated scoring algorithms

### Key Features

- **Multi-aspect feedback collection** with customizable categories
- **Real-time scoring** with NSS calculations and richness metrics
- **Serverless backend** using Netlify Functions
- **GitHub integration** for data persistence
- **Responsive design** for cross-device compatibility
- **Comprehensive testing** with automated test suite

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dukeblue1994-glitch/cxi-project.git
   cd cxi-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (for Netlify Functions)
   Create a `.env` file in the root directory:
   ```env
   GITHUB_TOKEN=your_github_personal_access_token
   REPO=your-username/your-repo
   BRANCH=main
   FEEDBACK_PATH=data/feedbacks.json
   ```

4. **Run linting** (optional - note: current codebase has linting issues that can be fixed)
   ```bash
   npm run lint
   ```

### Deployment

This project is optimized for seamless deployment on Netlify:

#### Automatic Deployment (Recommended)

1. **Fork this repository** to your GitHub account

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account and select your fork
   - Netlify will automatically detect the configuration from `netlify.toml`

3. **Set Environment Variables** in Netlify Dashboard (Site Settings → Environment Variables):
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   REPO=your-username/your-repo
   BRANCH=main
   FEEDBACK_PATH=data/feedbacks.json
   ```

4. **Generate GitHub Token**:
   - Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
   - Create a new token with `repo` scope (for private repos) or `public_repo` (for public repos)
   - Copy the token and add it as `GITHUB_TOKEN` in Netlify

#### Manual Deployment

1. **Build locally**:
   ```bash
   npm install
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the project folder to Netlify Dashboard
   - Or use Netlify CLI: `netlify deploy --prod`

#### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GITHUB_TOKEN` | Yes | GitHub personal access token | `ghp_xxx...` |
| `REPO` | Yes | Repository in format owner/name | `user/my-repo` |
| `BRANCH` | No | Branch for data storage | `main` (default) |
| `FEEDBACK_PATH` | No | Path to feedback JSON file | `data/feedbacks.json` (default) |

#### Post-Deployment

- Feedback form will be available at your Netlify domain
- API endpoint: `https://your-site.netlify.app/api/feedback`
- Functions will be available at `/.netlify/functions/`
- Feedback data will be automatically committed to your repository

## Usage

### Basic Feedback Collection

1. **Open the application** in your web browser
2. **Fill out the feedback form** with required fields:
   - Overall satisfaction rating (1-5)
   - Fairness rating (1-5)
   - "What went well" (minimum 15 words)
   - "Could be better" (minimum 15 words)
   - Select relevant aspect tags
   - Provide headline and context information

3. **Submit feedback** - the system will:
   - Validate input requirements
   - Calculate NSS and richness scores
   - Store data via GitHub API
   - Provide immediate feedback on submission

### API Integration

The `/api/feedback` endpoint accepts POST requests with the following structure:

```json
{
  "overall": 4,
  "fairness": 4,
  "well": "The communication was clear and timely throughout the process...",
  "better": "The scheduling could be more flexible to accommodate different time zones...",
  "headline": "Great experience overall",
  "aspects": ["Communication", "Scheduling"],
  "stage": "implementation",
  "role": "user",
  "consent": true
}
```

### Configuration

Customize the feedback aspects by modifying the `ASPECTS` array in `src/app.js`:

```javascript
window.ASPECTS = ["Communication", "Scheduling", "Clarity", "Respect", "Conduct", "Feedback"];
```

## Contributing

We welcome contributions to improve the CXI Project! Here's how you can help:

### Getting Started

1. **Fork the repository** on GitHub
2. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding standards
4. **Write or update tests** for your changes
5. **Run the test suite** to ensure everything works
6. **Submit a pull request** with a clear description

### Development Guidelines

- **Code Style**: Follow the existing JavaScript style conventions
- **Testing**: Add tests for new features and bug fixes
- **Documentation**: Update relevant documentation for any changes
- **Commit Messages**: Use clear, descriptive commit messages

### Code Quality

- Run `npm run lint` before submitting
- Ensure all tests pass
- Follow semantic versioning for releases
- Write meaningful commit messages

### Reporting Issues

When reporting bugs or requesting features:

1. **Search existing issues** to avoid duplicates
2. **Use issue templates** when available
3. **Provide clear reproduction steps** for bugs
4. **Include relevant system information**

## Architecture

```
├── src/
│   ├── app.js          # Main application logic
│   └── app.test.js     # Application tests
├── netlify/
│   └── functions/
│       └── saveFeedback.js  # Serverless function for data persistence
├── scripts/
│   └── run-eslint.js   # Linting utilities
├── package.json        # Dependencies and scripts
├── netlify.toml        # Netlify configuration
└── README.md          # This file
```

## License

This project is licensed under the ISC License. See the `package.json` file for details.

## Contact

- **Repository**: [https://github.com/dukeblue1994-glitch/cxi-project](https://github.com/dukeblue1994-glitch/cxi-project)
- **Issues**: [GitHub Issues](https://github.com/dukeblue1994-glitch/cxi-project/issues)
- **Author**: dukeblue1994-glitch

For questions, suggestions, or support, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ for better customer experiences**