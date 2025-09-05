import { Github } from 'lucide-react';

const Header = () => {
  return (
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
  )
}

export default Header