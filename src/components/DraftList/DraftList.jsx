import { FileText, Edit2, Trash2, Upload } from "lucide-react";

export default function DraftList({ 
  drafts, 
  loading, 
  onEdit, 
  onDelete, 
  onPublishAll 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Draft Posts</h2>
          <button
            onClick={onPublishAll}
            disabled={loading || drafts.length === 0}
            className="flex items-center px-4 py-2 bg-green-200 text-green-800 rounded-lg hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-4 h-4 mr-2" />
            {loading ? "Publishing..." : "Publish All"}
          </button>
        </div>
      </div>

      <div className="p-6">
        {drafts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No drafts yet. Create your first draft!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {draft.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {draft.body.substring(0, 100)}...
                    </p>
                    <p className="text-xs text-gray-400">
                      Created:{" "}
                      {new Date(draft.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => onEdit(draft)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit draft"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(draft.id)}
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
  );
}
