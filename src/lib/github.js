import dummyContent from './dummyContent';

const GITHUB_API_BASE = 'https://api.github.com';

export async function fetchGitHubContent() {
  // Without proper config, show dummy content
  if (!process.env.NEXT_PUBLIC_GITHUB_TOKEN || !process.env.NEXT_PUBLIC_GITHUB_OWNER || !process.env.NEXT_PUBLIC_GITHUB_REPO) {
    console.log('showing dummy content :::');
    return dummyContent;
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/repos/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/contents/contents/hello.md`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'github-content-manager',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = atob(data.content);
    console.log("CONTENT :::", content);
    return content;
  } catch (error) {
    console.error('Error fetching GitHub content:', error);
    return dummyContent;
  }
}

export async function publishToGitHub(drafts) {
  if (!process.env.NEXT_PUBLIC_GITHUB_TOKEN || !process.env.NEXT_PUBLIC_GITHUB_OWNER || !process.env.NEXT_PUBLIC_GITHUB_REPO) {
    console.log('Simulating publish to GitHub...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true, message: 'Published successfully (dummy)' };
  }

  // Process files sequentially to avoid race conditions
  const results = [];
  const errors = [];

  for (const draft of drafts) {
    try {
      // Create filename
      const filename = `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      const content = `# ${draft.title}\n\n${draft.body}`;
      const encodedContent = btoa(content);

      // Check if file exists and get SHA
      let sha = null;
      let fileExists = false;

      try {
        const checkResponse = await fetch(`${GITHUB_API_BASE}/repos/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/contents/contents/${filename}`, {
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'github-content-manager',
          },
        });

        if (checkResponse.ok) {
          const existingFile = await checkResponse.json();
          sha = existingFile.sha;
          fileExists = true;
          console.log(`File ${filename} exists with SHA: ${sha}`);
        } else if (checkResponse.status === 404) {
          console.log(`File ${filename} doesn't exist, will create new`);
        } else {
          console.warn(`Unexpected response when checking file: ${checkResponse.status}`);
        }
      } catch (checkError) {
        console.log(`Error checking file existence: ${checkError.message}`);
      }

      // Prepare request body
      const requestBody = {
        message: `${fileExists ? 'Update' : 'Add'} post: ${draft.title}`,
        content: encodedContent,
        branch: 'main'
      };

      // Add SHA for updates
      if (fileExists && sha) {
        requestBody.sha = sha;
      }

      // Publish/update the file
      const response = await fetch(`${GITHUB_API_BASE}/repos/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/contents/contents/${filename}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'github-content-manager',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle 409 conflict by retrying with fresh SHA
        if (response.status === 409) {
          console.log(`Conflict detected for ${filename}, retrying with fresh SHA...`);
          
          try {
            // Get the latest SHA
            const freshCheckResponse = await fetch(`${GITHUB_API_BASE}/repos/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/contents/contents/${filename}`, {
              headers: {
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'github-content-manager',
              },
            });

            if (freshCheckResponse.ok) {
              const freshFile = await freshCheckResponse.json();
              requestBody.sha = freshFile.sha;
              
              // Retry the request
              const retryResponse = await fetch(`${GITHUB_API_BASE}/repos/${process.env.NEXT_PUBLIC_GITHUB_OWNER}/${process.env.NEXT_PUBLIC_GITHUB_REPO}/contents/contents/${filename}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                  'Accept': 'application/vnd.github.v3+json',
                  'Content-Type': 'application/json',
                  'User-Agent': 'github-content-manager',
                },
                body: JSON.stringify(requestBody),
              });

              if (retryResponse.ok) {
                console.log(`Successfully published: ${filename} (after retry)`);
                results.push(await retryResponse.json());
                continue;
              } else {
                const retryErrorData = await retryResponse.json();
                throw new Error(`Retry failed: ${retryResponse.status} - ${retryErrorData.message}`);
              }
            } else {
              throw new Error(`Failed to fetch fresh SHA: ${freshCheckResponse.status}`);
            }
          } catch (retryError) {
            throw new Error(`Conflict resolution failed: ${retryError.message}`);
          }
        } else {
          throw new Error(`${response.status} - ${errorData.message || 'Unknown error'}`);
        }
      } else {
        console.log(`Successfully published: ${filename}`);
        results.push(await response.json());
      }

    } catch (error) {
      console.error(`Error publishing ${draft.title}:`, error);
      errors.push({ 
        draft: draft.title, 
        error: error.message 
      });
    }
  }

  if (errors.length > 0) {
    console.error('Publishing errors:', errors);
    const errorMessage = `Failed to publish ${errors.length} file(s): ${errors.map(e => `${e.draft} (${e.error})`).join(', ')}`;
    throw new Error(errorMessage);
  }

  return { 
    success: true, 
    message: `Successfully published ${results.length} file(s)` 
  };
}