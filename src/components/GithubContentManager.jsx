'use client';
import { useState, useEffect } from 'react';
import { fetchGitHubContent } from '@/lib/github';
import renderMarkdown from '@/lib/utils/markdown';
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';
import Message from '@/components/Message/Message';
import NavigationTabs from '@/components/NavigationTabs/NavigationTabs';
import DraftEditor from '@/components/DraftEditor/DraftEditor';
import DraftList from '@/components/DraftList/DraftList';
import { publishToGitHub } from '@/lib/github';

const GitHubContentManager = () => {

  const [content, setContent] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({ title: '', body: '' });
  const [activeTab, setActiveTab] = useState('content');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);


  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

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

  // Save drafts in local storage when they are modified
  useEffect(() => {
    localStorage.setItem('github-drafts', JSON.stringify(drafts));
  }, [drafts]);

  const addDraft = (draft) => setDrafts([...drafts, draft]);
  const updateDraft = (id, updated) =>
    setDrafts(drafts.map(d => (d.id === id ? { ...d, ...updated } : d)));
  const deleteDraft = (id) => setDrafts(drafts.filter(d => d.id !== id));

  useEffect(() => {
    fetchGitHubContent()
      .then(setContent)
      .catch(() => showMessage('error', 'Failed to fetch content'));
  }, []);

  const handleSubmit = () => {
    if (!formData.title || !formData.body) return showMessage('error', 'Fill in title & body');

    if (isEditing) {
      updateDraft(editingId, { ...formData, updatedAt: new Date().toISOString() });
      setIsEditing(false);
      setEditingId(null);
      showMessage('success', 'Draft updated');
    } else {
      addDraft({ id: Date.now(), ...formData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      showMessage('success', 'Draft created');
    }
    setFormData({ title: '', body: '' });
  };

  const handlePublishAll = async () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <Header />

      {/* Show Message */}
      {message.text && <Message message={message} />}

      {/* Navigation Tabs */}
      <NavigationTabs tabState={[activeTab, setActiveTab]} drafts={drafts} />

      <div className="max-w-6xl mx-auto px-4 pb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'content' && (
            <div className="bg-white rounded-xl shadow-sm p-6 text-gray-900">

              <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Content from GitHub</h2>
                  <span className="text-sm text-gray-500">contents/hello.md</span>
              </div>

              <div className='markdown'> 
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
              </div>
            </div>
          )}

          {activeTab === 'editor' && (
            <DraftEditor
              formData={formData}
              setFormData={setFormData}
              isEditing={isEditing}
              onSubmit={handleSubmit}
              onCancel={() => { setIsEditing(false); setEditingId(null); }}
            />
          )}

          {activeTab === 'drafts' && (
            <DraftList
              drafts={drafts}
              loading={loading}
              onEdit={(draft) => { setFormData(draft); setIsEditing(true); setEditingId(draft.id); setActiveTab('editor'); }}
              onDelete={deleteDraft}
              onPublishAll={handlePublishAll}
            />
          )}
        </div>
        <Sidebar draftsLength={drafts.length} />
      </div>
    </div>
  );
};

export default GitHubContentManager;
