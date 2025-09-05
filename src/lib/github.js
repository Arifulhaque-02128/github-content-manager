// GitHub API integration functions

const GITHUB_API_BASE = 'https://api.github.com';

// Mock content for demonstration
const mockContent = `# Hello World

Welcome to our content management system! This is a sample markdown file fetched from GitHub.

## Features

- Fetch content from GitHub repositories
- Create and manage drafts
- Publish content back to GitHub
- Clean, responsive interface

## Getting Started

Use the form below to create new drafts and publish them to your repository.

## Markdown Support

You can use **bold text**, *italic text*, and even \`inline code\`.

### Lists work too:

- Item 1
- Item 2
- Item 3

Happy writing! 🚀
`;

export async function fetchGitHubContent() {
  // In development mode or without proper config, return mock content
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
    console.log('Using mock content - configure environment variables for GitHub integration');
    return mockContent;
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/content/hello.md`, {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = atob(data.content);
    return content;
  } catch (error) {
    console.error('Error fetching GitHub content:', error);
    return mockContent; // Fallback to mock content
  }
}

export async function publishToGitHub(drafts) {
  // In development mode, simulate publishing
  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
    console.log('Simulating publish to GitHub...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, message: 'Published successfully (mock)' };
  }

  try {
    const publishPromises = drafts.map(async (draft) => {
      const filename = `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      const content = `# ${draft.title}\n\n${draft.body}`;
      const encodedContent = btoa(unescape(encodeURIComponent(content)));

      const response = await fetch(`${GITHUB_API_BASE}/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/content/${filename}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Add new post: ${draft.title}`,
          content: encodedContent,
          branch: 'main'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to publish ${draft.title}: ${response.status}`);
      }

      return response.json();
    });

    await Promise.all(publishPromises);
    return { success: true, message: 'All drafts published successfully' };
  } catch (error) {
    console.error('Error publishing to GitHub:', error);
    throw error;
  }
}