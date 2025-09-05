import { FileText, Plus, Edit2 } from 'lucide-react';

const NavigationTabs = ({tabState, drafts}) => {

  const [activeTab, setActiveTab] = tabState;
  
  return (
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
  )
}

export default NavigationTabs