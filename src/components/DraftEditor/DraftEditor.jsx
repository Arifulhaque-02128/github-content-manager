const DraftEditor = ({ formData, setFormData, isEditing, onSubmit, onCancel }) => (
  <div className="bg-white rounded-xl shadow-sm border p-6 text-gray-900">
    <div className="flex items-center justify-between mb-6">

      <h2 className="text-xl font-semibold">
        {isEditing ? 'Edit Draft' : 'Create New Draft'}
      </h2>

      {isEditing && (
        <button onClick={onCancel} className="text-sm text-green-900 cursor-pointer bg-green-100 hover:bg-green-200 p-2 rounded-lg">
          Cancel Edit
        </button>
      )}

    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter post title..."
          className="w-full px-4 py-3 border rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Body (Markdown)</label>
        <textarea
          rows={12}
          value={formData.body}
          onChange={(e) => setFormData({ ...formData, body: e.target.value })}
          placeholder="Write your content..."
          className="w-full px-4 py-3 border rounded-lg font-mono text-sm"
        />
      </div>

      <button onClick={onSubmit} className="w-full bg-blue-600 text-white py-3 rounded-lg">
        {isEditing ? 'Update Draft' : 'Create Draft'}
      </button>
    </div>
  </div>
);

export default DraftEditor;