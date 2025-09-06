# GitHub Content Manager

A modern web app for fetching and publishing content to GitHub repositories. Create drafts locally and publish them to your GitHub repo with a clean, responsive interface.

## Features

- View GitHub markdown content
- Create and edit drafts locally
- Publish drafts to GitHub
- Responsive design with Tailwind CSS

## Demo

![A quick demo of the application](./demo.gif)

## Tech Stack

Next.js 15, React 19, Tailwind CSS, GitHub API

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup** (optional - works with dummy content without these)
   
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_personal_access_token
   NEXT_PUBLIC_GITHUB_OWNER=your_github_username
   NEXT_PUBLIC_GITHUB_REPO=your_repository_name
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## Configuration

### GitHub Token Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate Personal Access token with `repo` permissions
3. Add to `.env.local`

### Repository Structure

Content is stored in `contents/` directory:
```
your-repo/
└── contents/
    ├── hello.md
    └── your-posts.md
```

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server

## Links

- 🌐 **Live Site**: [Add your deployed URL here]
- 📁 **Content Repository**: [Add your GitHub content repository URL here]

---
