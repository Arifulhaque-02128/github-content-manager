'use client'
import { useState, useEffect } from 'react';
import { FileText, Plus, Edit2, Trash2, Upload, Github, AlertCircle, CheckCircle } from 'lucide-react';
import { fetchGitHubContent, publishToGitHub } from '../lib/github';

const GitHubContentManager = () => {
  const [content, setContent] = useState('');
  const [drafts, setDrafts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', body: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('content');

  // Load drafts from localStorage on mount and fetch GitHub content
  useEffect(() => {
    const savedDrafts = localStorage.getItem('github-drafts');
    if (savedDrafts) {
      try {
        setDrafts(JSON.parse(savedDrafts));
      } catch (error) {
        console.error('Error loading drafts:', error);
        setDrafts([]);
      }
    }
    
    // Fetch content from GitHub
    fetchContent();
  }, []);

  // Save drafts to localStorage whenever drafts change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('github-drafts', JSON.stringify(drafts));
    }
  }, [drafts]);

  const fetchContent = async () => {
    try {
      const githubContent = await fetchGitHubContent();
      setContent(githubContent);
    } catch (error) {
      console.error('Error fetching GitHub content:', error);
      showMessage('error', 'Failed to fetch content from GitHub');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.body.trim()) {
      showMessage('error', 'Please fill in both title and body');
      return;
    }

    if (isEditing) {
      setDrafts(drafts.map(draft => 
        draft.id === editingId 
          ? { ...draft, ...formData, updatedAt: new Date().toISOString() }
          : draft
      ));
      showMessage('success', 'Draft updated successfully');
      setIsEditing(false);
      setEditingId(null);
    } else {
      const newDraft = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setDrafts([...drafts, newDraft]);
      showMessage('success', 'Draft created successfully');
    }

    setFormData({ title: '', body: '' });
  };

  const handleEdit = (draft) => {
    setFormData({ title: draft.title, body: draft.body });
    setIsEditing(true);
    setEditingId(draft.id);
    setActiveTab('editor');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      setDrafts(drafts.filter(draft => draft.id !== id));
      showMessage('success', 'Draft deleted successfully');
    }
  };

  const handleCancelEdit = () => {
    setFormData({ title: '', body: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handlePublishAll = async () => {
    if (drafts.length === 0) {
      showMessage('error', 'No drafts to publish');
      return;
    }

    if (!window.confirm(`Are you sure you want to publish ${drafts.length} draft(s) to GitHub?`)) {
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

  const renderMarkdown = (markdown) => {
    if (typeof window !== 'undefined' && window.marked && window.DOMPurify) {
      const html = window.marked.parse(markdown);
      return window.DOMPurify.sanitize(html);
    }
    
    // Fallback simple markdown to HTML converter
    return markdown
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mb-2">$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
      .replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/\n/gim, '<br>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Load external libraries */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/marked/9.1.2/marked.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.5/purify.min.js"></script>
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Github className="w-8 h-8 text-gray-800" />
              <h1 className="text-2xl font-bold text-gray-900">GitHub Content Manager</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Message Display */}
      {message.text && (
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className={`flex items-center p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text} 
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: 'content', label: 'GitHub Content', icon: FileText },
            { id: 'editor', label: 'Draft Editor', icon: Edit2 },
            { id: 'drafts', label: `Drafts (${drafts.length})`, icon: Plus }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'content' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Content from GitHub</h2>
                  <span className="text-sm text-gray-500">content/hello.md</span>
                </div>
                <div 
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              </div>
            )}

            {activeTab === 'editor' && (
              <div className="bg-white rounded-xl shadow-sm border p-6 text-gray-900">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {isEditing ? 'Edit Draft' : 'Create New Draft'}
                  </h2>
                  {isEditing && (
                    <button
                      onClick={handleCancelEdit}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </div>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter post title..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <div className="block text-sm font-medium text-gray-700 mb-2">
                      Body (Markdown)
                    </div>
                    <textarea
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      placeholder="Write your content in markdown..."
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {isEditing ? 'Update Draft' : 'Create Draft'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'drafts' && (
              <div className="bg-white rounded-xl shadow-sm border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Draft Posts</h2>
                    <button
                      onClick={handlePublishAll}
                      disabled={loading || drafts.length === 0}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {loading ? 'Publishing...' : 'Publish All'}
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {drafts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No drafts yet. Create your first draft!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {drafts.map((draft) => (
                        <div key={draft.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{draft.title}</h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {draft.body.substring(0, 100)}...
                              </p>
                              <p className="text-xs text-gray-400">
                                Created: {new Date(draft.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleEdit(draft)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit draft"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(draft.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete draft"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Repository Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Repository:</span>
                  <span className="text-gray-700 font-mono">{process.env.NEXT_PUBLIC_GITHUB_REPO || 'user/repo'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Branch:</span>
                  <span className="text-gray-700 font-mono">main</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Drafts:</span>
                  <span className="text-gray-700 font-semibold">{drafts.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Guide</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Fetches content from GitHub repositories</p>
                <p>• Create and manage drafts locally</p>
                <p>• Publish all drafts as Markdown files</p>
                <p>• Clean, accessible interface</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubContentManager;