import React from 'react'

const Sidebar = ({draftsLength}) => {
  return (
    <div>
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
                <span className="text-gray-700 font-semibold">{draftsLength}</span>
            </div>
            </div>
        </div>
    </div>
  )
}

export default Sidebar