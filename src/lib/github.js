import dummyContent from './dummyContent';

const GITHUB_API_BASE = 'https://api.github.com';


export async function fetchGitHubContent() {
  // Without proper config, show dummy content
  if (!process.env.NEXT_PUBLIC_GITHUB_TOKEN || !process.env.NEXT_PUBLIC_GITHUB_OWNER || !process.env.NEXT_PUBLIC_GITHUB_REPO) {
    // console.log("TOKEN :::", process.env.NEXT_PUBLIC_GITHUB_TOKEN);
    console.log('showing dummy content :::');
    return dummyContent;
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/contents/contents/hello.md`, {
    headers: {
        'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
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
    return dummyContent; // Fallback to dmmy content
  }
}

export async function publishToGitHub(drafts) {
  
  if (!process.env.NEXT_PUBLIC_GITHUB_TOKEN || !process.env.NEXT_PUBLIC_GITHUB_OWNER || !process.env.NEXT_PUBLIC_GITHUB_REPO) {
    console.log('Simulating publish to GitHub...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, message: 'Published successfully (dummy)' };
  }

  try {
    const publishPromises = drafts.map(async (draft) => {
      const filename = `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      const content = `# ${draft.title}\n\n${draft.body}`;
      const encodedContent = btoa(unescape(encodeURIComponent(content)));

      const response = await fetch(`${GITHUB_API_BASE}/repos/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/contents/contents/${filename}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
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