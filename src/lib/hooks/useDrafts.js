import { useState, useEffect } from 'react';
import { publishToGitHub } from '../github';

export function useDrafts(showMessage) {
    
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load drafts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('github-drafts');
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch {
        setDrafts([]);
      }
    }
  }, []);

  // Save drafts when they change
  useEffect(() => {
    localStorage.setItem('github-drafts', JSON.stringify(drafts));
  }, [drafts]);

  const addDraft = (draft) => setDrafts([...drafts, draft]);
  const updateDraft = (id, updated) =>
    setDrafts(drafts.map(d => (d.id === id ? { ...d, ...updated } : d)));
  const deleteDraft = (id) => setDrafts(drafts.filter(d => d.id !== id));

  const publishAll = async () => {
    if (drafts.length === 0) {
      showMessage('error', 'No drafts to publish');
      return;
    }

    if (!window.confirm(`Are you sure you want to publish ${drafts.length} drafts to GitHub?`)) {
      return;
    }

    setLoading(true);
    try {
      await publishToGitHub(drafts);
      setDrafts([]);
      showMessage('success', `Successfully published ${drafts.length} files to GitHub!`);
    } catch (error) {
      console.error('Publish error:', error);
      showMessage('error', 'Failed to publish drafts. Please check your configuration.');
    } finally {
      setLoading(false);
    }
  };


  return { drafts, loading, addDraft, updateDraft, deleteDraft, publishAll };
}